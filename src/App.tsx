/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LLMModel, CollaborationProtocol, DialogueTurn, FinalConsensus } from './types';
import { SUPPORTED_MODELS, PRESET_TASKS } from './data/benchmarkData';
import { recommendIdealTeamForTask } from './data/radarData';
import { Header } from './components/Header';
import { TeamingHeatmap } from './components/TeamingHeatmap';
import { ModelSelector } from './components/ModelSelector';
import { TaskInput } from './components/TaskInput';
import { CommunicationBoxes } from './components/CommunicationBoxes';
import { ApiSettingsModal } from './components/ApiSettingsModal';

const STORAGE_KEY = 'teamwork_api_settings';

export default function App() {
  // Models catalog state (initializes with core supported models, dynamically expanded from OpenRouter)
  const [models, setModels] = useState<LLMModel[]>(SUPPORTED_MODELS);
  const [isRefreshingModels, setIsRefreshingModels] = useState(false);
  const [lastModelsUpdate, setLastModelsUpdate] = useState<string>('');

  // API Keys state
  const [openrouterApiKey, setOpenrouterApiKey] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState(false);

  // Active Model selection
  const [alphaModel, setAlphaModel] = useState<LLMModel>(SUPPORTED_MODELS[0]);
  const [betaModel, setBetaModel] = useState<LLMModel>(SUPPORTED_MODELS[1]);
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
        if (parsed.openrouterApiKey) setOpenrouterApiKey(parsed.openrouterApiKey);
        if (parsed.geminiApiKey) setGeminiApiKey(parsed.geminiApiKey);
      }
    } catch (e) {
      console.warn('Could not load api settings from localStorage', e);
    }
  }, []);

  // Save API keys to localStorage
  const handleSaveKeys = (orKey: string, gemKey: string) => {
    setOpenrouterApiKey(orKey);
    setGeminiApiKey(gemKey);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ openrouterApiKey: orKey, geminiApiKey: gemKey })
      );
    } catch (e) {
      console.warn('Could not save api settings to localStorage', e);
    }
  };

  // Fetch or refresh models catalog from OpenRouter
  const fetchModels = useCallback(async (forceRefresh = false, customOrKey?: string) => {
    setIsRefreshingModels(true);
    try {
      const keyToUse = customOrKey !== undefined ? customOrKey : openrouterApiKey;
      const queryParams = new URLSearchParams();
      if (forceRefresh) queryParams.set('refresh', 'true');
      if (keyToUse) queryParams.set('apiKey', keyToUse);

      const url = `/api/openrouter/models?${queryParams.toString()}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.models) && data.models.length > 0) {
          setModels(data.models);
          setLastModelsUpdate(data.lastUpdated || new Date().toISOString());

          // Preserve selected alpha / beta with updated metadata if present
          setAlphaModel((prev) => data.models.find((m: LLMModel) => m.id === prev.id) || prev);
          setBetaModel((prev) => data.models.find((m: LLMModel) => m.id === prev.id) || prev);
        }
      }
    } catch (err) {
      console.warn('Error syncing models from OpenRouter:', err);
    } finally {
      setIsRefreshingModels(false);
    }
  }, [openrouterApiKey]);

  // Initial load of model catalog on mount
  useEffect(() => {
    fetchModels(false);
  }, [fetchModels]);

  // Automatically update the equipped team whenever prompt, tier, or auto-toggle changes
  useEffect(() => {
    if (autoSelectTeam && prompt.trim()) {
      const rec = recommendIdealTeamForTask(prompt, tierFilter === 'free');
      const a = models.find((m) => m.id === rec.alphaModelId) || SUPPORTED_MODELS.find((m) => m.id === rec.alphaModelId);
      const b = models.find((m) => m.id === rec.betaModelId) || SUPPORTED_MODELS.find((m) => m.id === rec.betaModelId);
      if (a && b) {
        setAlphaModel(a);
        setBetaModel(b);
      }
    }
  }, [prompt, tierFilter, autoSelectTeam, models]);

  const handleAlphaChange = (model: LLMModel) => {
    setAlphaModel(model);
    setAutoSelectTeam(false); // User made explicit custom selection
  };

  const handleBetaChange = (model: LLMModel) => {
    setBetaModel(model);
    setAutoSelectTeam(false); // User made explicit custom selection
  };

  const handleSelectPair = (alphaId: string, betaId: string) => {
    const a = models.find((m) => m.id === alphaId) || SUPPORTED_MODELS.find((m) => m.id === alphaId);
    const b = models.find((m) => m.id === betaId) || SUPPORTED_MODELS.find((m) => m.id === betaId);
    if (a) setAlphaModel(a);
    if (b) setBetaModel(b);
  };

  const handleToggleAutoSelect = (enabled: boolean) => {
    setAutoSelectTeam(enabled);
    if (enabled && prompt.trim()) {
      const rec = recommendIdealTeamForTask(prompt, tierFilter === 'free');
      const a = models.find((m) => m.id === rec.alphaModelId) || SUPPORTED_MODELS.find((m) => m.id === rec.alphaModelId);
      const b = models.find((m) => m.id === rec.betaModelId) || SUPPORTED_MODELS.find((m) => m.id === rec.betaModelId);
      if (a && b) {
        setAlphaModel(a);
        setBetaModel(b);
      }
    }
  };

  const handleTierFilterChange = (tier: 'all' | 'free') => {
    setTierFilter(tier);
    if (tier === 'free') {
      const freeModels = models.filter((m) => m.isFree);
      if (!alphaModel.isFree && freeModels[0]) {
        setAlphaModel(freeModels[0]);
      }
      if (!betaModel.isFree && freeModels[1]) {
        setBetaModel(freeModels[1]);
      }
    }
  };

  const handleRunMatchup = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    setTurns([]);
    setFinalConsensus(null);

    setLoadingStep(`${alphaModel.name} is preparing initial proposition...`);

    try {
      const timer1 = setTimeout(() => {
        setLoadingStep(`${betaModel.name} is auditing & cross-examining...`);
      }, 1400);

      const timer2 = setTimeout(() => {
        setLoadingStep('Converging on mutual consensus deliverable...');
      }, 3000);

      const response = await fetch('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          agentAlphaModelId: alphaModel.id,
          agentBetaModelId: betaModel.id,
          protocol,
          rounds,
          openrouterApiKey: openrouterApiKey || undefined,
          geminiApiKey: geminiApiKey || undefined,
          customModels: [alphaModel, betaModel],
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenHeatmap={() => setIsHeatmapOpen((prev) => !prev)}
        isHeatmapOpen={isHeatmapOpen}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
        hasOpenRouterKey={Boolean(openrouterApiKey)}
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
              currentAlphaId={alphaModel.id}
              currentBetaId={betaModel.id}
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
          currentAlphaId={alphaModel.id}
          currentBetaId={betaModel.id}
          models={models}
          autoSelectTeam={autoSelectTeam}
          onToggleAutoSelect={handleToggleAutoSelect}
          tierFilter={tierFilter}
          onTierFilterChange={handleTierFilterChange}
          onSelectTeam={handleSelectPair}
        />

        {/* 2. Model Selection (With Radar Graph in the center between Agent Alpha and Agent Beta) */}
        <ModelSelector
          alphaModel={alphaModel}
          betaModel={betaModel}
          models={models}
          tierFilter={tierFilter}
          onAlphaChange={handleAlphaChange}
          onBetaChange={handleBetaChange}
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
          alphaModel={alphaModel}
          betaModel={betaModel}
          turns={turns}
          finalConsensus={finalConsensus}
          isLoading={isLoading}
        />
      </main>

      {/* API Settings & OpenRouter Key Modal */}
      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
        openrouterApiKey={openrouterApiKey}
        geminiApiKey={geminiApiKey}
        onSaveKeys={handleSaveKeys}
        onRefreshModels={() => fetchModels(true)}
        isRefreshingModels={isRefreshingModels}
        modelCount={models.length}
        freeModelCount={freeModelCount}
        lastUpdated={lastModelsUpdate}
      />

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <span className="font-semibold text-slate-400">TeamWorkAi</span>
          <span className="text-[11px] text-slate-500">
            OpenRouter Catalog ({models.length} Models • {freeModelCount} Free)
          </span>
        </div>
      </footer>
    </div>
  );
}
