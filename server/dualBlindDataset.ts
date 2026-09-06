import { RadarCategory, bucketChallengeType } from "../src/data/radarData.js";

const DATASET_BASE_URL = "https://huggingface.co/datasets/GlimmaryKarl/DualBlind/resolve/main/data";
const CACHE_DURATION_MS = 15 * 60 * 1000;

interface DualBlindRecord {
  suite?: string;
  topic?: string;
  domain?: string;
  model?: string;
}

export interface DatasetTeamRecommendation {
  domain: RadarCategory;
  alphaModelId: string;
  betaModelId: string;
  reasoning: string;
  isFreeTier: boolean;
  verifiedRuns: number;
  source: "huggingface-dualblind";
}

let cachedRecords: DualBlindRecord[] | null = null;
let lastFetchTime = 0;

function normalizeModelId(value: string): string {
  const model = value.toLowerCase().trim();
  if (model.includes("gemini")) return "gemini-3.7-flash";
  if (model.includes("claude")) return "claude-3-7-sonnet";
  if (model.includes("gpt-4o")) return "gpt-4o";
  if (model.includes("o3-mini")) return "o3-mini";
  if (model.includes("deepseek") && model.includes("v3")) return "deepseek-v3";
  if (model.includes("deepseek") || model.includes("r1")) return "deepseek-r1";
  if (model.includes("qwen")) return "qwen-2.5-72b";
  if (model.includes("llama")) return "llama-3.3-70b";
  if (model.includes("nemotron")) return "nemotron-3-30b";
  if (model.includes("mistral")) return "mistral-large-2";
  if (model.includes("nova")) return "nova-lite";
  return model;
}

function parsePair(value?: string): [string, string] | null {
  if (!value) return null;
  const parts = value.split("+").map(normalizeModelId).filter(Boolean);
  return parts.length >= 2 ? [parts[0], parts[1]] : null;
}

function isFreeModel(id: string): boolean {
  return ["deepseek-r1", "deepseek-v3", "qwen-2.5-72b", "llama-3.3-70b", "nemotron-3-30b", "mistral-large-2"].includes(id);
}

async function loadRecords(): Promise<DualBlindRecord[]> {
  const now = Date.now();
  if (cachedRecords && now - lastFetchTime < CACHE_DURATION_MS) return cachedRecords;

  const response = await fetch(`${DATASET_BASE_URL}/sft_reasoning_train.jsonl`);
  if (!response.ok) throw new Error(`DualBlind dataset returned ${response.status}`);

  const text = await response.text();
  const records = text.split("\n").flatMap((line) => {
    if (!line.trim()) return [];
    try {
      const record = JSON.parse(line) as DualBlindRecord;
      return record.model ? [record] : [];
    } catch {
      return [];
    }
  });

  cachedRecords = records;
  lastFetchTime = now;
  return records;
}

export async function recommendFromDualBlind(
  prompt: string,
  onlyFreeTier = false
): Promise<DatasetTeamRecommendation | null> {
  const records = await loadRecords();
  const domain = bucketChallengeType(prompt);
  const pairCounts = new Map<string, { pair: [string, string]; count: number }>();

  for (const record of records) {
    const recordDomain = bucketChallengeType(record.domain || record.topic || record.suite);
    if (recordDomain !== domain) continue;

    const pair = parsePair(record.model);
    if (!pair || pair[0] === pair[1] || (onlyFreeTier && (!isFreeModel(pair[0]) || !isFreeModel(pair[1])))) continue;

    const key = pair.join("__");
    const current = pairCounts.get(key);
    pairCounts.set(key, { pair, count: (current?.count || 0) + 1 });
  }

  const best = [...pairCounts.values()].sort((a, b) => b.count - a.count)[0];
  if (!best) return null;

  return {
    domain,
    alphaModelId: best.pair[0],
    betaModelId: best.pair[1],
    reasoning: `Selected from ${best.count} verified DualBlind Hugging Face trial(s) for ${domain}.`,
    isFreeTier: onlyFreeTier,
    verifiedRuns: best.count,
    source: "huggingface-dualblind",
  };
}