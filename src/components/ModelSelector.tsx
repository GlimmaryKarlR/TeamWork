import React, { useMemo, useState } from 'react';
import { LLMModel } from '../types';
import { getRadarProfileForTeam } from '../data/radarData';
import { TeamRadarChart } from './TeamRadarChart';
import { Gift, RefreshCw, Search, Sparkles } from 'lucide-react';

interface ModelSelectorProps {
  alphaModel: LLMModel;
  betaModel: LLMModel;
  models: LLMModel[];
  tierFilter: 'all' | 'free';
  onAlphaChange: (model: LLMModel) => void;
  onBetaChange: (model: LLMModel) => void;
  onRefreshModels: () => void;
  isRefreshingModels: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  alphaModel,
  betaModel,
  models,
  tierFilter,
  onAlphaChange,
  onBetaChange,
  onRefreshModels,
  isRefreshingModels,
}) => {
  const [searchAlpha, setSearchAlpha] = useState('');
  const [searchBeta, setSearchBeta] = useState('');

  // Compute radar profile for current pairing
  const profile = getRadarProfileForTeam(alphaModel.id, betaModel.id);

  // Available models depending on tier filter
  const baseModels = useMemo(() => {
    return tierFilter === 'free' ? models.filter((m) => m.isFree) : models;
  }, [models, tierFilter]);

  // Group models by provider for intuitive selection
  const groupModels = (list: LLMModel[]) => {
    const groups: Record<string, LLMModel[]> = {};
    list.forEach((m) => {
      const p = m.provider || 'Other';
      if (!groups[p]) groups[p] = [];
      groups[p].push(m);
    });
    return groups;
  };

  const alphaFiltered = useMemo(() => {
    if (!searchAlpha.trim()) return baseModels;
    const q = searchAlpha.toLowerCase();
    return baseModels.filter(
      (m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)
    );
  }, [baseModels, searchAlpha]);

  const betaFiltered = useMemo(() => {
    if (!searchBeta.trim()) return baseModels;
    const q = searchBeta.toLowerCase();
    return baseModels.filter(
      (m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)
    );
  }, [baseModels, searchBeta]);

  const alphaGroups = useMemo(() => groupModels(alphaFiltered), [alphaFiltered]);
  const betaGroups = useMemo(() => groupModels(betaFiltered), [betaFiltered]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 shadow-sm">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Team Proposed
          </h2>
          {tierFilter === 'free' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
              <Gift className="w-2.5 h-2.5" /> Free Tier Active
            </span>
          )}
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
            ({models.length} Models Loaded)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-models-selector"
            type="button"
            onClick={onRefreshModels}
            disabled={isRefreshingModels}
            title="Refresh full catalog from OpenRouter"
            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-300 px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 text-blue-400 ${isRefreshingModels ? 'animate-spin' : ''}`} />
            <span>Refresh Models</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Agent Alpha Model Dropdown */}
        <div className="flex-1 w-full bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold uppercase tracking-wider">
              <span className="w-5 h-5 rounded bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                α
              </span>
              <span>Agent Alpha</span>
            </div>
            {alphaModel.isFree && (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                FREE
              </span>
            )}
          </div>

          {/* Quick search filter - always visible */}
          <div className="relative my-0.5">
            <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
            <input
              type="text"
              value={searchAlpha}
              onChange={(e) => setSearchAlpha(e.target.value)}
              placeholder="Filter Alpha models..."
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 pl-6 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            id="agent-alpha-select"
            value={alphaModel.id}
            onChange={(e) => {
              const m = models.find((mod) => mod.id === e.target.value);
              if (m) onAlphaChange(m);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {/* If currently selected model is filtered out, keep it visible */}
            {!alphaFiltered.some((m) => m.id === alphaModel.id) && (
              <option value={alphaModel.id} className="bg-slate-900 text-white">
                {alphaModel.name} ({alphaModel.provider}) {alphaModel.isFree ? '• FREE' : ''}
              </option>
            )}

            {Object.entries(alphaGroups).map(([provider, pModels]) => (
              <optgroup key={`alpha-${provider}`} label={provider} className="bg-slate-950 text-slate-400 font-bold">
                {pModels.map((model) => (
                  <option key={model.id} value={model.id} className="bg-slate-900 text-white">
                    {model.name} {model.isFree ? '• FREE' : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Center: Team Benchmark Radar Graphic */}
        <div className="shrink-0 flex flex-col items-center justify-center px-2 py-1">
          <TeamRadarChart
            alphaModel={alphaModel}
            betaModel={betaModel}
            profile={profile}
            size={190}
          />
        </div>

        {/* Agent Beta Model Dropdown */}
        <div className="flex-1 w-full bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              <span className="w-5 h-5 rounded bg-emerald-600/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                β
              </span>
              <span>Agent Beta</span>
            </div>
            {betaModel.isFree && (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                FREE
              </span>
            )}
          </div>

          {/* Quick search filter - always visible */}
          <div className="relative my-0.5">
            <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
            <input
              type="text"
              value={searchBeta}
              onChange={(e) => setSearchBeta(e.target.value)}
              placeholder="Filter Beta models..."
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 pl-6 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <select
            id="agent-beta-select"
            value={betaModel.id}
            onChange={(e) => {
              const m = models.find((mod) => mod.id === e.target.value);
              if (m) onBetaChange(m);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            {/* If currently selected model is filtered out, keep it visible */}
            {!betaFiltered.some((m) => m.id === betaModel.id) && (
              <option value={betaModel.id} className="bg-slate-900 text-white">
                {betaModel.name} ({betaModel.provider}) {betaModel.isFree ? '• FREE' : ''}
              </option>
            )}

            {Object.entries(betaGroups).map(([provider, pModels]) => (
              <optgroup key={`beta-${provider}`} label={provider} className="bg-slate-950 text-slate-400 font-bold">
                {pModels.map((model) => (
                  <option key={model.id} value={model.id} className="bg-slate-900 text-white">
                    {model.name} {model.isFree ? '• FREE' : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
