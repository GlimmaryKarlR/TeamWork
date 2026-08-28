import React, { useMemo, useState } from 'react';
import { AgentTeam, LLMModel } from '../types';
import { getRadarProfileForTeam, TEAM_PALETTE } from '../data/radarData';
import { TeamRadarChart } from './TeamRadarChart';
import { Gift, Plus, RefreshCw, Search, Trash2, Users, Zap } from 'lucide-react';

interface ModelSelectorProps {
  teams: AgentTeam[];
  models: LLMModel[];
  tierFilter: 'all' | 'free';
  onAddTeam: () => void;
  onRemoveTeam: (teamId: string) => void;
  onUpdateTeam: (teamId: string, alphaModel: LLMModel, betaModel: LLMModel) => void;
  onRefreshModels: () => void;
  isRefreshingModels: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  teams,
  models,
  tierFilter,
  onAddTeam,
  onRemoveTeam,
  onUpdateTeam,
  onRefreshModels,
  isRefreshingModels,
}) => {
  // Store search queries by `${teamId}-alpha` or `${teamId}-beta`
  const [searchMap, setSearchMap] = useState<Record<string, string>>({});

  const setSearch = (key: string, value: string) => {
    setSearchMap((prev) => ({ ...prev, [key]: value }));
  };

  // Available models depending on tier filter
  const baseModels = useMemo(() => {
    return tierFilter === 'free' ? models.filter((m) => m.isFree) : models;
  }, [models, tierFilter]);

  // Group models by provider for intuitive dropdowns
  const groupModels = (list: LLMModel[]) => {
    const groups: Record<string, LLMModel[]> = {};
    list.forEach((m) => {
      const p = m.provider || 'Other';
      if (!groups[p]) groups[p] = [];
      groups[p].push(m);
    });
    return groups;
  };

  const getFilteredModels = (searchKey: string) => {
    const query = (searchMap[searchKey] || '').trim().toLowerCase();
    if (!query) return baseModels;
    return baseModels.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.id.toLowerCase().includes(query) ||
        m.provider.toLowerCase().includes(query)
    );
  };

  const totalAgents = teams.length * 2;
  const maxTeams = 5;

  return (
    <div className="space-y-4 mb-4">
      {/* Global Teams Management Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Swarm Team Composition
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-800/50">
                  <Zap className="w-2.5 h-2.5 text-blue-400" />
                  {teams.length} / {maxTeams} Teams ({totalAgents} / 10 Agents)
                </span>
                {tierFilter === 'free' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                    <Gift className="w-2.5 h-2.5" /> Free Tier
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Configure complementary pairs of AI agents per team. Each team features real-time capability radar metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Add Team Button */}
            <button
              id="btn-add-agent-team"
              type="button"
              onClick={onAddTeam}
              disabled={teams.length >= maxTeams}
              title={
                teams.length >= maxTeams
                  ? 'Maximum capacity reached (5 teams / 10 agents)'
                  : 'Add an additional 2-agent team to the swarm'
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                teams.length < maxTeams
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-900/30'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Team</span>
            </button>

            {/* Refresh Models Catalog */}
            <button
              id="btn-refresh-models-selector"
              type="button"
              onClick={onRefreshModels}
              disabled={isRefreshingModels}
              title="Refresh full catalog from OpenRouter"
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-blue-300 px-2 py-1.5 rounded bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 text-blue-400 ${isRefreshingModels ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Team Roster Cards Matrix with Individual Skill Radars */}
      <div className="space-y-4">
        {teams.map((team, teamIndex) => {
          const alphaSearchKey = `${team.id}-alpha`;
          const betaSearchKey = `${team.id}-beta`;
          const alphaFiltered = getFilteredModels(alphaSearchKey);
          const betaFiltered = getFilteredModels(betaSearchKey);
          const alphaGroups = groupModels(alphaFiltered);
          const betaGroups = groupModels(betaFiltered);
          const profile = getRadarProfileForTeam(team.alphaModel.id, team.betaModel.id);

          return (
            <div
              key={team.id}
              id={`team-card-${team.id}`}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm"
            >
              {/* Team Card Header */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    {team.name || `Team ${teamIndex + 1}`}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    2 Agents • {team.alphaModel.name.split(' ')[0]} + {team.betaModel.name.split(' ')[0]}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {teams.length > 1 && (
                    <button
                      id={`btn-remove-team-${team.id}`}
                      type="button"
                      onClick={() => onRemoveTeam(team.id)}
                      title={`Remove ${team.name}`}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-400 px-2 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Team 3-Column Layout: Alpha Dropdown, Team Radar Chart, Beta Dropdown */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Agent Alpha Model Dropdown */}
                <div className="flex-1 w-full bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-blue-400 font-semibold uppercase tracking-wider">
                      <span className="w-5 h-5 rounded bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center">
                        α
                      </span>
                      <span>Agent Alpha ({team.name || `Team ${teamIndex + 1}`})</span>
                    </div>
                    {team.alphaModel.isFree && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        FREE
                      </span>
                    )}
                  </div>

                  {/* Model Strengths Tag */}
                  {team.alphaModel.strengths && team.alphaModel.strengths.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-0.5">
                      {team.alphaModel.strengths.slice(0, 2).map((st, i) => (
                        <span key={i} className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                          {st}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search Filter for Alpha */}
                  <div className="relative my-0.5">
                    <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
                    <input
                      type="text"
                      value={searchMap[alphaSearchKey] || ''}
                      onChange={(e) => setSearch(alphaSearchKey, e.target.value)}
                      placeholder="Filter Alpha models..."
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 pl-6 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    id={`select-team-${team.id}-alpha`}
                    value={team.alphaModel.id}
                    onChange={(e) => {
                      const m = models.find((mod) => mod.id === e.target.value);
                      if (m) onUpdateTeam(team.id, m, team.betaModel);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {!alphaFiltered.some((m) => m.id === team.alphaModel.id) && (
                      <option value={team.alphaModel.id} className="bg-slate-900 text-white">
                        {team.alphaModel.name} ({team.alphaModel.provider}) {team.alphaModel.isFree ? '• FREE' : ''}
                      </option>
                    )}

                    {Object.entries(alphaGroups).map(([provider, pModels]) => (
                      <optgroup key={`alpha-${team.id}-${provider}`} label={provider} className="bg-slate-950 text-slate-400 font-bold">
                        {pModels.map((model) => (
                          <option key={model.id} value={model.id} className="bg-slate-900 text-white">
                            {model.name} {model.isFree ? '• FREE' : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Center: Team Radar Graphic for this team */}
                <div className="shrink-0 flex flex-col items-center justify-center px-1 py-1">
                  <TeamRadarChart
                    alphaModel={team.alphaModel}
                    betaModel={team.betaModel}
                    profile={profile}
                    teamIndex={teamIndex}
                    strokeColor={TEAM_PALETTE[teamIndex % TEAM_PALETTE.length].stroke}
                    size={180}
                  />
                  <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: TEAM_PALETTE[teamIndex % TEAM_PALETTE.length].stroke }}
                    />
                    <span>{team.name} Capability Radar</span>
                  </div>
                </div>

                {/* Agent Beta Model Dropdown */}
                <div className="flex-1 w-full bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                      <span className="w-5 h-5 rounded bg-emerald-600/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                        β
                      </span>
                      <span>Agent Beta ({team.name || `Team ${teamIndex + 1}`})</span>
                    </div>
                    {team.betaModel.isFree && (
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        FREE
                      </span>
                    )}
                  </div>

                  {/* Model Strengths Tag */}
                  {team.betaModel.strengths && team.betaModel.strengths.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-0.5">
                      {team.betaModel.strengths.slice(0, 2).map((st, i) => (
                        <span key={i} className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.2 rounded border border-slate-800">
                          {st}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Search Filter for Beta */}
                  <div className="relative my-0.5">
                    <Search className="w-3 h-3 absolute left-2 top-2 text-slate-500" />
                    <input
                      type="text"
                      value={searchMap[betaSearchKey] || ''}
                      onChange={(e) => setSearch(betaSearchKey, e.target.value)}
                      placeholder="Filter Beta models..."
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 pl-6 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <select
                    id={`select-team-${team.id}-beta`}
                    value={team.betaModel.id}
                    onChange={(e) => {
                      const m = models.find((mod) => mod.id === e.target.value);
                      if (m) onUpdateTeam(team.id, team.alphaModel, m);
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                  >
                    {!betaFiltered.some((m) => m.id === team.betaModel.id) && (
                      <option value={team.betaModel.id} className="bg-slate-900 text-white">
                        {team.betaModel.name} ({team.betaModel.provider}) {team.betaModel.isFree ? '• FREE' : ''}
                      </option>
                    )}

                    {Object.entries(betaGroups).map(([provider, pModels]) => (
                      <optgroup key={`beta-${team.id}-${provider}`} label={provider} className="bg-slate-950 text-slate-400 font-bold">
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
        })}
      </div>
    </div>
  );
};
