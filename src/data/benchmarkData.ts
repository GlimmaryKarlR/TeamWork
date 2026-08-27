import { LLMModel, TeamPairBenchmark } from '../types';

export const SUPPORTED_MODELS: LLMModel[] = [
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    brand: 'Gemini 3.7 Flash',
    provider: 'Google',
    description: 'High-speed hybrid reasoning model with high token throughput and strong consensus convergence.',
    strengths: ['Rapid Inference', 'Multimodal Breadth', 'Cross-Domain Synthesis', 'Adaptive Thinking'],
    teamRole: 'Lead Strategist & Rapid Proposer',
    accentColor: '#3b82f6', // Blue
    lightBg: '#eff6ff',
    badgeBorder: '#93c5fd',
    efficiencyTier: 'S',
    contextWindow: '1M tokens',
    isFree: false,
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    brand: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    description: 'Advanced hybrid reasoning engine with nuanced logic validation and rigorous self-correction.',
    strengths: ['Rigor & Code Architecture', 'Nuanced Critique', 'Safety & Constraint Handling', 'Deep Analysis'],
    teamRole: 'System Architect & Critical Reviewer',
    accentColor: '#d97706', // Amber/Orange
    lightBg: '#fffbeb',
    badgeBorder: '#fde68a',
    efficiencyTier: 'S',
    contextWindow: '200K tokens',
    isFree: false,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    brand: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Omni-modal foundational model with balanced cross-disciplinary problem-solving and structured outputs.',
    strengths: ['Versatility', 'Structured Formats', 'Action Planning', 'Pragmatic Decision Making'],
    teamRole: 'Co-Pilot & Execution Planner',
    accentColor: '#10b981', // Emerald
    lightBg: '#ecfdf5',
    badgeBorder: '#a7f3d0',
    efficiencyTier: 'A',
    contextWindow: '128K tokens',
    isFree: false,
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    brand: 'DeepSeek R1',
    provider: 'DeepSeek',
    description: 'Open-weight reasoning powerhouse specialized in formal mathematical derivations, logic trees, and algorithmic verification.',
    strengths: ['Formal Proofs', 'Algorithmic Optimization', 'Chain-of-Thought Auditing', 'Edge-Case Discovery'],
    teamRole: 'Logic Auditor & Mathematical Prover',
    accentColor: '#6366f1', // Indigo
    lightBg: '#eef2ff',
    badgeBorder: '#c7d2fe',
    efficiencyTier: 'S',
    contextWindow: '128K tokens',
    isFree: true,
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    brand: 'DeepSeek V3',
    provider: 'DeepSeek',
    description: 'High-capacity Mixture-of-Experts architecture delivering balanced analytical throughput and code synthesis.',
    strengths: ['MoE Parallelism', 'Code Refinement', 'Cost Efficiency', 'Broad Reasoning'],
    teamRole: 'Technical Implementer & Optimizer',
    accentColor: '#8b5cf6', // Violet
    lightBg: '#f5f3ff',
    badgeBorder: '#ddd6fe',
    efficiencyTier: 'A',
    contextWindow: '128K tokens',
    isFree: true,
  },
  {
    id: 'qwen-2.5-72b',
    name: 'Qwen 2.5 72B',
    brand: 'Qwen 2.5 72B',
    provider: 'Alibaba Cloud',
    description: 'Flagship multilingual open weights model with strong scientific and technical benchmark fidelity.',
    strengths: ['Multilingual Synthesis', 'Complex Domain STEM', 'Instruction Compliance', 'Explanatory Depth'],
    teamRole: 'Domain Specialist & Knowledge Verifier',
    accentColor: '#06b6d4', // Cyan
    lightBg: '#ecfeff',
    badgeBorder: '#a5f3fc',
    efficiencyTier: 'A',
    contextWindow: '128K tokens',
    isFree: true,
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    brand: 'Llama 3.3 70B',
    provider: 'Meta',
    description: 'Open foundation standard with balanced generalist capability, high token density, and conversational dexterity.',
    strengths: ['Open Flexibility', 'Structured Dialogue', 'Summarization', 'Pragmatic Analysis'],
    teamRole: 'Collaborative Generalist & Formulator',
    accentColor: '#2563eb', // Royal Blue
    lightBg: '#eff6ff',
    badgeBorder: '#bfdbfe',
    efficiencyTier: 'B',
    contextWindow: '128K tokens',
    isFree: true,
  },
  {
    id: 'nova-lite',
    name: 'Nova Lite',
    brand: 'Nova Lite',
    provider: 'Amazon',
    description: 'Ultra-fast low-latency frontier model optimized for lightning-quick rounds and rapid validation cycles.',
    strengths: ['Low Latency', 'Token Economy', 'Concise Summaries', 'High Throughput'],
    teamRole: 'Speed Arbiter & Rapid Filter',
    accentColor: '#f97316', // Orange
    lightBg: '#fff7ed',
    badgeBorder: '#fed7aa',
    efficiencyTier: 'B',
    contextWindow: '300K tokens',
    isFree: false,
  },
  {
    id: 'nemotron-3-30b',
    name: 'Nemotron 3 30B',
    brand: 'Nemotron 3 30B',
    provider: 'NVIDIA',
    description: 'Specialized enterprise agent model tuned for synthetic data verification, alignment, and technical reasoning.',
    strengths: ['Enterprise Verification', 'Constraint Enforcement', 'Synthetic Evaluation', 'Structured QA'],
    teamRole: 'Compliance Officer & Safety Arbiter',
    accentColor: '#84cc16', // Lime
    lightBg: '#f7fee7',
    badgeBorder: '#d9f99d',
    efficiencyTier: 'B',
    contextWindow: '128K tokens',
    isFree: true,
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    brand: 'o3-mini',
    provider: 'OpenAI',
    description: 'Compact specialized reasoning engine designed for tight STEM logic, coding challenges, and fast tree-of-thought convergence.',
    strengths: ['STEM Verification', 'Compact Tree Search', 'Logic Precision', 'Minimal Fluff'],
    teamRole: 'Precision Evaluator & Micro-Auditor',
    accentColor: '#14b8a6', // Teal
    lightBg: '#f0fdfa',
    badgeBorder: '#99f6e4',
    efficiencyTier: 'A',
    contextWindow: '200K tokens',
    isFree: false,
  }
];

// Historical and measured pairing benchmark database based on graphic3.py
// Efficiency Formula: [(Accuracy ÷ (Time × Tokens)) × 10,000]
export const PAIR_BENCHMARKS: Record<string, TeamPairBenchmark> = {
  'gemini-3.7-flash_claude-3-7-sonnet': {
    agentAlpha: 'Gemini 3.7 Flash',
    agentBeta: 'Claude 3.7 Sonnet',
    teamSetup: 'Gemini 3.7 Flash + Claude 3.7 Sonnet',
    accuracyScore: 98,
    timeToConsensusSec: 3.8,
    totalTokens: 1880,
    efficiencyIndex: 137,
    synergyLevel: 'Optimal',
    teamworkSpecialty: 'High-speed proposal paired with rigorous architecture critique & constraint verification.',
    recommendedProtocol: 'debate_synthesize',
  },
  'claude-3-7-sonnet_gemini-3.7-flash': {
    agentAlpha: 'Claude 3.7 Sonnet',
    agentBeta: 'Gemini 3.7 Flash',
    teamSetup: 'Claude 3.7 Sonnet + Gemini 3.7 Flash',
    accuracyScore: 97,
    timeToConsensusSec: 4.0,
    totalTokens: 1910,
    efficiencyIndex: 127,
    synergyLevel: 'Optimal',
    teamworkSpecialty: 'Rigorous architectural drafting paired with rapid multidimensional stress testing.',
    recommendedProtocol: 'architect_auditor',
  },
  'deepseek-r1_claude-3-7-sonnet': {
    agentAlpha: 'DeepSeek R1',
    agentBeta: 'Claude 3.7 Sonnet',
    teamSetup: 'DeepSeek R1 + Claude 3.7 Sonnet',
    accuracyScore: 99,
    timeToConsensusSec: 4.8,
    totalTokens: 1750,
    efficiencyIndex: 118,
    synergyLevel: 'Optimal',
    teamworkSpecialty: 'Mathematical/algorithmic proof generation paired with clean production architecture.',
    recommendedProtocol: 'lead_verifier',
  },
  'gemini-3.7-flash_gpt-4o': {
    agentAlpha: 'Gemini 3.7 Flash',
    agentBeta: 'GPT-4o',
    teamSetup: 'Gemini 3.7 Flash + GPT-4o',
    accuracyScore: 95,
    timeToConsensusSec: 4.1,
    totalTokens: 1900,
    efficiencyIndex: 122,
    synergyLevel: 'High',
    teamworkSpecialty: 'Fast creative exploration combined with pragmatically grounded actionable milestones.',
    recommendedProtocol: 'debate_synthesize',
  },
  'gpt-4o_gemini-3.7-flash': {
    agentAlpha: 'GPT-4o',
    agentBeta: 'Gemini 3.7 Flash',
    teamSetup: 'GPT-4o + Gemini 3.7 Flash',
    accuracyScore: 94,
    timeToConsensusSec: 4.2,
    totalTokens: 1950,
    efficiencyIndex: 115,
    synergyLevel: 'High',
    teamworkSpecialty: 'Structured specification design with rapid multi-angle edge-case generation.',
    recommendedProtocol: 'architect_auditor',
  },
  'deepseek-r1_gpt-4o': {
    agentAlpha: 'DeepSeek R1',
    agentBeta: 'GPT-4o',
    teamSetup: 'DeepSeek R1 + GPT-4o',
    accuracyScore: 96,
    timeToConsensusSec: 4.9,
    totalTokens: 1840,
    efficiencyIndex: 106,
    synergyLevel: 'High',
    teamworkSpecialty: 'Deep reasoning chain verification translated into clear actionable deliverables.',
    recommendedProtocol: 'lead_verifier',
  },
  'gemini-3.7-flash_qwen-2.5-72b': {
    agentAlpha: 'Gemini 3.7 Flash',
    agentBeta: 'Qwen 2.5 72B',
    teamSetup: 'Gemini 3.7 Flash + Qwen 2.5 72B',
    accuracyScore: 93,
    timeToConsensusSec: 4.3,
    totalTokens: 2050,
    efficiencyIndex: 105,
    synergyLevel: 'High',
    teamworkSpecialty: 'Rapid cross-domain conceptualization paired with deep scientific & STEM domain verification.',
    recommendedProtocol: 'debate_synthesize',
  },
  'claude-3-7-sonnet_qwen-2.5-72b': {
    agentAlpha: 'Claude 3.7 Sonnet',
    agentBeta: 'Qwen 2.5 72B',
    teamSetup: 'Claude 3.7 Sonnet + Qwen 2.5 72B',
    accuracyScore: 94,
    timeToConsensusSec: 4.6,
    totalTokens: 2020,
    efficiencyIndex: 101,
    synergyLevel: 'High',
    teamworkSpecialty: 'Strict constraint and edge case analysis coupled with broad multilingual STEM knowledge.',
    recommendedProtocol: 'architect_auditor',
  },
  'o3-mini_gemini-3.7-flash': {
    agentAlpha: 'o3-mini',
    agentBeta: 'Gemini 3.7 Flash',
    teamSetup: 'o3-mini + Gemini 3.7 Flash',
    accuracyScore: 96,
    timeToConsensusSec: 4.2,
    totalTokens: 2030,
    efficiencyIndex: 112,
    synergyLevel: 'High',
    teamworkSpecialty: 'Concise tree-of-thought logic combined with broad synthesis and contextual flow.',
    recommendedProtocol: 'lead_verifier',
  },
  'deepseek-v3_llama-3.3-70b': {
    agentAlpha: 'DeepSeek V3',
    agentBeta: 'Llama 3.3 70B',
    teamSetup: 'DeepSeek V3 + Llama 3.3 70B',
    accuracyScore: 90,
    timeToConsensusSec: 4.7,
    totalTokens: 2040,
    efficiencyIndex: 94,
    synergyLevel: 'Solid',
    teamworkSpecialty: 'Open weights synergy balancing Mixture-of-Experts technical depth and generalist alignment.',
    recommendedProtocol: 'debate_synthesize',
  },
  'nova-lite_gemini-3.7-flash': {
    agentAlpha: 'Nova Lite',
    agentBeta: 'Gemini 3.7 Flash',
    teamSetup: 'Nova Lite + Gemini 3.7 Flash',
    accuracyScore: 88,
    timeToConsensusSec: 3.4,
    totalTokens: 2950,
    efficiencyIndex: 88,
    synergyLevel: 'Solid',
    teamworkSpecialty: 'Ultra-low latency triage with rapid escalation to multimodal depth.',
    recommendedProtocol: 'lead_verifier',
  },
  'nemotron-3-30b_claude-3-7-sonnet': {
    agentAlpha: 'Nemotron 3 30B',
    agentBeta: 'Claude 3.7 Sonnet',
    teamSetup: 'Nemotron 3 30B + Claude 3.7 Sonnet',
    accuracyScore: 89,
    timeToConsensusSec: 5.1,
    totalTokens: 2130,
    efficiencyIndex: 82,
    synergyLevel: 'Solid',
    teamworkSpecialty: 'Strict constraint and compliance filtering with deep engineering architecture review.',
    recommendedProtocol: 'architect_auditor',
  }
};

export function getTeamBenchmark(alphaId: string, betaId: string): TeamPairBenchmark {
  const directKey = `${alphaId}_${betaId}`;
  if (PAIR_BENCHMARKS[directKey]) {
    return PAIR_BENCHMARKS[directKey];
  }

  // Reverse pair lookup if available
  const reverseKey = `${betaId}_${alphaId}`;
  if (PAIR_BENCHMARKS[reverseKey]) {
    const rev = PAIR_BENCHMARKS[reverseKey];
    const alphaModel = SUPPORTED_MODELS.find(m => m.id === alphaId);
    const betaModel = SUPPORTED_MODELS.find(m => m.id === betaId);
    return {
      agentAlpha: alphaModel?.name || alphaId,
      agentBeta: betaModel?.name || betaId,
      teamSetup: `${alphaModel?.name || alphaId} + ${betaModel?.name || betaId}`,
      accuracyScore: Math.max(70, rev.accuracyScore - 2),
      timeToConsensusSec: +(rev.timeToConsensusSec * 1.05).toFixed(1),
      totalTokens: Math.round(rev.totalTokens * 1.03),
      efficiencyIndex: Math.max(40, Math.round(rev.efficiencyIndex * 0.95)),
      synergyLevel: rev.synergyLevel,
      teamworkSpecialty: rev.teamworkSpecialty,
      recommendedProtocol: rev.recommendedProtocol,
    };
  }

  // Compute dynamic deterministic benchmark from model attributes
  const alphaModel = SUPPORTED_MODELS.find(m => m.id === alphaId) || SUPPORTED_MODELS[0];
  const betaModel = SUPPORTED_MODELS.find(m => m.id === betaId) || SUPPORTED_MODELS[1];

  const tierScores: Record<string, number> = { S: 96, A: 90, B: 83, C: 75 };
  const baseAcc = Math.round((tierScores[alphaModel.efficiencyTier] + tierScores[betaModel.efficiencyTier]) / 2);
  
  // Diverse teams score higher than identical model teams (teaming synergy)
  const isSame = alphaId === betaId;
  const synergyBonus = isSame ? -6 : 4;
  const finalAcc = Math.min(99, Math.max(65, baseAcc + synergyBonus));

  const baseTime = (alphaId.includes('flash') || betaId.includes('flash') || alphaId.includes('lite') || betaId.includes('lite')) ? 3.9 : 4.8;
  const timeToConsensus = +(baseTime + (isSame ? 0.6 : 0.0)).toFixed(1);
  const totalTokens = Math.round(1800 + (alphaId.length + betaId.length) * 15);

  // Exact formula: (Accuracy / (Time * Tokens)) * 10,000
  const denom = (timeToConsensus * totalTokens);
  const efficiencyIndex = denom > 0 ? Math.round((finalAcc / denom) * 10000) : 0;

  let synergyLevel: 'Optimal' | 'High' | 'Solid' | 'Moderate' = 'Solid';
  if (efficiencyIndex >= 115) synergyLevel = 'Optimal';
  else if (efficiencyIndex >= 95) synergyLevel = 'High';
  else if (efficiencyIndex >= 70) synergyLevel = 'Solid';
  else synergyLevel = 'Moderate';

  return {
    agentAlpha: alphaModel.name,
    agentBeta: betaModel.name,
    teamSetup: `${alphaModel.name} + ${betaModel.name}`,
    accuracyScore: finalAcc,
    timeToConsensusSec: timeToConsensus,
    totalTokens,
    efficiencyIndex,
    synergyLevel,
    teamworkSpecialty: `Cooperative pairing leveraging ${alphaModel.teamRole} alongside ${betaModel.teamRole}.`,
    recommendedProtocol: 'debate_synthesize',
  };
}

export const PRESET_TASKS = [
  {
    id: 'db_cache_arch',
    title: 'Distributed Database & Cache Synchronization',
    category: 'System Architecture',
    prompt: 'Design a zero-data-loss cache-invalidation and real-time CDC (Change Data Capture) architecture for a globally distributed e-commerce checkout service handling 100,000 concurrent writes per second.',
  },
  {
    id: 'quantum_security',
    title: 'Post-Quantum Cryptography Migration Strategy',
    category: 'Security & Cryptography',
    prompt: 'Analyze cryptographic vulnerabilities in existing RSA-4096 and ECC infrastructure against Shor-algorithm quantum attacks. Propose a hybrid post-quantum key encapsulation (ML-KEM/Kyber) rollout with zero downtime.',
  },
  {
    id: 'game_theory_alloc',
    title: 'Multi-Agent Resource Allocation Dilemma',
    category: 'Game Theory & Logic',
    prompt: 'Construct a mathematically optimal auction and resource allocation mechanism for 5 autonomous computing nodes sharing constrained bandwidth. Formulate the payoff matrix, proof of Nash equilibrium, and anti-collusion safeguards.',
  },
  {
    id: 'ai_eval_framework',
    title: 'Autonomous Multi-LLM Verification Protocol',
    category: 'AI Alignment & Benchmarking',
    prompt: 'Draft an automated dual-blind evaluation framework to score reasoning hallucinations and logical consistency between opposing LLM agents without human-in-the-loop bias.',
  }
];
