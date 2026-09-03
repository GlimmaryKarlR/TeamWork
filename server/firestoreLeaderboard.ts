import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, Firestore } from "firebase/firestore";
import { BenchmarkRunDoc, BenchmarkLeaderboardData, ModelRankingItem, PairRankingItem } from "../src/types/benchmark.js";
import { extractProvider, getTeamRoleForModel } from "../src/data/openRouterModels.js";
import { LLMModel } from "../src/types.js";

let moduleDir = process.cwd();
try {
  moduleDir = path.dirname(fileURLToPath(import.meta.url));
} catch {
  moduleDir = process.cwd();
}

const CACHE_FILE = path.join(process.cwd(), "data", "benchmark_runs_cache.json");

// Memory caches
const runsCache = new Map<string, BenchmarkRunDoc>();
let firebaseDb: Firestore | null = null;
let lastFirestoreSyncAttempt = 0;
let lastSyncError: string | null = null;
let lastSyncSuccessTime: string | null = null;
let cachedLeaderboard: BenchmarkLeaderboardData | null = null;

export function getDb(): Firestore | null {
  if (firebaseDb) return firebaseDb;
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (!fs.existsSync(configPath)) {
      console.warn("[Firestore Engine] firebase-applet-config.json not found, using cached benchmark data.");
      return null;
    }
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    const databaseId = config.firestoreDatabaseId || "(default)";
    firebaseDb = getFirestore(app, databaseId);
    return firebaseDb;
  } catch (e: any) {
    console.warn("[Firestore Engine] Firebase initialization error:", e?.message || e);
    return null;
  }
}

export function loadCacheFromDisk(): void {
  try {
    const candidates = [
      CACHE_FILE,
      path.join(process.cwd(), "data", "benchmark_runs_cache.json"),
      path.join(moduleDir, "..", "data", "benchmark_runs_cache.json"),
      path.join("/Users/karlroesch/Desktop/karl/VSworking/dualblind/dualblind-ai-benchmark/graphics/jsons/dualblind-all-1213-runs-1788451369638.json")
    ];

    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          list.forEach((item) => {
            if (item && item.id) {
              runsCache.set(String(item.id), item);
            }
          });
          console.log(`[Firestore Engine] Loaded ${runsCache.size} benchmark runs from ${filePath}`);
          cachedLeaderboard = null;
          return;
        }
      }
    }
  } catch (e: any) {
    console.warn("[Firestore Engine] Failed reading disk cache:", e?.message || e);
  }
}

export function persistCacheToDisk(): void {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const list = Array.from(runsCache.values());
    fs.writeFileSync(CACHE_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (e: any) {
    console.warn("[Firestore Engine] Failed writing disk cache:", e?.message || e);
  }
}

export async function syncFromFirestore(force = false): Promise<number> {
  const now = Date.now();
  // Throttle queries to once every 10 minutes unless forced
  if (!force && now - lastFirestoreSyncAttempt < 10 * 60 * 1000) {
    return runsCache.size;
  }
  lastFirestoreSyncAttempt = now;

  const db = getDb();
  if (!db) return runsCache.size;

  try {
    console.log("[Firestore Engine] Syncing newest runs from Firestore collection \"benchmark_runs\"... ");
    const snapshot = await getDocs(collection(db, "benchmark_runs"));
    let newCount = 0;
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as BenchmarkRunDoc;
      const id = docSnap.id || data.id;
      if (id) {
        if (!runsCache.has(String(id))) {
          newCount++;
        }
        runsCache.set(String(id), { ...data, id: String(id) });
      }
    });

    lastSyncError = null;
    lastSyncSuccessTime = new Date().toISOString();
    console.log(`[Firestore Engine] Firestore sync completed: ${newCount} new/updated runs (Total: ${runsCache.size})`);
    if (newCount > 0) {
      persistCacheToDisk();
      cachedLeaderboard = null;
    }
    return runsCache.size;
  } catch (err: any) {
    lastSyncError = err?.message || "Firestore quota reached / rate limited";
    console.warn(`[Firestore Engine] Firestore sync notice: ${lastSyncError}. Serving ${runsCache.size} locally cached runs.`);
    return runsCache.size;
  }
}

export function getAllRuns(): BenchmarkRunDoc[] {
  if (runsCache.size === 0) {
    loadCacheFromDisk();
  }
  return Array.from(runsCache.values()).sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0;
    const timeB = b.date ? new Date(b.date).getTime() : 0;
    return timeB - timeA;
  });
}

function cleanModelName(name?: string, modelId?: string): string {
  if (!name && !modelId) return "Unknown Model";
  if (name) {
    const parenMatch = name.match(/\(([^)]+)\)/);
    if (parenMatch && parenMatch[1]) {
      const inside = parenMatch[1].replace(/^[^:]+:\s*/, "").trim();
      if (inside.length > 2) return inside;
    }
    const stripped = name.replace(/^Agent\s+(Alpha|Beta)\s*:?\s*/i, "").trim();
    if (stripped && !/^agent\s+(alpha|beta)$/i.test(stripped)) {
      return stripped;
    }
  }
  if (modelId) {
    const parts = modelId.split("/");
    const last = parts[parts.length - 1];
    return last.replace(/:free$/, "");
  }
  return name || modelId || "Unknown Model";
}

export function computeLeaderboard(): BenchmarkLeaderboardData {
  if (cachedLeaderboard) {
    return cachedLeaderboard;
  }

  const runs = getAllRuns();
  const modelMap = new Map<string, {
    id: string;
    name: string;
    brand: string;
    provider: string;
    runsCount: number;
    winCount: number;
    totalAccuracy: number;
    totalEfficiency: number;
    totalTokens: number;
    totalWallClockMs: number;
  }>();

  const pairMap = new Map<string, {
    key: string;
    alphaModelId: string;
    betaModelId: string;
    alphaName: string;
    betaName: string;
    runsCount: number;
    winCount: number;
    totalAccuracy: number;
    totalEfficiency: number;
    totalTokens: number;
    totalWallClockMs: number;
  }>();

  runs.forEach((r) => {
    const aCfg = r.agentAConfig;
    const bCfg = r.agentBConfig;
    const aModel = aCfg?.model;
    const bModel = bCfg?.model;
    const isCorrect = Boolean(r.metrics?.isCorrect);
    const eff = Number(r.metrics?.efficiencyIndex) || 0;
    const acc = Number(r.metrics?.accuracyScore) || 0;
    const tokens = Number(r.metrics?.totalTokens) || 0;
    const wallMs = Number(r.metrics?.totalWallClockMs) || 0;

    // Track individual models
    [
      { cfg: aCfg, modelId: aModel },
      { cfg: bCfg, modelId: bModel },
    ].forEach(({ cfg, modelId }) => {
      if (!modelId) return;
      if (!modelMap.has(modelId)) {
        modelMap.set(modelId, {
          id: modelId,
          name: cleanModelName(cfg?.name, modelId),
          brand: cfg?.brand || "",
          provider: cfg?.provider || extractProvider(modelId, cfg?.name),
          runsCount: 0,
          winCount: 0,
          totalAccuracy: 0,
          totalEfficiency: 0,
          totalTokens: 0,
          totalWallClockMs: 0,
        });
      }
      const item = modelMap.get(modelId)!;
      item.runsCount++;
      if (isCorrect) item.winCount++;
      item.totalAccuracy += acc;
      item.totalEfficiency += eff;
      item.totalTokens += tokens;
      item.totalWallClockMs += wallMs;
    });

    // Track pair teams
    if (aModel && bModel) {
      const pairKey = `${aModel}__${bModel}`;
      if (!pairMap.has(pairKey)) {
        pairMap.set(pairKey, {
          key: pairKey,
          alphaModelId: aModel,
          betaModelId: bModel,
          alphaName: cleanModelName(aCfg?.name, aModel),
          betaName: cleanModelName(bCfg?.name, bModel),
          runsCount: 0,
          winCount: 0,
          totalAccuracy: 0,
          totalEfficiency: 0,
          totalTokens: 0,
          totalWallClockMs: 0,
        });
      }
      const pair = pairMap.get(pairKey)!;
      pair.runsCount++;
      if (isCorrect) pair.winCount++;
      pair.totalAccuracy += acc;
      pair.totalEfficiency += eff;
      pair.totalTokens += tokens;
      pair.totalWallClockMs += wallMs;
    }
  });

  // Convert model stats to rankings
  const modelRankings: ModelRankingItem[] = Array.from(modelMap.values())
    .filter((m) => m.runsCount > 0)
    .map((m) => {
      const avgEff = Math.round(m.totalEfficiency / m.runsCount);
      const avgAcc = Math.round(m.totalAccuracy / m.runsCount);
      const winRate = Math.round((m.winCount / m.runsCount) * 100);
      const avgTokens = Math.round(m.totalTokens / m.runsCount);
      const avgLatencySec = +(m.totalWallClockMs / m.runsCount / 1000).toFixed(1);

      let efficiencyTier: "S" | "A" | "B" | "C" = "B";
      if (avgEff >= 40 || (winRate >= 90 && avgEff >= 20)) efficiencyTier = "S";
      else if (avgEff >= 20 || winRate >= 85) efficiencyTier = "A";
      else if (avgEff >= 12 || winRate >= 75) efficiencyTier = "B";
      else efficiencyTier = "C";

      const isFree = m.id.includes(":free") || m.id.includes("openrouter/free");

      return {
        id: m.id,
        name: m.name,
        brand: m.brand || m.provider,
        provider: m.provider,
        runsCount: m.runsCount,
        winCount: m.winCount,
        winRate,
        avgAccuracy: avgAcc,
        avgEfficiencyIndex: avgEff,
        avgTokens,
        avgLatencySec,
        efficiencyTier,
        isFree,
        strengths: [
          `${winRate}% Win Rate`,
          `${avgEff} pts Efficiency`,
          `${avgLatencySec}s Avg Latency`,
        ],
        teamRole: getTeamRoleForModel(m.id, m.name),
      };
    })
    .sort((a, b) => {
      // Primary: Efficiency index, Secondary: Win rate, Tertiary: total runs
      if (b.avgEfficiencyIndex !== a.avgEfficiencyIndex) {
        return b.avgEfficiencyIndex - a.avgEfficiencyIndex;
      }
      if (b.winRate !== a.winRate) {
        return b.winRate - a.winRate;
      }
      return b.runsCount - a.runsCount;
    });

  // Convert pair stats to rankings
  const pairRankings: PairRankingItem[] = Array.from(pairMap.values())
    .filter((p) => p.runsCount >= 1)
    .map((p) => {
      const avgEff = Math.round(p.totalEfficiency / p.runsCount);
      const avgAcc = Math.round(p.totalAccuracy / p.runsCount);
      const winRate = Math.round((p.winCount / p.runsCount) * 100);
      const avgTime = +(p.totalWallClockMs / p.runsCount / 1000).toFixed(1);
      const avgTokens = Math.round(p.totalTokens / p.runsCount);

      let ratingTier: "Optimal" | "High" | "Solid" | "Moderate" = "Solid";
      if (avgEff >= 80 || (avgEff >= 35 && winRate >= 90)) ratingTier = "Optimal";
      else if (avgEff >= 28 || winRate >= 85) ratingTier = "High";
      else if (avgEff >= 18 || winRate >= 75) ratingTier = "Solid";
      else ratingTier = "Moderate";

      return {
        key: p.key,
        alphaModelId: p.alphaModelId,
        betaModelId: p.betaModelId,
        alphaName: p.alphaName,
        betaName: p.betaName,
        runsCount: p.runsCount,
        winCount: p.winCount,
        winRate,
        avgAccuracy: avgAcc,
        avgEfficiencyIndex: avgEff,
        avgTimeToConsensusSec: avgTime,
        avgTokens,
        ratingTier,
        teamworkSpecialty: `Empirical benchmark pair with ${p.runsCount} recorded trial(s) and ${winRate}% consensus convergence.`,
        recommendedProtocol: avgEff >= 30 ? "debate_synthesize" : "lead_verifier",
      };
    })
    .sort((a, b) => {
      if (b.avgEfficiencyIndex !== a.avgEfficiencyIndex) {
        return b.avgEfficiencyIndex - a.avgEfficiencyIndex;
      }
      return b.winRate - a.winRate;
    });

  cachedLeaderboard = {
    totalRuns: runs.length,
    modelRankings,
    pairRankings,
    topPairs: pairRankings.slice(0, 50),
    lastUpdated: lastSyncSuccessTime || new Date().toISOString(),
    dataSource: lastSyncError ? "cache" : (lastSyncSuccessTime ? "firestore" : "hybrid"),
    lastSyncError,
  };

  return cachedLeaderboard;
}

// Initial cache load
loadCacheFromDisk();

// Kick off initial sync in background
setTimeout(() => {
  syncFromFirestore(false).catch(() => {});
}, 3000);
