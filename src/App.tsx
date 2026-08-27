/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LLMModel, CollaborationProtocol, DialogueTurn, FinalConsensus } from './types';
import { SUPPORTED_MODELS, PRESET_TASKS } from './data/benchmarkData';
import { Header } from './components/Header';
import { TeamingHeatmap } from './components/TeamingHeatmap';
import { ModelSelector } from './components/ModelSelector';
import { TaskInput } from './components/TaskInput';
import { CommunicationBoxes } from './components/CommunicationBoxes';

export default function App() {
  // Model state (Default to Gemini 3.7 Flash + Claude 3.7 Sonnet)
  const [alphaModel, setAlphaModel] = useState<LLMModel>(SUPPORTED_MODELS[0]);
  const [betaModel, setBetaModel] = useState<LLMModel>(SUPPORTED_MODELS[1]);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);

  // Task & Protocol state
  const [prompt, setPrompt] = useState<string>(PRESET_TASKS[0].prompt);
  const [protocol, setProtocol] = useState<CollaborationProtocol>('debate_synthesize');
  const [rounds, setRounds] = useState<number>(2);

  // Execution & dialogue state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [turns, setTurns] = useState<DialogueTurn[]>([]);
  const [finalConsensus, setFinalConsensus] = useState<FinalConsensus | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAlphaChange = (model: LLMModel) => {
    setAlphaModel(model);
  };

  const handleBetaChange = (model: LLMModel) => {
    setBetaModel(model);
  };

  const handleSelectPair = (alphaId: string, betaId: string) => {
    const a = SUPPORTED_MODELS.find((m) => m.id === alphaId);
    const b = SUPPORTED_MODELS.find((m) => m.id === betaId);
    if (a) setAlphaModel(a);
    if (b) setBetaModel(b);
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
      }, 1200);

      const timer2 = setTimeout(() => {
        setLoadingStep('Converging on mutual consensus deliverable...');
      }, 2500);

      const response = await fetch('/api/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          agentAlphaModelId: alphaModel.id,
          agentBetaModelId: betaModel.id,
          protocol,
          rounds,
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenHeatmap={() => setIsHeatmapOpen((prev) => !prev)}
        isHeatmapOpen={isHeatmapOpen}
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

        {/* 1. Task Input (Positioned ABOVE the Models with Real-Time AI Team Analysis) */}
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
          onSelectTeam={handleSelectPair}
        />

        {/* 2. Model Selection (With Radar Graph in the center between Agent Alpha and Agent Beta) */}
        <ModelSelector
          alphaModel={alphaModel}
          betaModel={betaModel}
          onAlphaChange={handleAlphaChange}
          onBetaChange={handleBetaChange}
        />

        {/* Error message notice if any */}
        {errorMessage && (
          <div className="mb-3 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white font-bold ml-4"
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

      {/* Minimal Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <span>TeamWorkAi</span>
          <span className="text-[11px] text-slate-500">
            Multi-Agent Team Collaboration Sandbox
          </span>
        </div>
      </footer>
    </div>
  );
}
