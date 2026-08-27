import React, { useMemo } from 'react';
import { SUPPORTED_MODELS } from '../data/benchmarkData';
import { recommendIdealTeamForTask, TeamRecommendation } from '../data/radarData';
import { Play, RefreshCw, Sparkles, Check, Gift, Layers, Sliders } from 'lucide-react';

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
  autoSelectTeam: boolean;
  onToggleAutoSelect: (enabled: boolean) => void;
  tierFilter: 'all' | 'free';
  onTierFilterChange: (tier: 'all' | 'free') => void;
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
  autoSelectTeam,
  onToggleAutoSelect,
  tierFilter,
  onTierFilterChange,
  onSelectTeam,
}) => {
  // Recommend ideal team based on current prompt and tier filter
  const recommendation: TeamRecommendation = useMemo(() => {
    return recommendIdealTeamForTask(prompt, tierFilter === 'free');
  }, [prompt, tierFilter]);

  const alphaRecommended = SUPPORTED_MODELS.find((m) => m.id === recommendation.alphaModelId);
  const betaRecommended = SUPPORTED_MODELS.find((m) => m.id === recommendation.betaModelId);

  const isCurrentTeamIdeal =
    (currentAlphaId === recommendation.alphaModelId && currentBetaId === recommendation.betaModelId) ||
    (currentAlphaId === recommendation.betaModelId && currentBetaId === recommendation.alphaModelId);

  const handleManualEquip = () => {
    onSelectTeam(recommendation.alphaModelId, recommendation.betaModelId);
    if (!autoSelectTeam) {
      onToggleAutoSelect(true);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 shadow-sm">
      {/* Header for Prompt Input & Tier Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-800/80">
        <label
          htmlFor="custom-task-prompt-input"
          className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          Enter Prompt Here
        </label>

        {/* Free Tier vs All Models Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Model Tier:</span>
          <div className="inline-flex p-0.5 rounded-lg bg-slate-950 border border-slate-800">
            <button
              id="tier-btn-all"
              type="button"
              onClick={() => onTierFilterChange('all')}
              className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                tierFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Models
            </button>
            <button
              id="tier-btn-free"
              type="button"
              onClick={() => onTierFilterChange('free')}
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                tierFilter === 'free'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Gift className="w-3 h-3 text-emerald-300" />
              <span>Free Tier Only</span>
            </button>
          </div>
        </div>
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

      {/* Controls row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
        {/* Left side: Rounds + Domain tag + Tier indicator */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Rounds */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Rounds:</span>
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
          </div>

          {/* Domain Badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs">
            <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
            <span className="text-blue-300 font-medium text-[11px]">
              {recommendation.domain}
            </span>
          </div>

          {tierFilter === 'free' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/40 text-[10px] text-emerald-300 font-medium">
              100% Free Open Models
            </span>
          )}
        </div>

        {/* Right side: Auto-select Slider Toggle and Ideal Team status + Go button */}
        <div className="flex flex-col sm:flex-row sm:items-center items-end gap-3 shrink-0">
          {/* Auto-select slider toggle and ideal team info */}
          <div className="flex flex-col items-end gap-1">
            {/* Slider Switch */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-300 font-medium select-none">
                Auto-Select Ideal Team
              </span>
              <button
                id="toggle-auto-select-team"
                type="button"
                role="switch"
                aria-checked={autoSelectTeam}
                onClick={() => onToggleAutoSelect(!autoSelectTeam)}
                disabled={isLoading}
                title={autoSelectTeam ? 'Auto-selection enabled. Click to disable for manual selection.' : 'Click to enable automatic ideal team selection.'}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoSelectTeam ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoSelectTeam ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Ideal Team Status Pill directly above Go */}
            <div className="flex items-center gap-1.5">
              {autoSelectTeam ? (
                <div className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>
                    Auto-Equipped: {alphaRecommended?.name.split(' ')[0]} + {betaRecommended?.name.split(' ')[0]}
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleManualEquip}
                  type="button"
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-300 underline cursor-pointer"
                >
                  <span>Manual Mode (Click to equip ideal team)</span>
                </button>
              )}
            </div>
          </div>

          {/* Go Button */}
          <button
            id="btn-run-team-collaboration"
            onClick={onRunMatchup}
            disabled={isLoading || !prompt.trim()}
            className={`inline-flex items-center justify-center gap-1.5 px-6 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md ${
              isLoading || !prompt.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30 active:scale-95'
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
    </div>
  );
};
