export interface LLMModel {
  id: string;
  name: string;
  brand: string;
  provider: string;
  description: string;
  strengths: string[];
  teamRole: string;
  accentColor: string;
  lightBg: string;
  badgeBorder: string;
  efficiencyTier: 'S' | 'A' | 'B' | 'C';
  contextWindow: string;
}

export interface TeamPairBenchmark {
  agentAlpha: string;
  agentBeta: string;
  teamSetup: string;
  accuracyScore: number; // e.g. 96 (%)
  timeToConsensusSec: number; // e.g. 3.8 (s)
  totalTokens: number; // e.g. 1850
  efficiencyIndex: number; // [(Accuracy ÷ (Time × Tokens)) × 10,000]
  synergyLevel: 'Optimal' | 'High' | 'Solid' | 'Moderate';
  teamworkSpecialty: string;
  recommendedProtocol: string;
}

export type CollaborationProtocol = 
  | 'debate_synthesize'
  | 'architect_auditor'
  | 'lead_verifier'
  | 'creative_refine';

export interface CollaborationTaskRequest {
  prompt: string;
  category?: string;
  agentAlphaModelId: string;
  agentBetaModelId: string;
  protocol: CollaborationProtocol;
  rounds: number;
}

export interface DialogueTurn {
  id: string;
  roundNumber: number;
  agent: 'alpha' | 'beta';
  modelId: string;
  modelName: string;
  agentRole: string;
  content: string;
  keyInsights: string[];
  consensusAgreementScore?: number; // 0 to 100
  turnTokens: number;
  timeMs: number;
}

export interface FinalConsensus {
  agreedSolution: string;
  consensusScore: number; // 0 - 100
  compromisesMade: string[];
  keyStrengthsCombined: string[];
  summaryVerdict: string;
}

export interface CollaborationTelemetry {
  totalWallClockMs: number;
  totalTokens: number;
  accuracyScore: number;
  efficiencyIndex: number; // [(Accuracy ÷ (Time × Tokens)) × 10,000]
  peakEfficiencyBenchmark: number;
  synergyMultiplier: number;
}

export interface CollaborationResult {
  id: string;
  taskPrompt: string;
  protocol: CollaborationProtocol;
  agentAlpha: LLMModel;
  agentBeta: LLMModel;
  turns: DialogueTurn[];
  finalConsensus: FinalConsensus;
  telemetry: CollaborationTelemetry;
  createdAt: string;
}
