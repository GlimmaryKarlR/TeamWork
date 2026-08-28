import React, { useState } from 'react';
import { LLMModel, TeamPairBenchmark } from '../types';
import { SUPPORTED_MODELS, PAIR_BENCHMARKS, getTeamBenchmark } from '../data/benchmarkData';
import { Trophy, Flame, ChevronRight, Zap, Target, Clock, ArrowRightLeft } from 'lucide-react';

interface TeamingHeatmapProps {
  currentAlphaId: string;
  currentBetaId: string;
  onSelectPair: (alphaId: string, betaId: string) => void;
}

export const TeamingHeatmap: React.FC<TeamingHeatmapProps> = ({
  currentAlphaId,
  currentBetaId,
  onSelectPair,
}) => {
  const [viewMode, setViewMode] = useState<'leaderboard' | 'matrix'>('leaderboard');

  // Generate top paired teams list sorted by peak efficiency index
  const topTeams = Object.entries(PAIR_BENCHMARKS)
    .map(([key, benchmark]) => {
      const [alphaId, betaId] = key.split('_');
      return {
        key,
        alphaId,
        betaId,
        benchmark,
      };
    })
    .sort((a, b) => b.benchmark.efficiencyIndex - a.benchmark.efficiencyIndex);

  // Selected models list for the 2D heatmap matrix (top 6 models for clean readability)
  const matrixModels = SUPPORTED_MODELS.slice(0, 6);

  const getHeatmapColor = (score: number) => {
    if (score >= 125) return 'bg-emerald-600/90 text-white font-bold shadow-sm shadow-emerald-500/20';
    if (score >= 110) return 'bg-teal-600/85 text-white font-semibold';
    if (score >= 95) return 'bg-cyan-600/80 text-white font-medium';
    if (score >= 80) return 'bg-blue-600/75 text-blue-50 font-medium';
    return 'bg-slate-800 text-slate-300';
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 mb-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Multi-Agent Teaming Benchmarks
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by Consensus Efficiency Index = <code className="text-slate-300 font-mono">[(Accuracy ÷ (Time × Tokens)) × 10,000]</code>. Click any pair to equip.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setViewMode('leaderboard')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'leaderboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top Pairings Leaderboard
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === 'matrix'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2D Efficiency Heatmap
          </button>
        </div>
      </div>

      {/* Leaderboard View */}
      {viewMode === 'leaderboard' && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {topTeams.slice(0, 6).map(({ alphaId, betaId, benchmark }, idx) => {
            const isCurrent = currentAlphaId === alphaId && currentBetaId === betaId;
            return (
              <button
                key={`${alphaId}-${betaId}`}
                id={`team-pairing-card-${alphaId}-${betaId}`}
                onClick={() => onSelectPair(alphaId, betaId)}
                className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden group ${
                  isCurrent
                    ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/50'
                    : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850/60'
                }`}
              >
                {/* Highlight badge for #1 */}
                {idx === 0 && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-bl-lg flex items-center gap-1 shadow-sm">
                    <Flame className="w-3 h-3 fill-slate-950" /> #1 TOP EFFICIENCY
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-[11px] font-mono font-bold text-slate-300 flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                      {benchmark.agentAlpha} <span className="text-blue-400">+</span> {benchmark.agentBeta}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span className="font-mono font-bold text-amber-300">{benchmark.efficiencyIndex} pts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-emerald-400" />
                    <span>{benchmark.accuracyScore}% acc</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>{benchmark.timeToConsensusSec}s</span>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 line-clamp-1">{benchmark.ratingTier} Team Rating</span>
                  <span className="text-blue-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    {isCurrent ? 'Equipped' : 'Equip'} <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 2D Heatmap Matrix View */}
      {viewMode === 'matrix' && (
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
                              ? 'ring-2 ring-white scale-105 z-10 shadow-lg'
                              : 'hover:opacity-90 hover:scale-102'
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
                <span className="w-3 h-3 rounded bg-emerald-600 inline-block" /> 125+ Optimal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-teal-600 inline-block" /> 110-124 High
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-cyan-600 inline-block" /> 95-109 Solid
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-600 inline-block" /> &lt;95 Baseline
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
