import { GoogleGenAI } from "@google/genai";

export interface ProviderKeys {
  openrouterApiKey?: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  deepseekApiKey?: string;
  groqApiKey?: string;
  mistralApiKey?: string;
  togetherApiKey?: string;
  perplexityApiKey?: string;
  xaiApiKey?: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerationResult {
  content: string;
  modelUsed: string;
  provider: string;
  tokensUsed?: number;
}

const OPENROUTER_FREE_MODELS = [
  "openrouter/free",
  "deepseek/deepseek-chat:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "nvidia/llama-3.1-nemotron-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
];

export function hasAnyApiKey(keys: ProviderKeys): boolean {
  return Boolean(
    keys.openrouterApiKey?.trim() ||
    keys.geminiApiKey?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    keys.openaiApiKey?.trim() ||
    process.env.OPENAI_API_KEY?.trim() ||
    keys.anthropicApiKey?.trim() ||
    process.env.ANTHROPIC_API_KEY?.trim() ||
    keys.deepseekApiKey?.trim() ||
    process.env.DEEPSEEK_API_KEY?.trim() ||
    keys.groqApiKey?.trim() ||
    process.env.GROQ_API_KEY?.trim() ||
    keys.mistralApiKey?.trim() ||
    process.env.MISTRAL_API_KEY?.trim() ||
    process.env.OPENROUTER_API_KEY?.trim()
  );
}

// 1. OpenRouter Direct Caller
export async function callOpenRouter(
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  maxTokens = 1500,
  retryCount = 0
): Promise<GenerationResult> {
  let targetModel = modelId;
  if (targetModel === "gemini-3.7-flash") targetModel = "google/gemini-2.5-flash";
  else if (targetModel === "claude-3-7-sonnet") targetModel = "anthropic/claude-3.7-sonnet";
  else if (targetModel === "gpt-4o") targetModel = "openai/gpt-4o";
  else if (targetModel === "deepseek-r1") targetModel = "deepseek/deepseek-chat:free";
  else if (targetModel === "deepseek-v3") targetModel = "deepseek/deepseek-chat:free";
  else if (targetModel === "qwen-2.5-72b") targetModel = "qwen/qwen-2.5-72b-instruct:free";
  else if (targetModel === "llama-3.3-70b") targetModel = "meta-llama/llama-3.3-70b-instruct:free";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://ai.studio/build",
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
    let parsed: any = null;
    try {
      parsed = JSON.parse(errorText);
    } catch {}
    const errorMsg = parsed?.error?.message || errorText;
    console.warn(`[OpenRouter Provider] Error for ${targetModel} (HTTP ${response.status}):`, errorMsg);

    // If out of credits (402), attempt affordable or free tier fallback
    if (response.status === 402 || errorMsg.includes("requires more credits") || errorMsg.includes("can only afford")) {
      const affordMatch = errorMsg.match(/can only afford\s+(\d+)/i);
      if (affordMatch && affordMatch[1] && retryCount < 1) {
        const affordable = parseInt(affordMatch[1], 10);
        if (affordable >= 80) {
          return callOpenRouter(apiKey, targetModel, messages, Math.max(60, affordable - 20), retryCount + 1);
        }
      }
      const fallbackTarget = OPENROUTER_FREE_MODELS[retryCount % OPENROUTER_FREE_MODELS.length];
      console.warn(`[OpenRouter 402] Routing ${targetModel} to verified free model ${fallbackTarget}`);
      return callOpenRouter(apiKey, fallbackTarget, messages, 1200, retryCount + 1);
    }

    if ((response.status === 429 || response.status === 404) && retryCount < 2) {
      const fallbackTarget = OPENROUTER_FREE_MODELS[retryCount % OPENROUTER_FREE_MODELS.length];
      await new Promise((r) => setTimeout(r, 1200));
      return callOpenRouter(apiKey, fallbackTarget, messages, maxTokens, retryCount + 1);
    }

    throw new Error(`OpenRouter API Error (${response.status}): ${errorMsg}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`OpenRouter returned empty content for model ${targetModel}`);
  }

  return {
    content,
    modelUsed: data.model || targetModel,
    provider: "OpenRouter",
    tokensUsed: data.usage?.total_tokens || Math.round(content.length / 3.8),
  };
}

// 2. Google Gemini Caller
export async function callGemini(
  apiKey: string,
  modelName: string,
  systemPrompt: string,
  userPrompt: string
): Promise<GenerationResult> {
  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
  
  // Use recommended valid aliases
  const targetModel = "gemini-2.5-flash";

  const response = await ai.models.generateContent({
    model: targetModel,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      maxOutputTokens: 2000,
    },
  });

  const content = response.text || "";
  if (!content.trim()) {
    throw new Error("Gemini returned empty response text.");
  }

  return {
    content,
    modelUsed: targetModel,
    provider: "Google Gemini",
    tokensUsed: Math.round(content.length / 3.8),
  };
}

// 3. OpenAI Caller
export async function callOpenAI(
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  maxTokens = 1500
): Promise<GenerationResult> {
  let targetModel = modelId;
  if (!targetModel.startsWith("gpt-") && !targetModel.startsWith("o1") && !targetModel.startsWith("o3")) {
    targetModel = "gpt-4o";
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
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
    let errorMsg = errorText;
    try {
      const parsed = JSON.parse(errorText);
      errorMsg = parsed?.error?.message || errorText;
    } catch {}
    throw new Error(`OpenAI API Error (${response.status}): ${errorMsg}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`OpenAI returned empty response for ${targetModel}`);

  return {
    content,
    modelUsed: data.model || targetModel,
    provider: "OpenAI",
    tokensUsed: data.usage?.total_tokens || Math.round(content.length / 3.8),
  };
}

// 4. Anthropic Claude Caller
export async function callAnthropic(
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  maxTokens = 1500
): Promise<GenerationResult> {
  let targetModel = "claude-3-7-sonnet-20250219";
  if (modelId.includes("haiku")) targetModel = "claude-3-5-haiku-20241022";
  else if (modelId.includes("3-5-sonnet")) targetModel = "claude-3-5-sonnet-20241022";

  const systemMsg = messages.find((m) => m.role === "system")?.content || "";
  const conversationMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey.trim(),
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: targetModel,
      system: systemMsg,
      messages: conversationMessages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = errorText;
    try {
      const parsed = JSON.parse(errorText);
      errorMsg = parsed?.error?.message || errorText;
    } catch {}
    throw new Error(`Anthropic API Error (${response.status}): ${errorMsg}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  if (!content) throw new Error(`Anthropic returned empty response for ${targetModel}`);

  return {
    content,
    modelUsed: data.model || targetModel,
    provider: "Anthropic",
    tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0) || Math.round(content.length / 3.8),
  };
}

// 5. DeepSeek Caller
export async function callDeepSeek(
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  maxTokens = 1500
): Promise<GenerationResult> {
  const targetModel = modelId.includes("r1") || modelId.includes("reasoner") ? "deepseek-reasoner" : "deepseek-chat";

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
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
    let errorMsg = errorText;
    try {
      const parsed = JSON.parse(errorText);
      errorMsg = parsed?.error?.message || errorText;
    } catch {}
    throw new Error(`DeepSeek API Error (${response.status}): ${errorMsg}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`DeepSeek returned empty response for ${targetModel}`);

  return {
    content,
    modelUsed: data.model || targetModel,
    provider: "DeepSeek",
    tokensUsed: data.usage?.total_tokens || Math.round(content.length / 3.8),
  };
}

// 6. Groq Caller
export async function callGroq(
  apiKey: string,
  modelId: string,
  messages: ChatMessage[],
  maxTokens = 1500
): Promise<GenerationResult> {
  let targetModel = "llama-3.3-70b-versatile";
  if (modelId.includes("mixtral")) targetModel = "mixtral-8x7b-32768";
  else if (modelId.includes("8b")) targetModel = "llama-3.1-8b-instant";

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
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
    let errorMsg = errorText;
    try {
      const parsed = JSON.parse(errorText);
      errorMsg = parsed?.error?.message || errorText;
    } catch {}
    throw new Error(`Groq API Error (${response.status}): ${errorMsg}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Groq returned empty response for ${targetModel}`);

  return {
    content,
    modelUsed: data.model || targetModel,
    provider: "Groq",
    tokensUsed: data.usage?.total_tokens || Math.round(content.length / 3.8),
  };
}

// 7. Universal Agent Turn Dispatcher: Routes each agent to its designated provider
export async function executeAgentTurn(
  modelId: string,
  modelName: string,
  systemPrompt: string,
  messages: ChatMessage[],
  keys: ProviderKeys
): Promise<GenerationResult> {
  const mLower = modelId.toLowerCase();
  const fullMessages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  // 1. Direct Anthropic
  const anthropicKey = keys.anthropicApiKey?.trim() || process.env.ANTHROPIC_API_KEY?.trim();
  if (anthropicKey && (mLower.includes("claude") || mLower.includes("anthropic"))) {
    try {
      return await callAnthropic(anthropicKey, modelId, fullMessages);
    } catch (err: any) {
      console.warn(`[Direct Anthropic failed, falling back to OpenRouter/Gemini]: ${err?.message}`);
    }
  }

  // 2. Direct OpenAI
  const openaiKey = keys.openaiApiKey?.trim() || process.env.OPENAI_API_KEY?.trim();
  if (openaiKey && (mLower.includes("gpt") || mLower.includes("o1") || mLower.includes("o3") || mLower.includes("openai"))) {
    try {
      return await callOpenAI(openaiKey, modelId, fullMessages);
    } catch (err: any) {
      console.warn(`[Direct OpenAI failed, falling back to OpenRouter/Gemini]: ${err?.message}`);
    }
  }

  // 3. Direct DeepSeek
  const deepseekKey = keys.deepseekApiKey?.trim() || process.env.DEEPSEEK_API_KEY?.trim();
  if (deepseekKey && (mLower.includes("deepseek") || mLower.includes("r1"))) {
    try {
      return await callDeepSeek(deepseekKey, modelId, fullMessages);
    } catch (err: any) {
      console.warn(`[Direct DeepSeek failed, falling back to OpenRouter/Gemini]: ${err?.message}`);
    }
  }

  // 4. Direct Groq
  const groqKey = keys.groqApiKey?.trim() || process.env.GROQ_API_KEY?.trim();
  if (groqKey && (mLower.includes("groq") || mLower.includes("llama"))) {
    try {
      return await callGroq(groqKey, modelId, fullMessages);
    } catch (err: any) {
      console.warn(`[Direct Groq failed, falling back to OpenRouter/Gemini]: ${err?.message}`);
    }
  }

  // 5. Direct Google Gemini
  const geminiKey = keys.geminiApiKey?.trim() || process.env.GEMINI_API_KEY?.trim();
  if (geminiKey && (mLower.includes("gemini") || mLower.includes("google"))) {
    try {
      const userPrompt = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
      return await callGemini(geminiKey, modelId, systemPrompt, userPrompt);
    } catch (err: any) {
      console.warn(`[Direct Gemini failed, checking OpenRouter]: ${err?.message}`);
    }
  }

  // 6. OpenRouter Universal Routing (Can route to any model in the catalog!)
  const openrouterKey = keys.openrouterApiKey?.trim() || process.env.OPENROUTER_API_KEY?.trim();
  if (openrouterKey) {
    return await callOpenRouter(openrouterKey, modelId, fullMessages);
  }

  // 7. If model didn't match a direct provider but user provided ANY key, use whatever key they provided!
  if (geminiKey) {
    const userPrompt = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
    return await callGemini(geminiKey, modelId, systemPrompt, userPrompt);
  }
  if (openaiKey) {
    return await callOpenAI(openaiKey, "gpt-4o", fullMessages);
  }
  if (anthropicKey) {
    return await callAnthropic(anthropicKey, "claude-3-7-sonnet-20250219", fullMessages);
  }
  if (deepseekKey) {
    return await callDeepSeek(deepseekKey, "deepseek-chat", fullMessages);
  }
  if (groqKey) {
    return await callGroq(groqKey, "llama-3.3-70b-versatile", fullMessages);
  }

  // NO API KEY PROVIDED
  throw new Error(
    `No API Key configured to run ${modelName} (${modelId}). Please enter your OpenRouter, Gemini, OpenAI, Anthropic, DeepSeek, or Groq API key in the API Settings (click API Keys in the top header).`
  );
}
