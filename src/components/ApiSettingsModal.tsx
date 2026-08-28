import React, { useState } from 'react';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  ExternalLink, 
  X, 
  Shield, 
  ChevronDown, 
  ChevronUp, 
  Cpu,
  Layers
} from 'lucide-react';
import { ProviderApiKeys } from '../types';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ProviderApiKeys;
  onSaveKeys: (keys: ProviderApiKeys) => void;
  onRefreshModels: () => Promise<void>;
  isRefreshingModels: boolean;
  modelCount: number;
  freeModelCount: number;
  lastUpdated?: string;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onSaveKeys,
  onRefreshModels,
  isRefreshingModels,
  modelCount,
  freeModelCount,
  lastUpdated,
}) => {
  const [keys, setKeys] = useState<ProviderApiKeys>(apiKeys);
  const [showKeyMap, setShowKeyMap] = useState<Record<string, boolean>>({});
  const [isDirectKeysExpanded, setIsDirectKeysExpanded] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setKeys(apiKeys);
      setValidationResult(null);
    }
  }, [isOpen, apiKeys]);

  if (!isOpen) return null;

  const toggleShowKey = (field: string) => {
    setShowKeyMap((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const updateKey = (field: keyof ProviderApiKeys, value: string) => {
    setKeys((prev) => ({ ...prev, [field]: value }));
    if (field === 'openrouterApiKey') {
      setValidationResult(null);
    }
  };

  const handleValidateOpenRouterKey = async () => {
    const orKey = keys.openrouterApiKey?.trim() || '';
    if (!orKey) {
      setValidationResult({ valid: false, message: 'Please enter an OpenRouter API key first.' });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/openrouter/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: orKey }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setValidationResult({
          valid: true,
          message: 'Key verified successfully with OpenRouter!',
        });
        onSaveKeys({ ...keys, openrouterApiKey: orKey });
        await onRefreshModels();
      } else {
        setValidationResult({
          valid: false,
          message: data.error || 'Invalid OpenRouter API Key.',
        });
      }
    } catch (err: any) {
      setValidationResult({
        valid: false,
        message: err.message || 'Validation request failed.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    onSaveKeys(keys);
    onClose();
  };

  const handleClearAll = () => {
    const emptyKeys: ProviderApiKeys = {
      openrouterApiKey: '',
      geminiApiKey: '',
      openaiApiKey: '',
      anthropicApiKey: '',
      deepseekApiKey: '',
      groqApiKey: '',
      mistralApiKey: '',
      xaiApiKey: '',
      togetherApiKey: '',
      perplexityApiKey: '',
    };
    setKeys(emptyKeys);
    onSaveKeys(emptyKeys);
    setValidationResult(null);
  };

  // Count active direct keys
  const activeDirectKeyCount = [
    keys.geminiApiKey,
    keys.openaiApiKey,
    keys.anthropicApiKey,
    keys.deepseekApiKey,
    keys.groqApiKey,
    keys.mistralApiKey,
    keys.xaiApiKey,
    keys.togetherApiKey,
    keys.perplexityApiKey,
  ].filter((k) => !!k?.trim()).length;

  const directProviders = [
    {
      id: 'geminiApiKey' as keyof ProviderApiKeys,
      name: 'Google Gemini',
      tag: 'Gemini 3.7 Flash, Pro',
      placeholder: 'AIzaSy...',
      link: 'https://aistudio.google.com/app/apikey',
      linkLabel: 'AI Studio',
      color: 'border-blue-500/40 text-blue-400',
    },
    {
      id: 'openaiApiKey' as keyof ProviderApiKeys,
      name: 'OpenAI',
      tag: 'GPT-4o, o3-mini, o1',
      placeholder: 'sk-proj-...',
      link: 'https://platform.openai.com/api-keys',
      linkLabel: 'OpenAI Console',
      color: 'border-emerald-500/40 text-emerald-400',
    },
    {
      id: 'anthropicApiKey' as keyof ProviderApiKeys,
      name: 'Anthropic Claude',
      tag: 'Claude 3.7 Sonnet, Haiku',
      placeholder: 'sk-ant-...',
      link: 'https://console.anthropic.com/settings/keys',
      linkLabel: 'Anthropic Console',
      color: 'border-amber-500/40 text-amber-400',
    },
    {
      id: 'deepseekApiKey' as keyof ProviderApiKeys,
      name: 'DeepSeek',
      tag: 'DeepSeek-R1, DeepSeek-V3',
      placeholder: 'sk-...',
      link: 'https://platform.deepseek.com/api_keys',
      linkLabel: 'DeepSeek Platform',
      color: 'border-cyan-500/40 text-cyan-400',
    },
    {
      id: 'groqApiKey' as keyof ProviderApiKeys,
      name: 'Groq',
      tag: 'Llama 3.3 70B (Fast)',
      placeholder: 'gsk_...',
      link: 'https://console.groq.com/keys',
      linkLabel: 'Groq Console',
      color: 'border-orange-500/40 text-orange-400',
    },
    {
      id: 'mistralApiKey' as keyof ProviderApiKeys,
      name: 'Mistral AI',
      tag: 'Mistral Large, Codestral',
      placeholder: '...',
      link: 'https://console.mistral.ai/api-keys/',
      linkLabel: 'Mistral Console',
      color: 'border-indigo-500/40 text-indigo-400',
    },
    {
      id: 'xaiApiKey' as keyof ProviderApiKeys,
      name: 'xAI (Grok)',
      tag: 'Grok 2, Grok 3',
      placeholder: 'xai-...',
      link: 'https://console.x.ai/',
      linkLabel: 'xAI Console',
      color: 'border-slate-400/40 text-slate-300',
    },
    {
      id: 'togetherApiKey' as keyof ProviderApiKeys,
      name: 'Together AI',
      tag: 'Qwen 2.5, Open Models',
      placeholder: '...',
      link: 'https://api.together.xyz/settings/api-keys',
      linkLabel: 'Together AI',
      color: 'border-blue-400/40 text-blue-300',
    },
    {
      id: 'perplexityApiKey' as keyof ProviderApiKeys,
      name: 'Perplexity',
      tag: 'Sonar Online & Reasoning',
      placeholder: 'pplx-...',
      link: 'https://www.perplexity.ai/settings/api',
      linkLabel: 'Perplexity API',
      color: 'border-teal-500/40 text-teal-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="api-settings-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">API Keys & Model Providers</h3>
              <p className="text-[11px] text-slate-400">Configure provider access for live multi-agent teaming</p>
            </div>
          </div>
          <button
            id="close-api-settings-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Universal OpenRouter API Key Input */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <label htmlFor="openrouter-api-key-input" className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
                  <span>Universal OpenRouter Key</span>
                  <span className="text-[10px] bg-blue-950/80 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800/40">
                    Recommended (200+ Models)
                  </span>
                  {keys.openrouterApiKey && (
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      Saved
                    </span>
                  )}
                </label>
              </div>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 hover:underline shrink-0"
              >
                <span>Get OpenRouter key</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <p className="text-[11px] text-slate-400">
              One single key to access Claude, GPT-4o, DeepSeek, Gemini, Llama, and 200+ other models.
            </p>

            <div className="relative">
              <input
                id="openrouter-api-key-input"
                type={showKeyMap['openrouter'] ? 'text' : 'password'}
                value={keys.openrouterApiKey || ''}
                onChange={(e) => updateKey('openrouterApiKey', e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 pr-20 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleShowKey('openrouter')}
                  className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title={showKeyMap['openrouter'] ? 'Hide key' : 'Show key'}
                >
                  {showKeyMap['openrouter'] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  id="test-openrouter-key-btn"
                  type="button"
                  onClick={handleValidateOpenRouterKey}
                  disabled={isValidating || !keys.openrouterApiKey?.trim()}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isValidating ? 'Testing...' : 'Verify'}
                </button>
              </div>
            </div>

            {/* Validation Notice */}
            {validationResult && (
              <div
                className={`p-2 rounded-md text-[11px] flex items-center gap-1.5 ${
                  validationResult.valid
                    ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300'
                    : 'bg-red-950/60 border border-red-800/60 text-red-300'
                }`}
              >
                {validationResult.valid ? (
                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                )}
                <span>{validationResult.message}</span>
              </div>
            )}
          </div>

          {/* Collapsible Direct Model Provider Keys Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
            <button
              id="btn-toggle-direct-keys"
              type="button"
              onClick={() => setIsDirectKeysExpanded(!isDirectKeysExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-900/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>Direct Model Provider Keys</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Optional direct keys)</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Input individual keys for OpenAI, Anthropic, Gemini, DeepSeek, Groq & more
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {activeDirectKeyCount > 0 && (
                  <span className="text-[10px] bg-emerald-950/90 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/60 font-mono font-medium">
                    {activeDirectKeyCount} saved
                  </span>
                )}
                {isDirectKeysExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            {/* Collapsed Drawer Body */}
            {isDirectKeysExpanded && (
              <div className="p-4 pt-1 space-y-3 border-t border-slate-800/80 bg-slate-950/80 animate-in fade-in duration-200">
                <p className="text-[11px] text-slate-400">
                  Direct provider keys allow you to authenticate with individual LLM providers directly without requiring OpenRouter.
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {directProviders.map((prov) => {
                    const currentVal = (keys[prov.id] as string) || '';
                    const isVisible = !!showKeyMap[prov.id];

                    return (
                      <div
                        key={prov.id}
                        className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/90 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-slate-200">{prov.name}</span>
                            <span className="text-[10px] text-slate-500">({prov.tag})</span>
                            {currentVal && (
                              <span className="text-[9px] bg-emerald-950 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-800/40">
                                Saved
                              </span>
                            )}
                          </div>
                          <a
                            href={prov.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 hover:underline"
                          >
                            <span>{prov.linkLabel}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>

                        <div className="relative">
                          <input
                            id={`key-input-${prov.id}`}
                            type={isVisible ? 'text' : 'password'}
                            value={currentVal}
                            onChange={(e) => updateKey(prov.id, e.target.value)}
                            placeholder={prov.placeholder}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 pr-8 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => toggleShowKey(prov.id)}
                            className="absolute right-2 top-2 text-slate-400 hover:text-slate-200 cursor-pointer"
                            title={isVisible ? 'Hide' : 'Show'}
                          >
                            {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Model Catalog Sync Status Card */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>OpenRouter Model Catalog</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                <span className="text-white font-medium">{modelCount}</span> models available •{' '}
                <span className="text-emerald-400 font-medium">{freeModelCount} free tier</span>
                {lastUpdated && (
                  <span className="text-slate-500 text-[10px] block mt-0.5">
                    Updated {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>

            <button
              id="btn-refresh-models-modal"
              type="button"
              onClick={onRefreshModels}
              disabled={isRefreshingModels}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-medium transition-all shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshingModels ? 'animate-spin' : ''}`} />
              <span>{isRefreshingModels ? 'Refreshing...' : 'Refresh Models'}</span>
            </button>
          </div>

          {/* Privacy Note */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span>
              Your keys are stored securely in your local browser session and directly authenticate multi-agent model queries.
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/80 shrink-0">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-slate-400 hover:text-red-400 font-medium transition-colors cursor-pointer"
          >
            Clear All Keys
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-api-keys"
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-900/30 transition-all cursor-pointer"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
