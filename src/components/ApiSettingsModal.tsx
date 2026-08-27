import React, { useState } from 'react';
import { Key, Eye, EyeOff, Check, AlertCircle, RefreshCw, Sparkles, ExternalLink, X, Shield } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  openrouterApiKey: string;
  geminiApiKey: string;
  onSaveKeys: (openrouterKey: string, geminiKey: string) => void;
  onRefreshModels: () => Promise<void>;
  isRefreshingModels: boolean;
  modelCount: number;
  freeModelCount: number;
  lastUpdated?: string;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  openrouterApiKey,
  geminiApiKey,
  onSaveKeys,
  onRefreshModels,
  isRefreshingModels,
  modelCount,
  freeModelCount,
  lastUpdated,
}) => {
  const [orKey, setOrKey] = useState(openrouterApiKey);
  const [gemKey, setGemKey] = useState(geminiApiKey);
  const [showOrKey, setShowOrKey] = useState(false);
  const [showGemKey, setShowGemKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleValidateOpenRouterKey = async () => {
    if (!orKey.trim()) {
      setValidationResult({ valid: false, message: 'Please enter an OpenRouter API key first.' });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/openrouter/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: orKey.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setValidationResult({
          valid: true,
          message: 'Key verified successfully with OpenRouter!',
        });
        // Automatically trigger model refresh with this new key
        onSaveKeys(orKey.trim(), gemKey.trim());
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
    onSaveKeys(orKey.trim(), gemKey.trim());
    onClose();
  };

  const handleClear = () => {
    setOrKey('');
    setGemKey('');
    onSaveKeys('', '');
    setValidationResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        id="api-settings-modal"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">API Keys & Model Catalog</h3>
              <p className="text-[11px] text-slate-400">Connect OpenRouter to access 200+ live LLMs & free models</p>
            </div>
          </div>
          <button
            id="close-api-settings-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* OpenRouter API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="openrouter-api-key-input" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <span>OpenRouter API Key</span>
                {orKey && (
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-800/40">
                    Saved
                  </span>
                )}
              </label>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 hover:underline"
              >
                <span>Get key on OpenRouter</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="relative">
              <input
                id="openrouter-api-key-input"
                type={showOrKey ? 'text' : 'password'}
                value={orKey}
                onChange={(e) => {
                  setOrKey(e.target.value);
                  setValidationResult(null);
                }}
                placeholder="sk-or-v1-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 pr-20 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowOrKey(!showOrKey)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                  title={showOrKey ? 'Hide key' : 'Show key'}
                >
                  {showOrKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  id="test-openrouter-key-btn"
                  type="button"
                  onClick={handleValidateOpenRouterKey}
                  disabled={isValidating || !orKey.trim()}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors"
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

          {/* Gemini API Key (Optional override) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="gemini-api-key-input" className="text-xs font-semibold text-slate-200">
                Gemini API Key <span className="text-slate-500 font-normal">(Optional Override)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 hover:underline"
              >
                <span>Get Gemini key</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="relative">
              <input
                id="gemini-api-key-input"
                type={showGemKey ? 'text' : 'password'}
                value={gemKey}
                onChange={(e) => setGemKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 pr-10 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowGemKey(!showGemKey)}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-200"
                title={showGemKey ? 'Hide key' : 'Show key'}
              >
                {showGemKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
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
              Your keys are saved safely in your browser session and used to authenticate live multi-agent model queries.
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-950/60">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-slate-400 hover:text-red-400 font-medium transition-colors"
          >
            Clear Keys
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
