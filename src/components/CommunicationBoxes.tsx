import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { AgentTeam, DialogueTurn, FinalConsensus, LLMModel } from '../types';
import { Copy, Check, Users } from 'lucide-react';

interface CommunicationBoxesProps {
  teams?: AgentTeam[];
  alphaModel: LLMModel;
  betaModel: LLMModel;
  turns: DialogueTurn[];
  finalConsensus: FinalConsensus | null;
  isLoading: boolean;
}

export const CommunicationBoxes: React.FC<CommunicationBoxesProps> = ({
  teams = [],
  alphaModel,
  betaModel,
  turns,
  finalConsensus,
  isLoading,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!finalConsensus) return;
    navigator.clipboard.writeText(finalConsensus.agreedSolution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If no turns, no loading, and no consensus, render nothing (no empty placeholder card)
  if (turns.length === 0 && !isLoading && !finalConsensus) {
    return null;
  }

  const teamSummary = teams.length > 0 
    ? teams.map(t => `${t.name} (${t.alphaModel.name.split(' ')[0]} + ${t.betaModel.name.split(' ')[0]})`).join(', ')
    : `${alphaModel.name} & ${betaModel.name}`;

  return (
    <div className="space-y-3">
      {/* Loading state */}
      {isLoading && turns.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-blue-300 animate-pulse flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping shrink-0" />
          <span>
            {teams.length > 1
              ? `${teams.length} Teams (${teams.length * 2} Agents) are synchronizing computation and cross-verifying...`
              : `${teamSummary} are analyzing and cross-verifying...`}
          </span>
        </div>
      )}

      {/* Dialogue Stream */}
      {turns.map((turn, index) => {
        const isAlpha = turn.agent === 'alpha';
        const displayModelName = turn.modelName || (isAlpha ? alphaModel.name : betaModel.name);
        const teamLabel = turn.teamName || (teams.length > 1 ? `Team 1` : undefined);

        return (
          <div
            key={turn.id || index}
            className={`rounded-xl p-4 border text-xs leading-relaxed ${
              isAlpha
                ? 'bg-slate-900 border-blue-900/40 text-slate-200'
                : 'bg-slate-900 border-emerald-900/40 text-slate-200'
            }`}
          >
            {/* Header label */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60 font-semibold">
              <div className="flex items-center gap-2">
                {teamLabel && (
                  <span className="text-[10px] bg-slate-950 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800 font-mono">
                    {teamLabel}
                  </span>
                )}
                <span className={isAlpha ? 'text-blue-400' : 'text-emerald-400'}>
                  {isAlpha ? `α ${displayModelName}` : `β ${displayModelName}`}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Round {turn.roundNumber}
              </span>
            </div>

            {/* Markdown content */}
            <div className="prose prose-invert prose-xs max-w-none text-slate-200">
              <ReactMarkdown>{turn.content}</ReactMarkdown>
            </div>
          </div>
        );
      })}

      {/* Final Joint Consensus Deliverable */}
      {finalConsensus && (
        <div className="bg-slate-900 border border-emerald-500/50 rounded-xl p-4 shadow-lg mt-4">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {teams.length > 1 ? 'Swarm Consensus Deliverable' : 'Agreed Consensus Deliverable'}
              </h3>
              <span className="text-[11px] font-mono text-emerald-400">
                ({finalConsensus.consensusScore}% Agreement across {teams.length > 1 ? `${teams.length} Teams` : 'Agents'})
              </span>
            </div>

            <button
              id="btn-copy-consensus-deliverable"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Agreed Solution */}
          <div className="prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed">
            <ReactMarkdown>{finalConsensus.agreedSolution}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
