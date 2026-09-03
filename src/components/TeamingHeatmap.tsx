import React, { useState } from "react";
import { LLMModel, TeamPairBenchmark } from "../types";
import { SUPPORTED_MODELS, PAIR_BENCHMARKS, getTeamBenchmark } from "../data/benchmarkData";
import { BenchmarkLeaderboardData, PairRankingItem, ModelRankingItem } from "../types/benchmark";
import { 
  Trophy, 
  Flame, 
  ChevronRight, 
  Zap, 
  Target, 
  Clock, 
  Database, 
  RefreshCw, 
  TrendingUp, 
  Award,
  Layers,
  Sparkles,
  CheckCircle2
} from "lucide-react";

interface TeamingHeatmapProps {
  currentAlphaId: string;
  currentBetaId: string;
  onSelectPair: (alphaId: string, betaId: string) => void;
  leaderboardData?: BenchmarkLeaderboardData | null;
  onSyncFirestore?: () => Promise<void>;
  isSyncingFirestore?: boolean;
}

export const TeamingHeatmap: React.FC<TeamingHeatmapProps> = ({
  currentAlphaId,
  currentBetaId,
  onSelectPair,
  leaderboardData,
  onSyncFirestore,
  isSyncingFirestore = false,
}) => {
  const [viewMode, setViewMode] = useState<"leaderboard" | "models" | "matrix">("leaderboard");
  const [filterTier, setFilterTier] = useState<"all" | "free">("all");

  // Fallback pairs if leaderboardData not ready
  const fallbackPairs = Object.entries(PAIR_BENCHMARKS)
    .map(([key, benchmark]) => {
      const [alphaId, betaId] = key.split("_");
      return {
        key,
        alphaModelId: alphaId,
        betaModelId: betaId,
        alphaName: benchmark.agentAlpha,
        betaName: benchmark.agentBeta,
        runsCount: 1,
        winCount: 1,
        winRate: 100,
        avgAccuracy: benchmark.accuracyScore,
        avgEfficiencyIndex: benchmark.efficiencyIndex,
        avgTimeToConsensusSec: benchmark.timeToConsensusSec,
        avgTokens: benchmark.totalTokens,
        ratingTier: benchmark.ratingTier,
        teamworkSpecialty: benchmark.teamworkSpecialty,
        recommendedProtocol: benchmark.recommendedProtocol,
      } as PairRankingItem;
    })
    .sort((a, b) => b.avgEfficiencyIndex - a.avgEfficiencyIndex);

  const activePairs: PairRankingItem[] = (leaderboardData && leaderboardData.topPairs && leaderboardData.topPairs.length > 0)
    ? leaderboardData.topPairs
    : fallbackPairs;

  const activeModels: ModelRankingItem[] = (leaderboardData && leaderboardData.modelRankings)
    ? leaderboardData.modelRankings
    : [];

  const filteredPairs = filterTier === "free"
    ? activePairs.filter(p => p.alphaModelId.includes(":free") || p.betaModelId.includes(":free") || p.alphaModelId.includes("free") || p.betaModelId.includes("free"))
    : activePairs;

  const filteredModels = filterTier === "free"
    ? activeModels.filter(m => m.isFree)
    : activeModels;

  const matrixModels = SUPPORTED_MODELS.slice(0, 6);

  const getHeatmapColor = (score: number) => {
    if (score >= 60) return "bg-emerald-600/90 text-white font-bold shadow-sm shadow-emerald-500/20";
    if (score >= 30) return "bg-teal-600/85 text-white font-semibold";
    if (score >= 20) return "bg-cyan-600/80 text-white font-medium";
    if (score >= 12) return "bg-blue-600/75 text-blue-50 font-medium";
    return "bg-slate-800 text-slate-300";
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm transition-all">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span>Multi-Agent Empirical Benchmark Matrix</span>
              {leaderboardData && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800/60 font-mono font-normal lowercase">
                  <Database className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{leaderboardData.totalRuns} runs in firestore</span>
                </span>
              )}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real benchmark runs sourced directly from Firestore. Ranked by Consensus Efficiency Index:{" "}
            <code className="text-cyan-300 font-mono">[(Accuracy ÷ (Time × Tokens)) × 10,000]</code>
          </p>
        </div>

        {/* Action & Toggle Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sync Button */}
          {onSyncFirestore && (
            <button
              onClick={onSyncFirestore}
              disabled={isSyncingFirestore}
              title="Sync newest runs from Firestore collection"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 text-cyan-400 ${isSyncingFirestore ? "animate-spin" : ""}`} />
              <span>{isSyncingFirestore ? "Syncing..." : "Sync Firestore"}</span>
            </button>
          )}

          {/* Tier filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setFilterTier("all")}
              className={`px-2.5 py-0.5 text-[11px] font-semibold rounded transition-all ${
                filterTier === "all" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterTier("free")}
              className={`px-2.5 py-0.5 text-[11px] font-semibold rounded transition-all ${
                filterTier === "free" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Free
            </button>
          </div>

          {/* View Modes */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode("leaderboard")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === "leaderboard" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Top Pairs
            </button>
            <button
              onClick={() => setViewMode("models")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === "models" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Best Models
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                viewMode === "matrix" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              2D Heatmap
            </button>
          </div>
        </div>
      </div>

      {/* 1. TOP PAIRINGS VIEW */}
      {viewMode === "leaderboard" && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredPairs.slice(0, 9).map((pair, idx) => {
            const isCurrent = currentAlphaId === pair.alphaModelId && currentBetaId === pair.betaModelId;
            return (
              <button
                key={pair.key || `pair-${idx}`}
                onClick={() => onSelectPair(pair.alphaModelId, pair.betaModelId)}
                className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group cursor-pointer ${
                  isCurrent
                    ? "bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/50"
                    : "bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850/60"
                }`}
              >
                {/* Highlight badge for #1 */}
                {idx === 0 && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-bl-lg flex items-center gap-1 shadow-sm">
                    <Flame className="w-3 h-3 fill-slate-950" /> #1 EFFICIENCY
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-mono font-bold text-slate-300 flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                      {pair.alphaName} <span className="text-cyan-400">+</span> {pair.betaName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span className="font-mono font-bold text-amber-300">{pair.avgEfficiencyIndex} pts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-emerald-400" />
                    <span>{pair.avgAccuracy}% acc</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>{pair.avgTimeToConsensusSec}s</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 text-[10px]">
                    {pair.runsCount > 1 ? `${pair.runsCount} live runs (${pair.winRate}% win rate)` : `${pair.ratingTier} Tier`}
                  </span>
                  <span className="text-blue-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px]">
                    {isCurrent ? "Equipped" : "Equip"} <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. BEST INDIVIDUAL MODELS VIEW */}
      {viewMode === "models" && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredModels.slice(0, 12).map((m, idx) => {
            const isAlpha = currentAlphaId === m.id;
            const isBeta = currentBetaId === m.id;
            return (
              <div
                key={m.id}
                className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-mono font-bold text-slate-300 flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-white line-clamp-1">{m.name}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                      m.efficiencyTier === "S" ? "bg-purple-950 text-purple-300 border border-purple-800/50" :
                      m.efficiencyTier === "A" ? "bg-blue-950 text-blue-300 border border-blue-800/50" :
                      "bg-slate-900 text-slate-300 border border-slate-800"
                    }`}>
                      Tier {m.efficiencyTier}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2">
                    <span className="text-cyan-400">{m.provider}</span>
                    <span>•</span>
                    <span>{m.runsCount} runs recorded</span>
                    {m.isFree && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">FREE</span>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 bg-slate-900/90 p-2 rounded-lg border border-slate-800/80 text-[10px] text-center">
                    <div>
                      <div className="text-slate-400">Win Rate</div>
                      <div className="font-mono font-bold text-emerald-400">{m.winRate}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Efficiency</div>
                      <div className="font-mono font-bold text-amber-300">{m.avgEfficiencyIndex}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Latency</div>
                      <div className="font-mono font-bold text-blue-300">{m.avgLatencySec}s</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 line-clamp-1">{m.teamRole}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onSelectPair(m.id, currentBetaId)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                        isAlpha ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
                      }`}
                    >
                      {isAlpha ? "Alpha ✓" : "+ Alpha"}
                    </button>
                    <button
                      onClick={() => onSelectPair(currentAlphaId, m.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                        isBeta ? "bg-purple-600 text-white" : "bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
                      }`}
                    >
                      {isBeta ? "Beta ✓" : "+ Beta"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. 2D HEATMAP MATRIX VIEW */}
      {viewMode === "matrix" && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-slate-500 font-mono text-[10px] uppercase">
                  Alpha (Row) \ Beta (Col)
                </th>
                {matrixModels.map((m) => (
                  <th key={m.id} className="p-2 font-semibold text-slate-300 text-center whitespace-nowrap">
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixModels.map((rowModel) => (
                <tr key={rowModel.id} className="border-t border-slate-800/60">
                  <td className="p-2 font-semibold text-slate-200 whitespace-nowrap bg-slate-950/40">
                    {rowModel.name}
                  </td>
                  {matrixModels.map((colModel) => {
                    const benchmark = getTeamBenchmark(rowModel.id, colModel.id);
                    const isSelected = currentAlphaId === rowModel.id && currentBetaId === colModel.id;
                    return (
                      <td key={colModel.id} className="p-1 text-center">
                        <button
                          onClick={() => onSelectPair(rowModel.id, colModel.id)}
                          title={`${rowModel.name} + ${colModel.name}: ${benchmark.efficiencyIndex} pts (Acc: ${benchmark.accuracyScore}%, ${benchmark.timeToConsensusSec}s)`}
                          className={`w-full py-2 px-1 rounded-md transition-all font-mono text-xs ${getHeatmapColor(
                            benchmark.efficiencyIndex
                          )} ${
                            isSelected
                              ? "ring-2 ring-white scale-105 z-10 shadow-lg"
                              : "hover:opacity-90 hover:scale-102"
                          }`}
                        >
                          {benchmark.efficiencyIndex}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Cell value indicates Consensus Efficiency Index pts.</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-600 inline-block" /> 60+ Optimal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-teal-600 inline-block" /> 30-59 High
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-cyan-600 inline-block" /> 20-29 Solid
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> &lt;20 Baseline
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
