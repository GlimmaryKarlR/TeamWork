/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LLMModel, CollaborationProtocol, DialogueTurn, FinalConsensus, ProviderApiKeys, AgentTeam } from './types';
import { SUPPORTED_MODELS, PRESET_TASKS } from './data/benchmarkData';
import { formatOpenRouterModel } from './data/openRouterModels';
import { recommendIdealTeamForTask } from './data/radarData';
import { runClientSideCollaboration } from './utils/directCollaboration';
import { Header } from './components/Header';
import { TeamingHeatmap } from './components/TeamingHeatmap';
import { ModelSelector } from './components/ModelSelector';
import { TaskInput } from './components/TaskInput';
import { CommunicationBoxes } from './components/CommunicationBoxes';
import { ApiSettingsModal } from './components/ApiSettingsModal';

const STORAGE_KEY = 'teamwork_api_settings';

// Preset complementary pairs for quickly seeding new teams
const COMPLEMENTARY_PAIRS: [string, string][] = [
  ['gemini-3.7-flash', 'claude-3-7-sonnet'],
  ['deepseek-r1', 'qwen-2.5-72b'],
  ['gpt-4o', 'llama-3.3-70b'],
  ['claude-3-7-sonnet', 'deepseek-r1'],
  ['nemotron-3-nano', 'mistral-large-2'],
];

export default function App() {
  // Models catalog state (initializes with core supported models, dynamically expanded from OpenRouter)
  const [models, setModels] = useState<LLMModel[]>(SUPPORTED_MODELS);
  const [isRefreshingModels, setIsRefreshingModels] = useState(false);
  const [lastModelsUpdate, setLastModelsUpdate] = useState<string>('');

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ProviderApiKeys>({});
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);

  // Teams configuration state (each team has 2 agents = up to 5 teams / 10 agents total)
  const [teams, setTeams] = useState<AgentTeam[]>([
    {
      id: 'team-1',
      name: 'Team 1',
      alphaModel: SUPPORTED_MODELS[0],
      betaModel: SUPPORTED_MODELS[1],
    },
  ]);

  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);

  // Workflow automation & Tier selection
  const [autoSelectTeam, setAutoSelectTeam] = useState<boolean>(true);
  const [tierFilter, setTierFilter] = useState<'all' | 'free'>('all');

  // Task & Protocol state
  const [prompt, setPrompt] = useState<string>(PRESET_TASKS[0].prompt);
  const [protocol] = useState<CollaborationProtocol>('debate_synthesize');
  const [rounds, setRounds] = useState<number>(2);

  // Execution & dialogue state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [turns, setTurns] = useState<DialogueTurn[]>([]);
  const [finalConsensus, setFinalConsensus] = useState<FinalConsensus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load saved API keys from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === 'object' && parsed !== null) {
          setApiKeys(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not load api settings from localStorage', e);
    }
  }, []);

  // Save API keys to localStorage
  const handleSaveKeys = (newKeys: ProviderApiKeys) => {
    setApiKeys(newKeys);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newKeys));
    } catch (e) {
      console.warn('Could not save api settings to localStorage', e);
    }
  };

  // Fetch or refresh models catalog from OpenRouter (with direct public API fallback for static deployments)
  const fetchModels = useCallback(async (forceRefresh = false, customOrKey?: string) => {
    setIsRefreshingModels(true);
    try {
      const keyToUse = customOrKey !== undefined ? customOrKey : apiKeys.openrouterApiKey;
      const queryParams = new URLSearchParams();
      if (forceRefresh) queryParams.set('refresh', 'true');
      if (keyToUse) queryParams.set('apiKey', keyToUse);

      const url = `/api/openrouter/models?${queryParams.toString()}`;
      let loadedModels: LLMModel[] | null = null;
      let updatedAt = new Date().toISOString();

      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.models) && data.models.length > 0) {
            loadedModels = data.models;
            updatedAt = data.lastUpdated || updatedAt;
          }
        }
      } catch {
        // Backend route failed or unavailable (e.g. static host like Vercel)
      }

      // If backend was not reachable or returned empty, fetch directly from OpenRouter public models endpoint
      if (!loadedModels || loadedModels.length <= SUPPORTED_MODELS.length) {
        try {
          const directHeaders: Record<string, string> = {
            'HTTP-Referer': window.location.origin,
            'X-Title': 'TeamWorkAi',
          };
          if (keyToUse) {
            directHeaders['Authorization'] = `Bearer ${keyToUse}`;
          }

          const directRes = await fetch('https://openrouter.ai/api/v1/models', {
            headers: directHeaders,
          });

          if (directRes.ok) {
            const directData = await directRes.json();
            if (Array.isArray(directData.data) && directData.data.length > 0) {
              const formattedList: LLMModel[] = directData.data.map((item: any) =>
                formatOpenRouterModel(item)
              );

              const modelMap = new Map<string, LLMModel>();
              SUPPORTED_MODELS.forEach((m) => modelMap.set(m.id, m));
              formattedList.forEach((m) => {
                if (!modelMap.has(m.id)) {
                  modelMap.set(m.id, m);
                }
              });

              loadedModels = Array.from(modelMap.values());
            }
          }
        } catch (directErr) {
          console.warn('Direct OpenRouter fetch failed:', directErr);
        }
      }

      if (loadedModels && loadedModels.length > 0) {
        setModels(loadedModels);
        setLastModelsUpdate(updatedAt);

        // Update existing teams with enriched metadata if matching IDs exist
        setTeams((prevTeams) =>
          prevTeams.map((team) => ({
            ...team,
            alphaModel: loadedModels!.find((m) => m.id === team.alphaModel.id) || team.alphaModel,
            betaModel: loadedModels!.find((m) => m.id === team.betaModel.id) || team.betaModel,
          }))
        );
      }
    } catch (err) {
      console.warn('Error syncing models from OpenRouter:', err);
    } finally {
      setIsRefreshingModels(false);
    }
  }, [apiKeys.openrouterApiKey]);

  // Initial load of model catalog on mount
  useEffect(() => {
    fetchModels(false);
  }, [fetchModels]);

  // Automatically update Team 1 with the recommended pairing whenever prompt, tier, or auto-toggle changes
  useEffect(() => {
    if (autoSelectTeam && prompt.trim()) {
      const rec = recommendIdealTeamForTask(prompt, tierFilter === 'free');
      const a = models.find((m) => m.id === rec.alphaModelId) || SUPPORTED_MODELS.find((m) => m.id === rec.alphaModelId);
      const b = models.find((m) => m.id === rec.betaModelId) || SUPPORTED_MODELS.find((m) => m.id === rec.betaModelId);
      if (a && b) {
        setTeams((prev) => {
          if (prev.length === 0) return [{ id: 'team-1', name: 'Team 1', alphaModel: a, betaModel: b }];
          return prev.map((t, idx) => (idx === 0 ? { ...t, alphaModel: a, betaModel: b } : t));
        });
      }
    }
  }, [prompt, tierFilter, autoSelectTeam, models]);

  // Team Management Handlers
  const handleAddTeam = () => {
    if (teams.length >= 5) return; // Cap at 5 teams = 10 agents max
    const newIndex = teams.length;
    const pairSuggestion = COMPLEMENTARY_PAIRS[newIndex % COMPLEMENTARY_PAIRS.length];
    const availablePool = tierFilter === 'free' ? models.filter((m) => m.isFree) : models;

    let a = availablePool.find((m) => m.id === pairSuggestion[0]) || availablePool[0] || SUPPORTED_MODELS[0];
    let b = availablePool.find((m) => m.id === pairSuggestion[1]) || availablePool[1] || SUPPORTED_MODELS[1];

    const newTeam: AgentTeam = {
      id: `team-${Date.now()}`,
      name: `Team ${newIndex + 1}`,
      alphaModel: a,
      betaModel: b,
    };

    setTeams((prev) => [...prev, newTeam]);
  };

  const handleRemoveTeam = (teamId: string) => {
    if (teams.length <= 1) return; // Keep at least 1 team
    setTeams((prev) => {
      const filtered = prev.filter((t) => t.id !== teamId);
      return filtered.map((t, idx) => ({ ...t, name: `Team ${idx + 1}` }));
    });
  };

  const handleUpdateTeam = (teamId: string, alphaModel: LLMModel, betaModel: LLMModel) => {
    setAutoSelectTeam(false); // User made explicit custom selection
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, alphaModel, betaModel } : t))
    );
  };

  const handleSelectPair = (alphaId: string, betaId: string) => {
    const a = models.find((m) => m.id === alphaId) || SUPPORTED_MODELS.find((m) => m.id === alphaId);
    const b = models.find((m) => m.id === betaId) || SUPPORTED_MODELS.find((m) => m.id === betaId);
    if (a && b) {
      setTeams((prev) =>
        prev.map((t, idx) => (idx === 0 ? { ...t, alphaModel: a, betaModel: b } : t))
      );
    }
  };

  const handleToggleAutoSelect = (enabled: boolean) => {
    setAutoSelectTeam(enabled);
    if (enabled && prompt.trim()) {
      const rec = recommendIdealTeamForTask(prompt, tierFilter === 'free');
      const a = models.find((m) => m.id === rec.alphaModelId) || SUPPORTED_MODELS.find((m) => m.id === rec.alphaModelId);
      const b = models.find((m) => m.id === rec.betaModelId) || SUPPORTED_MODELS.find((m) => m.id === rec.betaModelId);
      if (a && b) {
        setTeams((prev) =>
          prev.map((t, idx) => (idx === 0 ? { ...t, alphaModel: a, betaModel: b } : t))
        );
      }
    }
  };

  const handleTierFilterChange = (tier: 'all' | 'free') => {
    setTierFilter(tier);
    if (tier === 'free') {
      const freeModels = models.filter((m) => m.isFree);
      if (freeModels.length > 0) {
        setTeams((prev) =>
          prev.map((t, idx) => {
            const a = t.alphaModel.isFree
              ? t.alphaModel
              : freeModels[idx % freeModels.length];
            const b = t.betaModel.isFree
              ? t.betaModel
              : freeModels[(idx + 1) % freeModels.length] || freeModels[0];
            return { ...t, alphaModel: a, betaModel: b };
          })
        );
      }
    }
  };

  const primaryAlpha = teams[0]?.alphaModel || SUPPORTED_MODELS[0];
  const primaryBeta = teams[0]?.betaModel || SUPPORTED_MODELS[1];

  const handleRunMatchup = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setTurns([]);
    setFinalConsensus(null);

    const teamCount = teams.length;
    setLoadingStep(
      teamCount > 1
        ? `${teamCount} Teams (${teamCount * 2} Agents) are synchronizing computation...`
        : `${primaryAlpha.name} is preparing initial proposition...`
    );

    try {
      const timer1 = setTimeout(() => {
        setLoadingStep(
          teamCount > 1
            ? 'Cross-team auditing & invariant stress-testing...'
            : `${primaryBeta.name} is auditing & cross-examining...`
        );
      }, 1400);

      const timer2 = setTimeout(() => {
        setLoadingStep('Synthesizing unified multi-agent consensus deliverable...');
      }, 3000);

      let data: { turns: DialogueTurn[]; finalConsensus: FinalConsensus | null } | null = null;

      try {
        const response = await fetch('/api/collaborate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            teams: teams.map((t) => ({
              id: t.id,
              name: t.name,
              alphaModelId: t.alphaModel.id,
              betaModelId: t.betaModel.id,
              alphaModel: t.alphaModel,
              betaModel: t.betaModel,
            })),
            agentAlphaModelId: primaryAlpha.id,
            agentBetaModelId: primaryBeta.id,
            protocol,
            rounds,
            openrouterApiKey: apiKeys.openrouterApiKey || undefined,
            geminiApiKey: apiKeys.geminiApiKey || undefined,
            openaiApiKey: apiKeys.openaiApiKey || undefined,
            anthropicApiKey: apiKeys.anthropicApiKey || undefined,
            deepseekApiKey: apiKeys.deepseekApiKey || undefined,
            groqApiKey: apiKeys.groqApiKey || undefined,
            customModels: teams.flatMap((t) => [t.alphaModel, t.betaModel]),
          }),
        });

        if (response.ok) {
          data = await response.json();
        }
      } catch {
        // Backend route unavailable (e.g. static host like Vercel)
      }

      // If backend was not available and user provided an OpenRouter key, run direct browser execution
      if (!data && apiKeys.openrouterApiKey) {
        data = await runClientSideCollaboration({
          prompt,
          teams,
          rounds,
          openrouterApiKey: apiKeys.openrouterApiKey,
        });
      }

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!data) {
        throw new Error('Unable to run collaboration. Please check your API key in the API Keys settings menu.');
      }

      setTurns(data.turns || []);
      setFinalConsensus(data.finalConsensus || null);
    } catch (err: any) {
      console.error('Collaboration execution error:', err);
      setErrorMessage(err.message || 'Failed to complete multi-agent collaboration.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const freeModelCount = models.filter((m) => m.isFree).length;
  const hasConfiguredKeys = Boolean(
    apiKeys.openrouterApiKey ||
    apiKeys.geminiApiKey ||
    apiKeys.openaiApiKey ||
    apiKeys.anthropicApiKey ||
    apiKeys.deepseekApiKey ||
    apiKeys.groqApiKey
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenHeatmap={() => setIsHeatmapOpen((prev) => !prev)}
        isHeatmapOpen={isHeatmapOpen}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
        hasOpenRouterKey={hasConfiguredKeys}
        modelCount={models.length}
        freeModelCount={freeModelCount}
        onRefreshModels={() => fetchModels(true)}
        isRefreshingModels={isRefreshingModels}
      />

      {/* Main Single-Tab Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4">
        {/* Optional Teaming Heatmap / Pairings Matrix Drawer */}
        {isHeatmapOpen && (
          <div className="mb-4">
            <TeamingHeatmap
              currentAlphaId={primaryAlpha.id}
              currentBetaId={primaryBeta.id}
              onSelectPair={handleSelectPair}
            />
          </div>
        )}

        {/* 1. Task Input with Auto-Select Slider Toggle, Free Tier Filter, and Go Button */}
        <TaskInput
          prompt={prompt}
          onPromptChange={setPrompt}
          rounds={rounds}
          onRoundsChange={setRounds}
          isLoading={isLoading}
          onRunMatchup={handleRunMatchup}
          loadingStep={loadingStep}
          currentAlphaId={primaryAlpha.id}
          currentBetaId={primaryBeta.id}
          models={models}
          autoSelectTeam={autoSelectTeam}
          onToggleAutoSelect={handleToggleAutoSelect}
          tierFilter={tierFilter}
          onTierFilterChange={handleTierFilterChange}
          onSelectTeam={handleSelectPair}
        />

        {/* 2. Multi-Team Model Selection (Each team has 2 agents & individual Skill Tree Radar Graph; max 5 teams / 10 agents) */}
        <ModelSelector
          teams={teams}
          models={models}
          tierFilter={tierFilter}
          onAddTeam={handleAddTeam}
          onRemoveTeam={handleRemoveTeam}
          onUpdateTeam={handleUpdateTeam}
          onRefreshModels={() => fetchModels(true)}
          isRefreshingModels={isRefreshingModels}
        />

        {/* Error message notice if any */}
        {errorMessage && (
          <div className="mb-3 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white font-bold ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 3. Communication Boxes */}
        <CommunicationBoxes
          teams={teams}
          alphaModel={primaryAlpha}
          betaModel={primaryBeta}
          turns={turns}
          finalConsensus={finalConsensus}
          isLoading={isLoading}
        />
      </main>

      {/* API Settings & Keys Modal */}
      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        apiKeys={apiKeys}
        onSaveKeys={handleSaveKeys}
        onRefreshModels={() => fetchModels(true)}
        isRefreshingModels={isRefreshingModels}
        modelCount={models.length}
        freeModelCount={freeModelCount}
        lastUpdated={lastModelsUpdate}
      />

      {/* Minimal Footer */}
      <footer className="bg-slate-950 py-3 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <span className="font-semibold text-slate-400">TeamWorkAi</span>
          <span className="text-[11px] text-slate-500">
            {teams.length} Team{teams.length > 1 ? 's' : ''} Configured ({teams.length * 2}/10 Agents) • {models.length} Models
          </span>
        </div>
      </footer>
    </div>
  );
}
