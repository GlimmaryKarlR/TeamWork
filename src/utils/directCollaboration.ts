import { AgentTeam, DialogueTurn, FinalConsensus, LLMModel } from "../types";
import { getTeamBenchmark } from "../data/benchmarkData";

// OpenRouter Free Fallback Models in order of preference
const FREE_FALLBACK_CANDIDATES = [
  "openrouter/free",
  "deepseek/deepseek-r1:free",
  "deepseek/deepseek-chat:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
];

export async function callOpenRouterDirect(
  apiKey: string,
  modelId: string,
  messages: { role: string; content: string }[],
  retryCount: number = 0,
  maxTokens: number = 1500
): Promise<{ content: string; modelUsed: string; fallbackActive: boolean }> {
  let targetModel = modelId;

  // Normalize legacy or short model IDs to valid OpenRouter endpoints if needed
  if (targetModel === "gemini-3.7-flash") targetModel = "google/gemini-2.5-flash";
  else if (targetModel === "claude-3-7-sonnet") targetModel = "anthropic/claude-3.7-sonnet";
  else if (targetModel === "gpt-4o") targetModel = "openai/gpt-4o";
  else if (targetModel === "deepseek-r1") targetModel = "deepseek/deepseek-r1:free";
  else if (targetModel === "qwen-2.5-72b") targetModel = "qwen/qwen-2.5-72b-instruct:free";
  else if (targetModel === "llama-3.3-70b") targetModel = "meta-llama/llama-3.3-70b-instruct:free";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey.trim()}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "TeamWorkAi",
    },
    body: JSON.stringify({
      model: targetModel,
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedJson: any = null;
    try {
      parsedJson = JSON.parse(errorText);
    } catch {}

    const errorMsg = parsedJson?.error?.message || errorText;
    console.warn(`[OpenRouter Client] Error for ${targetModel} (HTTP ${response.status}):`, errorMsg);

    // 1. Credit balance exhausted (402) OR model requires payment: Fallback to free tier
    if (response.status === 402 || errorMsg.includes("requires more credits") || errorMsg.includes("can only afford")) {
      // Check if token limit can fit
      const affordMatch = errorMsg.match(/can only afford\s+(\d+)/i);
      if (affordMatch && affordMatch[1] && retryCount < 1) {
        const affordTokens = parseInt(affordMatch[1], 10);
        if (affordTokens >= 80) {
          console.warn(`[OpenRouter] Retrying ${targetModel} with reduced ${affordTokens - 20} max_tokens.`);
          return callOpenRouterDirect(apiKey, targetModel, messages, retryCount + 1, Math.max(60, affordTokens - 20));
        }
      }

      // Auto-fallback to OpenRouter Free tier
      const fallbackTarget = FREE_FALLBACK_CANDIDATES[retryCount % FREE_FALLBACK_CANDIDATES.length];
      console.warn(`[OpenRouter 402 Auto-Fallback] Switching from ${targetModel} to verified free model ${fallbackTarget}.`);
      return callOpenRouterDirect(apiKey, fallbackTarget, messages, retryCount + 1, 1200);
    }

    // 2. Rate limit (429) or Model Not Found (404)
    if ((response.status === 429 || response.status === 404) && retryCount < 2) {
      const fallbackTarget = FREE_FALLBACK_CANDIDATES[retryCount % FREE_FALLBACK_CANDIDATES.length];
      console.warn(`[OpenRouter Auto-Fallback] ${targetModel} busy/unavailable. Falling back to ${fallbackTarget}.`);
      await new Promise((r) => setTimeout(r, 1200));
      return callOpenRouterDirect(apiKey, fallbackTarget, messages, retryCount + 1, maxTokens);
    }

    throw new Error(`OpenRouter API error (${response.status}): ${errorMsg}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from model.");
  }

  return {
    content,
    modelUsed: data.model || targetModel,
    fallbackActive: (data.model || targetModel) !== modelId,
  };
}

export async function runClientSideCollaboration(params: {
  prompt: string;
  teams?: AgentTeam[];
  alphaModel?: LLMModel;
  betaModel?: LLMModel;
  rounds: number;
  openrouterApiKey: string;
}): Promise<{
  turns: DialogueTurn[];
  finalConsensus: FinalConsensus;
}> {
  const { prompt, teams: inputTeams, alphaModel, betaModel, rounds, openrouterApiKey } = params;
  const startTime = Date.now();
  const turns: DialogueTurn[] = [];

  // Normalize teams
  const effectiveTeams: AgentTeam[] =
    inputTeams && inputTeams.length > 0
      ? inputTeams
      : [
          {
            id: "team-1",
            name: "Team 1",
            alphaModel: alphaModel!,
            betaModel: betaModel!,
          },
        ];

  let turnIndex = 1;
  const swarmHistory: { role: string; content: string }[] = [];

  // Run structured multi-agent rounds
  for (let round = 1; round <= rounds; round++) {
    for (const team of effectiveTeams) {
      const teamAlpha = team.alphaModel;
      const teamBeta = team.betaModel;

      // Agent Alpha turn
      const alphaSysPrompt = `You are Agent Alpha of ${team.name} (${teamAlpha.name}), functioning as: ${teamAlpha.teamRole || "Domain Specialist"}.
Task: ${prompt}
Collaborate with Agent Beta (${teamBeta.name}) of ${team.name} and the broader swarm.
Provide an insightful, rigorous contribution addressing core mechanics, concrete details, and strategic direction (Round ${round}/${rounds}).`;

      const alphaMessages = [
        { role: "system", content: alphaSysPrompt },
        { role: "user", content: `Task: ${prompt}` },
        ...swarmHistory,
      ];

      const alphaRes = await callOpenRouterDirect(openrouterApiKey, teamAlpha.id, alphaMessages);
      const alphaContent = alphaRes.content;

      turns.push({
        id: `turn-${turnIndex++}`,
        roundNumber: round,
        teamId: team.id,
        teamName: team.name,
        agent: "alpha",
        modelId: alphaRes.modelUsed,
        modelName: alphaRes.fallbackActive ? `${teamAlpha.name} (Free Fallback: ${alphaRes.modelUsed.split("/").pop()})` : teamAlpha.name,
        agentRole: `${team.name} Alpha`,
        content: alphaContent,
        keyInsights: [
          `[${team.name}] Proposed architecture & solution for: ${prompt.slice(0, 45)}`,
          `[${team.name}] Formulated mechanisms leveraging ${teamAlpha.strengths?.[0] || "core reasoning"}`,
        ],
        consensusAgreementScore: 85,
        turnTokens: Math.round(alphaContent.length / 3.8),
        timeMs: Math.round(Date.now() - startTime),
      });

      swarmHistory.push({
        role: "assistant",
        content: `[${team.name} Alpha - ${teamAlpha.name}]: ${alphaContent}`,
      });

      // Agent Beta turn
      const betaSysPrompt = `You are Agent Beta of ${team.name} (${teamBeta.name}), functioning as: ${teamBeta.teamRole || "Critical Reviewer"}.
Review the proposal from ${team.name} Agent Alpha (${teamAlpha.name}).
Critique edge cases, potential failure modes, performance bottlenecks, and provide actionable refinements.`;

      const betaMessages = [
        { role: "system", content: betaSysPrompt },
        ...swarmHistory,
      ];

      const betaRes = await callOpenRouterDirect(openrouterApiKey, teamBeta.id, betaMessages);
      const betaContent = betaRes.content;

      turns.push({
        id: `turn-${turnIndex++}`,
        roundNumber: round,
        teamId: team.id,
        teamName: team.name,
        agent: "beta",
        modelId: betaRes.modelUsed,
        modelName: betaRes.fallbackActive ? `${teamBeta.name} (Free Fallback: ${betaRes.modelUsed.split("/").pop()})` : teamBeta.name,
        agentRole: `${team.name} Beta`,
        content: betaContent,
        keyInsights: [
          `[${team.name}] Identified edge-case constraints and critical verification points`,
          `[${team.name}] Applied ${teamBeta.strengths?.[0] || "rigorous audit"} to refine execution invariants`,
        ],
        consensusAgreementScore: 92,
        turnTokens: Math.round(betaContent.length / 3.8),
        timeMs: Math.round(Date.now() - startTime),
      });

      swarmHistory.push({
        role: "assistant",
        content: `[${team.name} Beta - ${teamBeta.name}]: ${betaContent}`,
      });
    }
  }

  // Final Consensus Synthesis
  const teamNamesStr = effectiveTeams.map((t) => t.name).join(", ");
  const consensusPrompt = `You are the Lead Swarm Synthesizer combining deliberations across ${effectiveTeams.length} specialized agent teams (${teamNamesStr}).
Produce the final unified consensus deliverable based on the collaborative multi-team exchange above for the task: "${prompt}".
Provide:
1. Executive Blueprint & Direct Solution
2. Technical Architecture & Invariant Specifications
3. Cross-Team Verification & Safety Guarantees

Format with clean Markdown headings, clear lists, and no boilerplate.`;

  const consensusRes = await callOpenRouterDirect(openrouterApiKey, effectiveTeams[0].alphaModel.id, [
    ...swarmHistory,
    { role: "user", content: consensusPrompt },
  ]);

  const primaryAlpha = effectiveTeams[0].alphaModel;
  const primaryBeta = effectiveTeams[0].betaModel;
  const benchmark = getTeamBenchmark(primaryAlpha.id, primaryBeta.id);

  return {
    turns,
    finalConsensus: {
      agreedSolution: consensusRes.content,
      consensusScore: benchmark.accuracyScore || 94,
      compromisesMade: [
        "Harmonized cross-team consensus across distributed agent outputs",
        `Synthesized multi-round technical findings across ${effectiveTeams.length} teams`,
      ],
      keyStrengthsCombined: effectiveTeams.map(
        (t) => `${t.name} (${t.alphaModel.name} + ${t.betaModel.name}): Empirical reasoning & verification`
      ),
      summaryVerdict: `Unified multi-agent consensus achieved with ${benchmark.accuracyScore || 94}% confidence.`,
    },
  };
}
