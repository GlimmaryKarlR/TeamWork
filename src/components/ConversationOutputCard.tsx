import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  AgentTeam,
  DialogueTurn,
  FinalConsensus,
  LLMModel,
} from '../types';
import {
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  Zap,
  Clock,
  Coins,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Play,
  RotateCcw,
} from 'lucide-react';

interface ConversationOutputCardProps {
  teams: AgentTeam[];
  alphaModel: LLMModel;
  betaModel: LLMModel;
  turns: DialogueTurn[];
  finalConsensus: FinalConsensus | null;
  isLoading: boolean;
  loadingStep?: string;
  onRunMatchup?: () => void;
  prompt?: string;
}

export const ConversationOutputCard: React.FC<ConversationOutputCardProps> = ({
  teams = [],
  alphaModel,
  betaModel,
  turns,
  finalConsensus,
  isLoading,
  loadingStep,
  onRunMatchup,
  prompt,
}) => {
  const [copiedConsensus, setCopiedConsensus] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [copiedTurnId, setCopiedTurnId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'teams' | 'consensus'>('all');
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [expandedInsights, setExpandedInsights] = useState<Record<string, boolean>>({});

  // Toggle key insights accordion per turn
  const toggleInsights = (turnId: string) => {
    setExpandedInsights((prev) => ({
      ...prev,
      [turnId]: !prev[turnId],
    }));
  };

  // Filtered turns based on active tab and team filter
  const filteredTurns = useMemo(() => {
    if (activeTab === 'consensus') return [];
    if (activeTab === 'teams' && selectedTeamFilter !== 'all') {
      return turns.filter(
        (t) => t.teamId === selectedTeamFilter || t.teamName === selectedTeamFilter
      );
    }
    return turns;
  }, [turns, activeTab, selectedTeamFilter]);

  // Aggregate stats
  const totalTurns = turns.length;
  const totalTokens = turns.reduce((acc, t) => acc + (t.turnTokens || 0), 0);
  const totalAgents = teams.length > 0 ? teams.length * 2 : 2;

  // Copy actions
  const handleCopyConsensus = () => {
    if (!finalConsensus) return;
    navigator.clipboard.writeText(finalConsensus.agreedSolution);
    setCopiedConsensus(true);
    setTimeout(() => setCopiedConsensus(false), 2000);
  };

  const handleCopyTranscript = () => {
    if (turns.length === 0) return;
    let fullText = `# TeamWorkAi Multi-Agent Conversation Transcript\n\n`;
    if (prompt) fullText += `**Task Prompt**: ${prompt}\n\n`;

    turns.forEach((t) => {
      fullText += `### [${t.teamName || 'Team'}] ${t.agent === 'alpha' ? 'Agent Alpha (α)' : 'Agent Beta (β)'} - ${t.modelName} (Round ${t.roundNumber})\n`;
      fullText += `*Role: ${t.agentRole}*\n\n`;
      fullText += `${t.content}\n\n`;
      if (t.keyInsights && t.keyInsights.length > 0) {
        fullText += `**Key Insights:**\n`;
        t.keyInsights.forEach((ki) => {
          fullText += `- ${ki}\n`;
        });
        fullText += `\n`;
      }
      fullText += `---\n\n`;
    });

    if (finalConsensus) {
      fullText += `## Final Swarm Consensus Deliverable\n\n`;
      fullText += `${finalConsensus.agreedSolution}\n\n`;
      fullText += `**Consensus Agreement Score**: ${finalConsensus.consensusScore}%\n`;
    }

    navigator.clipboard.writeText(fullText);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const handleCopyTurn = (turnId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedTurnId(turnId);
    setTimeout(() => setCopiedTurnId(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (turns.length === 0 && !finalConsensus) return;
    let fullText = `# TeamWorkAi Multi-Agent Collaboration Export\n\n`;
    if (prompt) fullText += `**Task**: ${prompt}\n\n`;
    fullText += `**Date**: ${new Date().toLocaleString()}\n`;
    fullText += `**Teams**: ${teams.map((t) => `${t.name} (${t.alphaModel.name} + ${t.betaModel.name})`).join(', ')}\n\n---\n\n`;

    turns.forEach((t) => {
      fullText += `### Round ${t.roundNumber}: [${t.teamName || 'Team'}] ${t.modelName} (${t.agentRole})\n\n`;
      fullText += `${t.content}\n\n`;
    });

    if (finalConsensus) {
      fullText += `## Agreed Consensus Deliverable (${finalConsensus.consensusScore}% Score)\n\n`;
      fullText += `${finalConsensus.agreedSolution}\n`;
    }

    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `multi-agent-deliberation-${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="conversation-output-card"
      className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl transition-all space-y-4"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                Agent Conversation & Output
              </h2>
              {isLoading ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-400 border border-blue-800 animate-pulse">
                  <Sparkles className="w-2.5 h-2.5 animate-spin" /> Deliberating...
                </span>
              ) : finalConsensus ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> Consensus Reached ({finalConsensus.consensusScore}%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-950 border border-slate-800">
                  Ready ({totalAgents} Agents Configured)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Read the direct multi-turn deliberations, cross-agent auditing, and synthesized solutions.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 flex-wrap">
          {turns.length > 0 && (
            <>
              <button
                id="btn-copy-full-transcript"
                onClick={handleCopyTranscript}
                title="Copy complete transcript with all turns and markdown"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {copiedTranscript ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
                <span>{copiedTranscript ? 'Copied' : 'Copy All'}</span>
              </button>

              <button
                id="btn-download-transcript"
                onClick={handleDownloadMarkdown}
                title="Download conversation markdown file"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Download className="w-3 h-3 text-slate-400" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </>
          )}

          {finalConsensus && (
            <button
              id="btn-copy-agreed-deliverable"
              onClick={handleCopyConsensus}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40 transition-colors cursor-pointer"
            >
              {copiedConsensus ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span>{copiedConsensus ? 'Copied Solution' : 'Copy Solution'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Filter Bar (Only if turns or consensus exist) */}
      {(turns.length > 0 || finalConsensus) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 pb-1">
          {/* Segmented View Mode Tabs */}
          <div className="inline-flex p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <button
              id="tab-view-all-turns"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Transcript ({totalTurns})
            </button>

            {teams.length > 1 && (
              <button
                id="tab-view-by-team"
                onClick={() => setActiveTab('teams')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  activeTab === 'teams'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Filter by Team
              </button>
            )}

            {finalConsensus && (
              <button
                id="tab-view-consensus"
                onClick={() => setActiveTab('consensus')}
                className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  activeTab === 'consensus'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Agreed Deliverable
              </button>
            )}
          </div>

          {/* Secondary Filter: Team Selector if tab is 'teams' */}
          {activeTab === 'teams' && teams.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                id="select-team-filter"
                value={selectedTeamFilter}
                onChange={(e) => setSelectedTeamFilter(e.target.value)}
                aria-label="Filter conversation by team"
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Teams ({teams.length})</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.alphaModel.name.split(' ')[0]} + {t.betaModel.name.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 ml-auto">
            {totalTokens > 0 && (
              <span className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" /> {totalTokens.toLocaleString()} tokens
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-400" /> {totalTurns} turns
            </span>
          </div>
        </div>
      )}

      {/* 1. Loading State */}
      {isLoading && (
        <div className="bg-slate-950/90 border border-blue-900/50 rounded-xl p-5 text-xs text-blue-300 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin shrink-0" />
            <div className="space-y-1 flex-1">
              <div className="font-bold text-slate-100 flex items-center gap-2">
                <span>Multi-Agent Swarm Deliberation in Progress</span>
                <span className="text-[10px] font-mono text-blue-400 px-1.5 py-0.2 bg-blue-950 rounded border border-blue-800">
                  {teams.length} Team{teams.length > 1 ? 's' : ''} ({totalAgents} Agents)
                </span>
              </div>
              <p className="text-[11px] text-blue-300 font-mono">
                {loadingStep || 'Synchronizing cross-team verification loops and adversarial critique...'}
              </p>
            </div>
          </div>

          {/* Progress bar simulation */}
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-4 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-500 h-full rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {/* 2. Empty / Ready Preview State (When no turns and not loading) */}
      {turns.length === 0 && !isLoading && !finalConsensus && (
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-200">
              No Active Deliberation Yet
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              Configure your teams above or select specialized skill nodes on the map. When you trigger collaboration, each model's full reasoning turns and final deliverable will appear here.
            </p>
          </div>

          {/* Configured Roster Preview */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {teams.map((t, idx) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300 font-mono"
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="font-bold text-slate-200">{t.name}:</span>
                <span className="text-blue-300">{t.alphaModel.name.split(' ')[0]}</span>
                <span className="text-slate-500">+</span>
                <span className="text-emerald-300">{t.betaModel.name.split(' ')[0]}</span>
              </span>
            ))}
          </div>

          {onRunMatchup && (
            <div className="pt-2">
              <button
                id="btn-run-collaboration-from-output"
                onClick={onRunMatchup}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Multi-Agent Collaboration</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Turn-by-Turn Dialogue Stream */}
      {activeTab !== 'consensus' && filteredTurns.length > 0 && (
        <div className="space-y-3.5">
          {filteredTurns.map((turn, index) => {
            const isAlpha = turn.agent === 'alpha';
            const displayModelName = turn.modelName || (isAlpha ? alphaModel.name : betaModel.name);
            const teamLabel = turn.teamName || `Team 1`;
            const isInsightsOpen = expandedInsights[turn.id] ?? true;

            return (
              <div
                key={turn.id || index}
                id={`turn-card-${turn.id || index}`}
                className={`rounded-xl p-4 border text-xs leading-relaxed transition-all shadow-md ${
                  isAlpha
                    ? 'bg-slate-950/80 border-blue-900/50 hover:border-blue-700/60'
                    : 'bg-slate-950/80 border-emerald-900/50 hover:border-emerald-700/60'
                }`}
              >
                {/* Turn Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800/80">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Team Identifier */}
                    <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono font-bold">
                      {teamLabel}
                    </span>

                    {/* Agent Pill (Alpha / Beta) */}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                        isAlpha
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-800/60'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      }`}
                    >
                      <span className="font-serif font-black">{isAlpha ? 'α' : 'β'}</span>
                      <span>{displayModelName}</span>
                    </span>

                    {/* Role Annotation */}
                    {turn.agentRole && (
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        • {turn.agentRole}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span className="bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      Round {turn.roundNumber}
                    </span>
                    {turn.turnTokens && (
                      <span className="hidden sm:inline">
                        {turn.turnTokens} tokens
                      </span>
                    )}
                    <button
                      id={`btn-copy-turn-${turn.id || index}`}
                      onClick={() => handleCopyTurn(turn.id, turn.content)}
                      title="Copy this turn's response"
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      {copiedTurnId === turn.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Markdown Content */}
                <div className="prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed font-sans">
                  <ReactMarkdown>{turn.content}</ReactMarkdown>
                </div>

                {/* Turn Key Insights Drawer */}
                {turn.keyInsights && turn.keyInsights.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                    <button
                      onClick={() => toggleInsights(turn.id)}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer w-full text-left"
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Key Architectural Points & Invariants ({turn.keyInsights.length})</span>
                      {isInsightsOpen ? (
                        <ChevronUp className="w-3 h-3 ml-auto text-slate-500" />
                      ) : (
                        <ChevronDown className="w-3 h-3 ml-auto text-slate-500" />
                      )}
                    </button>

                    {isInsightsOpen && (
                      <ul className="mt-2 space-y-1 text-[11px] text-slate-300 font-mono">
                        {turn.keyInsights.map((insight, kIdx) => (
                          <li key={kIdx} className="flex items-start gap-1.5">
                            <span className="text-amber-400 shrink-0 font-bold">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Final Swarm Consensus Deliverable Card */}
      {finalConsensus && (activeTab === 'all' || activeTab === 'consensus') && (
        <div
          id="final-consensus-card"
          className="bg-gradient-to-b from-[#0c1914] via-[#09130f] to-[#060e0a] border-2 border-emerald-500/60 rounded-2xl p-5 shadow-2xl space-y-4"
        >
          {/* Deliverable Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-950/60">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    {teams.length > 1 ? 'Swarm Consensus Deliverable' : 'Agreed Consensus Deliverable'}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/80">
                    {finalConsensus.consensusScore}% Consensus
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/70 mt-0.5">
                  Synthesized across {teams.length > 1 ? `${teams.length} specialized teams (${totalAgents} models)` : 'both collaborating agents'}.
                </p>
              </div>
            </div>

            <button
              id="btn-copy-consensus-in-card"
              onClick={handleCopyConsensus}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/60 transition-all cursor-pointer self-start sm:self-auto"
            >
              {copiedConsensus ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedConsensus ? 'Copied to Clipboard' : 'Copy Solution'}</span>
            </button>
          </div>

          {/* Agreed Solution Markdown */}
          <div className="prose prose-invert prose-sm max-w-none text-slate-100 leading-relaxed font-sans bg-slate-950/60 border border-emerald-950 rounded-xl p-4">
            <ReactMarkdown>{finalConsensus.agreedSolution}</ReactMarkdown>
          </div>

          {/* Synthesis Details: Compromises Made & Combined Strengths */}
          {((finalConsensus.compromisesMade && finalConsensus.compromisesMade.length > 0) ||
            (finalConsensus.keyStrengthsCombined && finalConsensus.keyStrengthsCombined.length > 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
              {finalConsensus.keyStrengthsCombined && finalConsensus.keyStrengthsCombined.length > 0 && (
                <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-3">
                  <div className="font-bold text-emerald-300 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Combined Model Strengths</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {finalConsensus.keyStrengthsCombined.map((str, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 shrink-0 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {finalConsensus.compromisesMade && finalConsensus.compromisesMade.length > 0 && (
                <div className="bg-slate-950/70 border border-emerald-900/40 rounded-xl p-3">
                  <div className="font-bold text-amber-300 mb-1.5 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cross-Team Harmonizations</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300">
                    {finalConsensus.compromisesMade.map((comp, cIdx) => (
                      <li key={cIdx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 shrink-0 font-bold">•</span>
                        <span>{comp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
