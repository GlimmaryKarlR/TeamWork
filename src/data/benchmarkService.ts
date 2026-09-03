import { BenchmarkLeaderboardData, ModelRankingItem, PairRankingItem } from "../types/benchmark";
import { LLMModel } from "../types";
import { extractProvider, getProviderVisualTheme, getTeamRoleForModel } from "./openRouterModels";

const STORAGE_KEY = "teamwork_benchmark_leaderboard_cache";

/**
 * Fetch live benchmark leaderboard from TeamWork backend (which connects to Firestore).
 * Falls back to localStorage cache if backend is temporarily unreachable.
 */
export async function fetchBenchmarkLeaderboard(): Promise<BenchmarkLeaderboardData | null> {
  try {
    const res = await fetch("/api/benchmark/leaderboard");
    if (res.ok) {
      const data: BenchmarkLeaderboardData = await res.json();
      if (data && Array.isArray(data.modelRankings)) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
          // Ignore localStorage quota limits
        }
        return data;
      }
    }
  } catch (e) {
    console.warn("[Benchmark Service] Failed to fetch /api/benchmark/leaderboard, using client fallback:", e);
  }

  // Local storage fallback
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached) as BenchmarkLeaderboardData;
    }
  } catch {
    // Ignore
  }

  return null;
}

/**
 * Trigger explicit sync with Firestore
 */
export async function triggerFirestoreSync(): Promise<{ success: boolean; count: number; data?: BenchmarkLeaderboardData }> {
  const res = await fetch("/api/benchmark/sync", { method: "POST" });
  if (!res.ok) {
    throw new Error(`Sync failed with status ${res.status}`);
  }
  const result = await res.json();
  if (result.data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result.data));
    } catch {}
  }
  return result;
}

/**
 * Convert ModelRankingItem into full LLMModel usable in TeamWork dropdowns and star maps
 */
export function modelRankingToLLMModel(rank: ModelRankingItem): LLMModel {
  const theme = getProviderVisualTheme(rank.provider);
  return {
    id: rank.id,
    name: rank.name,
    brand: rank.brand || rank.provider,
    provider: rank.provider,
    description: `Empirical DualBlind benchmark tested model with ${rank.runsCount} run(s), ${rank.winRate}% consensus win rate, and ${rank.avgEfficiencyIndex} pts efficiency.`,
    strengths: [
      `${rank.winRate}% Win Rate (${rank.runsCount} runs)`,
      `${rank.avgEfficiencyIndex} Efficiency Pts`,
      `${rank.avgAccuracy}% Accuracy`,
      `${rank.avgLatencySec}s Latency`,
    ],
    teamRole: rank.teamRole || getTeamRoleForModel(rank.id, rank.name),
    accentColor: theme.accentColor,
    lightBg: theme.lightBg,
    badgeBorder: theme.badgeBorder,
    efficiencyTier: rank.efficiencyTier,
    contextWindow: rank.id.includes("128k") ? "128K tokens" : (rank.id.includes("1m") ? "1M tokens" : "64K tokens"),
    isFree: rank.isFree,
  };
}
