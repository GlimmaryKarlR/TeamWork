/**
 * Benchmark Run Record and Rankings Types
 * Mirroring and extending DualBlind AI Benchmark Firestore schema
 */

export interface FirestoreAgentConfig {
  brand?: string;
  name?: string;
  model: string;
  provider?: string;
  id?: string;
}

export interface FirestoreRunMetrics {
  totalWallClockMs?: number;
  totalTokens?: number;
  totalInputTokens?: number;
  totalOutputTokens?: number;
  totalCostUsd?: number;
  costPerTurnUsd?: number;
  burnRateUsdPerMin?: number;
  tokensPerSec?: number;
  turnsCount?: number;
  consensusTurn?: number | null;
  efficiencyIndex?: number;
  consensusReached?: boolean;
  accuracyScore?: number;
  isCorrect?: boolean;
  teamFunctionality?: string;
  isInfiniteLoopDetected?: boolean;
}

export interface BenchmarkRunDoc {
  id: string;
  problemId?: string;
  problemTitle?: string;
  topic?: string;
  difficulty?: string;
  date?: string;
  agentAConfig?: FirestoreAgentConfig;
  agentBConfig?: FirestoreAgentConfig;
  turns?: any[];
  consensusStatus?: string;
  finalAgreedAnswer?: string | null;
  metrics?: FirestoreRunMetrics;
  updatedAt?: string;
}

export interface ModelRankingItem {
  id: string;
  name: string;
  brand: string;
  provider: string;
  runsCount: number;
  winCount: number;
  winRate: number; // 0 - 100 (%)
  avgAccuracy: number; // 0 - 100 (%)
  avgEfficiencyIndex: number;
  avgTokens: number;
  avgLatencySec: number;
  efficiencyTier: "S" | "A" | "B" | "C";
  isFree?: boolean;
  strengths: string[];
  teamRole: string;
}

export interface PairRankingItem {
  key: string;
  alphaModelId: string;
  betaModelId: string;
  alphaName: string;
  betaName: string;
  runsCount: number;
  winCount: number;
  winRate: number; // 0 - 100 (%)
  avgAccuracy: number;
  avgEfficiencyIndex: number;
  avgTimeToConsensusSec: number;
  avgTokens: number;
  ratingTier: "Optimal" | "High" | "Solid" | "Moderate";
  teamworkSpecialty: string;
  recommendedProtocol: string;
}

export interface BenchmarkLeaderboardData {
  totalRuns: number;
  modelRankings: ModelRankingItem[];
  pairRankings: PairRankingItem[];
  topPairs: PairRankingItem[];
  lastUpdated: string;
  dataSource: "firestore" | "cache" | "hybrid";
  lastSyncError?: string | null;
}
