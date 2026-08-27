import React, { useMemo } from 'react';
import { CollaborationProtocol } from '../types';
import { PRESET_TASKS, SUPPORTED_MODELS } from '../data/benchmarkData';
import { recommendIdealTeamForTask, TeamRecommendation } from '../data/radarData';
import { Play, RefreshCw, Sparkles, Check } from 'lucide-react';

interface TaskInputProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  protocol: CollaborationProtocol;
  onProtocolChange: (proto: CollaborationProtocol) => void;
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
  protocol,
  onProtocolChange,
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
      {/* Quick presets */}
      <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto pb-1">
        <span className="text-[11px] text-slate-400 shrink-0 font-medium">Presets:</span>
        {PRESET_TASKS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onPromptChange(preset.prompt)}
            className="text-[11px] px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap transition-colors"
          >
            {preset.title.split(' ')[0]} {preset.title.split(' ')[1]}
          </button>
        ))}
      </div>

      {/* Task input area */}
      <div className="relative mb-2.5">
        <textarea
          id="custom-task-prompt-input"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Enter task or question for the teamed models..."
          rows={2}
          disabled={isLoading}
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-y min-h-[70px]"
        />
      </div>

      {/* AI Task Analysis & Ideal Team Recommendation Bar */}
      {prompt.trim().length > 3 && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-slate-950/80 border border-blue-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-slate-400">AI Task Analysis:</span>
            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-medium text-[11px] border border-blue-800/60">
              {recommendation.domain}
            </span>
            <span className="hidden md:inline text-slate-400">
              Ideal Team: <strong className="text-white">{alphaRecommended?.name}</strong> + <strong className="text-white">{betaRecommended?.name}</strong>
            </span>
          </div>

          <button
            id="btn-equip-ideal-team"
            onClick={handleEquipRecommended}
            disabled={isCurrentTeamIdeal}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              isCurrentTeamIdeal
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50 cursor-default'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
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
      )}

      {/* Controls & Run Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {/* Protocol */}
          <select
            id="protocol-select"
            value={protocol}
            onChange={(e) => onProtocolChange(e.target.value as CollaborationProtocol)}
            disabled={isLoading}
            className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="debate_synthesize">Debate & Synthesize</option>
            <option value="architect_auditor">Architect & Auditor</option>
            <option value="lead_verifier">Lead & Verifier</option>
            <option value="creative_refine">Creative & Refine</option>
          </select>

          {/* Rounds */}
          <select
            id="rounds-select"
            value={rounds}
            onChange={(e) => onRoundsChange(Number(e.target.value))}
            disabled={isLoading}
            className="bg-slate-950 border border-slate-800 rounded-md px-2 py-1 text-xs text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value={1}>1 Round</option>
            <option value={2}>2 Rounds</option>
            <option value={3}>3 Rounds</option>
          </select>
        </div>

        {/* Start Button */}
        <button
          id="btn-run-team-collaboration"
          onClick={onRunMatchup}
          disabled={isLoading || !prompt.trim()}
          className={`inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isLoading || !prompt.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
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
              <span>Collaborate</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
