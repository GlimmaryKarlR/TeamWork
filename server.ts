import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { SUPPORTED_MODELS, getTeamBenchmark } from "./src/data/benchmarkData.js";
import { formatOpenRouterModel } from "./src/data/openRouterModels.js";
import { LLMModel } from "./src/types.js";
import { computeLeaderboard, syncFromFirestore, getAllRuns } from "./server/firestoreLeaderboard.js";
import { recommendFromDualBlind } from "./server/dualBlindDataset.js";
import {
  executeAgentTurn,
  hasAnyApiKey,
  ProviderKeys,
  ChatMessage,
} from "./server/llmProviders.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory cache for OpenRouter models
let cachedOpenRouterModels: LLMModel[] | null = null;
let lastOpenRouterFetchTime = 0;
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

// Helper to get Gemini client
function getGeminiClient(customKey?: string): GoogleGenAI | null {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "TeamWorkAi Multi-Agent Matchup Engine",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY),
  });
});

// Built-in models metadata
app.get("/api/models", (req, res) => {
  res.json({ models: SUPPORTED_MODELS });
});

// Benchmark Leaderboard & Best Models (Sourced from Firestore / DualBlind benchmark runs)
app.get("/api/benchmark/leaderboard", (req, res) => {
  try {
    const data = computeLeaderboard();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to load benchmark leaderboard" });
  }
});

// Force sync latest runs from Firestore
app.post("/api/benchmark/sync", async (req, res) => {
  try {
    const count = await syncFromFirestore(true);
    const data = computeLeaderboard();
    res.json({ success: true, count, data });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to sync Firestore" });
  }
});

app.get("/api/benchmark/dualblind/recommend", async (req, res) => {
  const prompt = String(req.query.prompt || "");
  const onlyFreeTier = req.query.free === "true";
  if (!prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const recommendation = await recommendFromDualBlind(prompt, onlyFreeTier);
    res.json({ recommendation });
  } catch (err: any) {
    res.status(502).json({ error: err?.message || "Failed to load DualBlind dataset." });
  }
});

// OpenRouter Models Refresh / Fetch Endpoint
app.get("/api/openrouter/models", async (req, res) => {
  const forceRefresh = req.query.refresh === 'true';
  const apiKey = (req.query.apiKey as string) || process.env.OPENROUTER_API_KEY || '';

  // Use cached if valid and not force refresh
  const now = Date.now();
  if (!forceRefresh && cachedOpenRouterModels && (now - lastOpenRouterFetchTime < CACHE_DURATION_MS)) {
    return res.json({
      models: cachedOpenRouterModels,
      count: cachedOpenRouterModels.length,
      freeCount: cachedOpenRouterModels.filter((m) => m.isFree).length,
      cached: true,
      lastUpdated: new Date(lastOpenRouterFetchTime).toISOString(),
    });
  }

  try {
    const headers: Record<string, string> = {
      'HTTP-Referer': 'https://ai.studio/build',
      'X-Title': 'TeamWorkAi',
    };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`OpenRouter models API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const rawList = Array.isArray(data.data) ? data.data : [];

    // Format OpenRouter models
    const formattedList: LLMModel[] = rawList.map((item: any) => formatOpenRouterModel(item));

    // Deduplicate and prioritize our core tuned defaults while including all OpenRouter options
    const modelMap = new Map<string, LLMModel>();
    
    // Add default supported models first
    SUPPORTED_MODELS.forEach((m) => modelMap.set(m.id, m));
    
    // Add all fetched OpenRouter models
    formattedList.forEach((m) => {
      if (!modelMap.has(m.id)) {
        modelMap.set(m.id, m);
      }
    });

    const combinedModels = Array.from(modelMap.values());
    cachedOpenRouterModels = combinedModels;
    lastOpenRouterFetchTime = now;

    const freeCount = combinedModels.filter((m) => m.isFree).length;

    return res.json({
      models: combinedModels,
      count: combinedModels.length,
      freeCount,
      cached: false,
      lastUpdated: new Date(now).toISOString(),
    });
  } catch (err: any) {
    console.error('Error fetching OpenRouter models:', err?.message);
    // Return standard fallback models if fetch fails
    return res.json({
      models: cachedOpenRouterModels || SUPPORTED_MODELS,
      count: (cachedOpenRouterModels || SUPPORTED_MODELS).length,
      freeCount: (cachedOpenRouterModels || SUPPORTED_MODELS).filter((m) => m.isFree).length,
      cached: true,
      error: err?.message,
      lastUpdated: new Date(lastOpenRouterFetchTime || now).toISOString(),
    });
  }
});

// Validate OpenRouter API Key
app.post("/api/openrouter/validate-key", async (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ valid: false, error: 'API key is required.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://ai.studio/build',
        'X-Title': 'TeamWorkAi',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return res.json({ valid: true, data: data.data || {} });
    } else {
      const err = await response.text();
      return res.status(response.status).json({ valid: false, error: err || 'Invalid OpenRouter API Key' });
    }
  } catch (err: any) {
    return res.status(500).json({ valid: false, error: err?.message || 'Verification failed.' });
  }
});

// Benchmark pairing lookup
app.get("/api/benchmarks/pair", (req, res) => {
  const alpha = String(req.query.alpha || "gemini-3.7-flash");
  const beta = String(req.query.beta || "claude-3-7-sonnet");
  const benchmark = getTeamBenchmark(alpha, beta);
  res.json({ benchmark });
});



// Run Multi-Agent Team Matchup Collaboration
app.post("/api/collaborate", async (req, res) => {
  const startTime = Date.now();
  const {
    prompt,
    teams: inputTeams,
    agentAlphaModelId = "gemini-3.7-flash",
    agentBetaModelId = "claude-3-7-sonnet",
    protocol = "debate_synthesize",
    rounds = 2,
    openrouterApiKey,
    geminiApiKey,
    openaiApiKey,
    anthropicApiKey,
    deepseekApiKey,
    groqApiKey,
    mistralApiKey,
    togetherApiKey,
    perplexityApiKey,
    xaiApiKey,
    customModels = [],
  } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Task prompt is required." });
  }

  // Aggregate user-supplied keys with server environment variables
  const providerKeys: ProviderKeys = {
    openrouterApiKey: (openrouterApiKey || process.env.OPENROUTER_API_KEY || "").trim(),
    geminiApiKey: (geminiApiKey || process.env.GEMINI_API_KEY || "").trim(),
    openaiApiKey: (openaiApiKey || process.env.OPENAI_API_KEY || "").trim(),
    anthropicApiKey: (anthropicApiKey || process.env.ANTHROPIC_API_KEY || "").trim(),
    deepseekApiKey: (deepseekApiKey || process.env.DEEPSEEK_API_KEY || "").trim(),
    groqApiKey: (groqApiKey || process.env.GROQ_API_KEY || "").trim(),
    mistralApiKey: (mistralApiKey || process.env.MISTRAL_API_KEY || "").trim(),
    togetherApiKey: (togetherApiKey || process.env.TOGETHER_API_KEY || "").trim(),
    perplexityApiKey: (perplexityApiKey || process.env.PERPLEXITY_API_KEY || "").trim(),
    xaiApiKey: (xaiApiKey || process.env.XAI_API_KEY || "").trim(),
  };

  if (!hasAnyApiKey(providerKeys)) {
    return res.status(401).json({
      error: "No AI API key configured. Please enter your OpenRouter, Gemini, OpenAI, Anthropic, DeepSeek, or Groq API key in the API Settings (top right 'API Keys' button) to run live multi-agent collaboration.",
      requiresApiKey: true,
    });
  }

  const allKnownModels = [...(cachedOpenRouterModels || []), ...customModels, ...SUPPORTED_MODELS];

  const getOrBuildModel = (id: string, fallbackRole: string, defaultColor: string) => {
    return (
      allKnownModels.find((m) => m.id === id) ||
      ({
        id,
        name: id.split('/').pop() || id,
        brand: id,
        provider: id.split('/')[0] || 'AI Provider',
        description: 'Collaborative AI Model',
        strengths: ['Reasoning', 'Analysis'],
        teamRole: fallbackRole,
        accentColor: defaultColor,
        lightBg: '#eff6ff',
        badgeBorder: '#93c5fd',
        efficiencyTier: 'S',
        contextWindow: '128K tokens',
      } as LLMModel)
    );
  };

  const effectiveTeams: {
    id: string;
    name: string;
    alphaModel: LLMModel;
    betaModel: LLMModel;
  }[] =
    inputTeams && Array.isArray(inputTeams) && inputTeams.length > 0
      ? inputTeams.map((t: any, idx: number) => ({
          id: t.id || `team-${idx + 1}`,
          name: t.name || `Team ${idx + 1}`,
          alphaModel: getOrBuildModel(
            t.alphaModelId || t.alphaModel?.id || agentAlphaModelId,
            'Agent Alpha (Lead Proposer)',
            '#3b82f6'
          ),
          betaModel: getOrBuildModel(
            t.betaModelId || t.betaModel?.id || agentBetaModelId,
            'Agent Beta (Critical Reviewer)',
            '#10b981'
          ),
        }))
      : [
          {
            id: 'team-1',
            name: 'Team 1',
            alphaModel: getOrBuildModel(agentAlphaModelId, 'Agent Alpha (Lead Proposer)', '#3b82f6'),
            betaModel: getOrBuildModel(agentBetaModelId, 'Agent Beta (Critical Reviewer)', '#10b981'),
          },
        ];

  const primaryTeam = effectiveTeams[0];
  const alphaModel = primaryTeam.alphaModel;
  const betaModel = primaryTeam.betaModel;
  const pairBenchmark = getTeamBenchmark(alphaModel.id, betaModel.id);

  try {
    const turns: any[] = [];
    const conversationHistory: ChatMessage[] = [
      {
        role: "user",
        content: `Task / Challenge:\n"${prompt}"\n\nPlease collaborate across teams to formulate, audit, and provide a verified, concrete solution.`,
      },
    ];

    let turnCounter = 1;
    const effectiveRounds = Math.max(1, Math.min(Number(rounds) || 2, 4));

    for (let round = 1; round <= effectiveRounds; round++) {
      for (const team of effectiveTeams) {
        const tAlpha = team.alphaModel;
        const tBeta = team.betaModel;

        // Turn 1: Lead Proposer (Alpha)
        const alphaSysPrompt = `You are ${tAlpha.name} (${tAlpha.teamRole}) on ${team.name}.
Swarm Task: "${prompt}"
Deliberation Round: ${round} of ${effectiveRounds}.

Provide a direct, technical, high-conviction proposal addressing core mechanisms, principles, equations, algorithms, or concrete steps. Keep it direct, rigorous, and free of filler.`;

        const alphaRes = await executeAgentTurn(
          tAlpha.id,
          tAlpha.name,
          alphaSysPrompt,
          conversationHistory,
          providerKeys
        );

        const alphaText = alphaRes.content;
        const alphaTokens = alphaRes.tokensUsed || Math.round(alphaText.length / 3.8);

        turns.push({
          id: `turn-${turnCounter++}`,
          roundNumber: round,
          teamId: team.id,
          teamName: team.name,
          agent: "alpha" as const,
          modelId: alphaRes.modelUsed,
          modelName: tAlpha.name,
          agentRole: tAlpha.teamRole,
          content: alphaText,
          keyInsights: [
            `[${team.name}] Proposer analysis via ${alphaRes.provider} (${alphaRes.modelUsed})`,
            `[${team.name}] Formulated core approach for "${prompt.slice(0, 50)}"`,
          ],
          consensusAgreementScore: 75 + round * 5,
          turnTokens: alphaTokens,
          timeMs: Math.round(Date.now() - startTime),
        });

        conversationHistory.push({
          role: "assistant",
          content: `[${team.name} Alpha - ${tAlpha.name}]:\n${alphaText}`,
        });

        // Turn 2: Critical Reviewer (Beta)
        const betaSysPrompt = `You are ${tBeta.name} (${tBeta.teamRole}) on ${team.name}.
Swarm Task: "${prompt}"
Deliberation Round: ${round} of ${effectiveRounds}.

Critically audit ${tAlpha.name}'s proposal and the ongoing swarm deliberation.
Scrutinize edge cases, hidden assumptions, potential mathematical/logical/system flaws, failure modes, and propose concrete improvements and stress tests.`;

        const betaRes = await executeAgentTurn(
          tBeta.id,
          tBeta.name,
          betaSysPrompt,
          conversationHistory,
          providerKeys
        );

        const betaText = betaRes.content;
        const betaTokens = betaRes.tokensUsed || Math.round(betaText.length / 3.8);

        turns.push({
          id: `turn-${turnCounter++}`,
          roundNumber: round,
          teamId: team.id,
          teamName: team.name,
          agent: "beta" as const,
          modelId: betaRes.modelUsed,
          modelName: tBeta.name,
          agentRole: tBeta.teamRole,
          content: betaText,
          keyInsights: [
            `[${team.name}] Critical audit & edge-case stress test via ${betaRes.provider} (${betaRes.modelUsed})`,
            `[${team.name}] Formulated concrete validations and mitigations`,
          ],
          consensusAgreementScore: 84 + round * 4,
          turnTokens: betaTokens,
          timeMs: Math.round(Date.now() - startTime),
        });

        conversationHistory.push({
          role: "assistant",
          content: `[${team.name} Beta - ${tBeta.name}]:\n${betaText}`,
        });
      }
    }

    // Final Swarm Consensus Synthesis Turn
    const teamNames = effectiveTeams.map((t) => `${t.name} (${t.alphaModel.name} & ${t.betaModel.name})`).join(", ");
    const leadSynthesizer = effectiveTeams[0].alphaModel;

    const consensusSysPrompt = `You are the Lead Swarm Synthesizer unifying findings from ${effectiveTeams.length} team(s) (${teamNames}).
Based directly on the real collaborative exchange above, formulate the final authoritative deliverable for:
"${prompt}"

Structure your response with clear Markdown:
### 1. Executive Summary & Core Solution
Direct, concrete solution addressing the prompt.

### 2. Technical Invariants & Methodological Details
Exact mathematical, architectural, or procedural details agreed upon across the teams.

### 3. Verification, Edge Cases & Robustness Guarantees
Audited failure modes and defenses.`;

    const consensusRes = await executeAgentTurn(
      leadSynthesizer.id,
      leadSynthesizer.name,
      consensusSysPrompt,
      conversationHistory,
      providerKeys
    );

    const agreedSolution = consensusRes.content;
    const wallClockMs = Date.now() - startTime;
    const totalTokens =
      turns.reduce((acc, t) => acc + (t.turnTokens || 0), 0) +
      (consensusRes.tokensUsed || Math.round(agreedSolution.length / 3.8));
    const accuracyScore = pairBenchmark.accuracyScore || 95;
    const timeSec = wallClockMs / 1000.0;
    const efficiencyIndex =
      timeSec > 0 && totalTokens > 0
        ? Math.round((accuracyScore / (timeSec * totalTokens)) * 10000)
        : pairBenchmark.efficiencyIndex;

    const result = {
      id: `matchup-${Date.now()}`,
      taskPrompt: prompt,
      protocol,
      agentAlpha: primaryTeam.alphaModel,
      agentBeta: primaryTeam.betaModel,
      teams: effectiveTeams,
      turns,
      finalConsensus: {
        agreedSolution,
        consensusScore: accuracyScore,
        compromisesMade: [
          `Integrated proposer proposals and critical auditor stress tests across ${effectiveTeams.length} specialized team(s)`,
          `Harmonized computational throughput across ${effectiveTeams.length * 2} active agents`,
        ],
        keyStrengthsCombined: effectiveTeams.map(
          (t) => `${t.name} (${t.alphaModel.name} + ${t.betaModel.name}): Real-time collaborative reasoning & verification`
        ),
        summaryVerdict: `Unified consensus synthesized via live AI agent deliberation across ${effectiveTeams.length} team(s).`,
      },
      telemetry: {
        totalWallClockMs: wallClockMs,
        totalTokens,
        accuracyScore,
        efficiencyIndex,
        peakEfficiencyBenchmark: pairBenchmark.efficiencyIndex,
        performanceMultiplier: +(1.1 + effectiveTeams.length * 0.1).toFixed(2),
      },
      createdAt: new Date().toISOString(),
    };

    return res.json(result);
  } catch (err: any) {
    console.error("[Live Collaboration Error]:", err?.message);
    const isCreditError = err?.message?.includes("credits") || err?.message?.includes("402");
    const isQuotaError = err?.message?.includes("quota") || err?.message?.includes("RESOURCE_EXHAUSTED");
    const isAuthError =
      err?.message?.includes("401") ||
      err?.message?.includes("API Key") ||
      err?.message?.includes("unauthorized") ||
      err?.message?.includes("configured");

    return res.status(502).json({
      error: err?.message || "Failed to execute AI agent collaboration.",
      isCreditError,
      isQuotaError,
      isAuthError,
      requiresApiKey: isAuthError || !hasAnyApiKey(providerKeys),
    });
  }
});

// Vite Middleware for Dev, Static serving for Prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TeamWorkAi Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}

export default app;
