import React from 'react';
import { LLMModel } from '../types';
import { SUPPORTED_MODELS } from '../data/benchmarkData';
import { getRadarProfileForTeam } from '../data/radarData';
import { TeamRadarChart } from './TeamRadarChart';

interface ModelSelectorProps {
  alphaModel: LLMModel;
  betaModel: LLMModel;
  onAlphaChange: (model: LLMModel) => void;
  onBetaChange: (model: LLMModel) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  alphaModel,
  betaModel,
  onAlphaChange,
  onBetaChange,
}) => {
  // Compute radar profile for current pairing
  const profile = getRadarProfileForTeam(alphaModel.id, betaModel.id);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 shadow-sm">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Team Proposed
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Dual-Agent Configuration
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Agent Alpha Model Dropdown */}
        <div className="flex-1 w-full bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold uppercase tracking-wider">
            <span className="w-5 h-5 rounded bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center">
              α
            </span>
            <span>Agent Alpha (Proposer)</span>
          </div>
          <select
            id="agent-alpha-select"
            value={alphaModel.id}
            onChange={(e) => {
              const m = SUPPORTED_MODELS.find((mod) => mod.id === e.target.value);
              if (m) onAlphaChange(m);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            {SUPPORTED_MODELS.map((model) => (
              <option key={model.id} value={model.id} className="bg-slate-900 text-white">
                {model.name} ({model.provider})
              </option>
            ))}
          </select>
          <div className="text-[11px] text-slate-400 truncate">
            {alphaModel.teamRole}
          </div>
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
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            <span className="w-5 h-5 rounded bg-emerald-600/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
              β
            </span>
            <span>Agent Beta (Reviewer)</span>
          </div>
          <select
            id="agent-beta-select"
            value={betaModel.id}
            onChange={(e) => {
              const m = SUPPORTED_MODELS.find((mod) => mod.id === e.target.value);
              if (m) onBetaChange(m);
            }}
            className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            {SUPPORTED_MODELS.map((model) => (
              <option key={model.id} value={model.id} className="bg-slate-900 text-white">
                {model.name} ({model.provider})
              </option>
            ))}
          </select>
          <div className="text-[11px] text-slate-400 truncate">
            {betaModel.teamRole}
          </div>
        </div>
      </div>
    </div>
  );
};
