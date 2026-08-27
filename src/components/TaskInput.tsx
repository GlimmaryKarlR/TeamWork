import React, { useMemo } from 'react';
import { SUPPORTED_MODELS } from '../data/benchmarkData';
import { recommendIdealTeamForTask, TeamRecommendation } from '../data/radarData';
import { Play, RefreshCw, Sparkles, Check } from 'lucide-react';

interface TaskInputProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  rounds: number;
  onRoundsChange: (r: number) => void;
  isLoading: boolean;
  onRunMatchup: () => void;
  loadingStep: string;
  currentAlphaId: string;
  currentBetaId: string;
  onSelectTeam: (alphaId: string, betaId: string) => void;
}

export const TaskInput: React.FC<TaskInputProps> = ({
  prompt,
  onPromptChange,
  rounds,
  onRoundsChange,
  isLoading,
  onRunMatchup,
  loadingStep,
  currentAlphaId,
  currentBetaId,
  onSelectTeam,
}) => {
  // Analyze prompt in real-time to determine ideal team pairing
  const recommendation: TeamRecommendation = useMemo(() => {
    return recommendIdealTeamForTask(prompt);
  }, [prompt]);

  const alphaRecommended = SUPPORTED_MODELS.find((m) => m.id === recommendation.alphaModelId);
  const betaRecommended = SUPPORTED_MODELS.find((m) => m.id === recommendation.betaModelId);

  const isCurrentTeamIdeal =
    (currentAlphaId === recommendation.alphaModelId && currentBetaId === recommendation.betaModelId) ||
    (currentAlphaId === recommendation.betaModelId && currentBetaId === recommendation.alphaModelId);

  const handleEquipRecommended = () => {
    onSelectTeam(recommendation.alphaModelId, recommendation.betaModelId);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 mb-4 shadow-sm">
      {/* Header for Prompt Input */}
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="custom-task-prompt-input" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Enter Prompt Here
        </label>
        <span className="text-[11px] text-slate-400">
          Type your task or problem statement
        </span>
      </div>

      {/* Task input area */}
      <div className="relative mb-3">
        <textarea
          id="custom-task-prompt-input"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Enter task or challenge for the collaborative models..."
          rows={2}
          disabled={isLoading}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-y min-h-[72px]"
        />
      </div>

      {/* Controls row with AI Task Analysis & Ideal Team button right next to Collaborate button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left: Rounds selection + Real-time Domain Tag + Equip Ideal Team Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Rounds */}
          <select
            id="rounds-select"
            value={rounds}
            onChange={(e) => onRoundsChange(Number(e.target.value))}
            disabled={isLoading}
            className="bg-slate-950 border border-slate-800 rounded-md px-2.5 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value={1}>1 Round</option>
            <option value={2}>2 Rounds</option>
            <option value={3}>3 Rounds</option>
          </select>

          {/* AI Task Analysis Domain Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs">
            <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
            <span className="text-blue-300 font-medium text-[11px]">
              {recommendation.domain}
            </span>
          </div>

          {/* Equip Ideal Team Button */}
          <button
            id="btn-equip-ideal-team"
            onClick={handleEquipRecommended}
            disabled={isCurrentTeamIdeal || isLoading}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              isCurrentTeamIdeal
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50 cursor-default'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white cursor-pointer shadow-sm'
            }`}
          >
            {isCurrentTeamIdeal ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Ideal Team Equipped</span>
              </>
            ) : (
              <span>Equip Ideal Team ({alphaRecommended?.name.split(' ')[0]} + {betaRecommended?.name.split(' ')[0]})</span>
            )}
          </button>
        </div>

        {/* Right: Go Button */}
        <button
          id="btn-run-team-collaboration"
          onClick={onRunMatchup}
          disabled={isLoading || !prompt.trim()}
          className={`inline-flex items-center justify-center gap-1.5 px-5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            isLoading || !prompt.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30'
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{loadingStep || 'Teaming...'}</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Go</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
