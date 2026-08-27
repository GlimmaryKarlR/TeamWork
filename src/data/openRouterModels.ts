import { LLMModel } from '../types';
import { SUPPORTED_MODELS } from './benchmarkData';

/**
 * Format provider name from model ID prefix
 */
export function extractProvider(modelId: string, rawName?: string): string {
  const prefix = modelId.split('/')[0]?.toLowerCase() || '';
  if (prefix.includes('google')) return 'Google';
  if (prefix.includes('anthropic')) return 'Anthropic';
  if (prefix.includes('openai')) return 'OpenAI';
  if (prefix.includes('deepseek')) return 'DeepSeek';
  if (prefix.includes('meta-llama') || prefix.includes('meta')) return 'Meta';
  if (prefix.includes('qwen') || prefix.includes('alibaba')) return 'Qwen';
  if (prefix.includes('mistral') || prefix.includes('mistralai')) return 'Mistral';
  if (prefix.includes('nvidia')) return 'Nvidia';
  if (prefix.includes('cohere')) return 'Cohere';
  if (prefix.includes('amazon') || prefix.includes('nova')) return 'Amazon';
  if (prefix.includes('microsoft')) return 'Microsoft';
  if (prefix.includes('x-ai') || prefix.includes('grok')) return 'xAI';
  if (prefix.includes('01-ai')) return '01.AI';
  
  if (rawName) {
    if (rawName.toLowerCase().includes('google')) return 'Google';
    if (rawName.toLowerCase().includes('anthropic')) return 'Anthropic';
    if (rawName.toLowerCase().includes('openai')) return 'OpenAI';
    if (rawName.toLowerCase().includes('deepseek')) return 'DeepSeek';
    if (rawName.toLowerCase().includes('llama')) return 'Meta';
    if (rawName.toLowerCase().includes('qwen')) return 'Qwen';
    if (rawName.toLowerCase().includes('mistral')) return 'Mistral';
  }
  
  return prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : 'OpenRouter';
}

/**
 * Assign theme visual colors based on provider
 */
export function getProviderVisualTheme(provider: string): {
  accentColor: string;
  lightBg: string;
  badgeBorder: string;
} {
  const p = provider.toLowerCase();
  if (p.includes('google')) {
    return { accentColor: '#3b82f6', lightBg: '#eff6ff', badgeBorder: '#93c5fd' }; // Blue
  }
  if (p.includes('anthropic')) {
    return { accentColor: '#d97706', lightBg: '#fffbeb', badgeBorder: '#fde68a' }; // Amber
  }
  if (p.includes('openai')) {
    return { accentColor: '#10b981', lightBg: '#ecfdf5', badgeBorder: '#a7f3d0' }; // Emerald
  }
  if (p.includes('deepseek')) {
    return { accentColor: '#6366f1', lightBg: '#eef2ff', badgeBorder: '#c7d2fe' }; // Indigo
  }
  if (p.includes('meta')) {
    return { accentColor: '#0284c7', lightBg: '#f0f9ff', badgeBorder: '#bae6fd' }; // Sky
  }
  if (p.includes('mistral')) {
    return { accentColor: '#ea580c', lightBg: '#fff7ed', badgeBorder: '#ffedd5' }; // Orange
  }
  if (p.includes('qwen')) {
    return { accentColor: '#06b6d4', lightBg: '#ecfeff', badgeBorder: '#a5f3fc' }; // Cyan
  }
  if (p.includes('nvidia')) {
    return { accentColor: '#84cc16', lightBg: '#f7fee7', badgeBorder: '#d9f99d' }; // Lime
  }
  return { accentColor: '#8b5cf6', lightBg: '#f5f3ff', badgeBorder: '#ddd6fe' }; // Purple
}

/**
 * Assign intelligent team role based on model capabilities
 */
export function getTeamRoleForModel(id: string, name: string): string {
  const s = (id + ' ' + name).toLowerCase();
  if (s.includes('r1') || s.includes('reason') || s.includes('o1') || s.includes('o3') || s.includes('thinking')) {
    return 'Logic Auditor & Mathematical Prover';
  }
  if (s.includes('coder') || s.includes('code') || s.includes('dev') || s.includes('starcoder')) {
    return 'Code Engineer & Implementation Lead';
  }
  if (s.includes('claude') || s.includes('sonnet') || s.includes('opus')) {
    return 'System Architect & Critical Reviewer';
  }
  if (s.includes('flash') || s.includes('mini') || s.includes('haiku') || s.includes('turbo')) {
    return 'Lead Strategist & Rapid Proposer';
  }
  if (s.includes('gpt-4') || s.includes('gpt-5') || s.includes('command')) {
    return 'Co-Pilot & Execution Planner';
  }
  if (s.includes('llama') || s.includes('mistral') || s.includes('gemma')) {
    return 'Domain Specialist & Verification Agent';
  }
  return 'Collaborative Research Agent';
}

/**
 * Transform OpenRouter API model item into standardized LLMModel
 */
export function formatOpenRouterModel(raw: any): LLMModel {
  const id = raw.id || 'unknown';
  let name = raw.name || id;
  // Clean up provider prefixes in display name if repeated
  if (name.includes(': ')) {
    name = name.split(': ').slice(1).join(': ');
  }

  const provider = extractProvider(id, raw.name);
  const theme = getProviderVisualTheme(provider);
  const role = getTeamRoleForModel(id, name);

  const promptPrice = parseFloat(raw.pricing?.prompt || '0');
  const compPrice = parseFloat(raw.pricing?.completion || '0');
  const isFree = id.endsWith(':free') || (promptPrice === 0 && compPrice === 0);

  const ctxNum = Number(raw.context_length) || 128000;
  const contextWindow = ctxNum >= 1000000 
    ? `${(ctxNum / 1000000).toFixed(1).replace('.0', '')}M tokens`
    : `${Math.round(ctxNum / 1000)}K tokens`;

  let efficiencyTier: 'S' | 'A' | 'B' | 'C' = 'B';
  if (id.includes('sonnet') || id.includes('r1') || id.includes('gpt-4o') || id.includes('gemini-2') || id.includes('gemini-3')) {
    efficiencyTier = 'S';
  } else if (id.includes('70b') || id.includes('72b') || id.includes('large') || id.includes('flash') || id.includes('mini')) {
    efficiencyTier = 'A';
  }

  return {
    id,
    name,
    brand: name,
    provider,
    description: raw.description ? raw.description.slice(0, 160) + '...' : `${provider} model on OpenRouter.`,
    strengths: isFree ? ['Open Weights', 'Cost Efficient', 'High Availability'] : ['High Reasoning', 'Advanced Context', 'Production Ready'],
    teamRole: role,
    accentColor: theme.accentColor,
    lightBg: theme.lightBg,
    badgeBorder: theme.badgeBorder,
    efficiencyTier,
    contextWindow,
    isFree,
  };
}
