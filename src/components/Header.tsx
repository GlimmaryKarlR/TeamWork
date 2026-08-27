import React from 'react';
import { Layers, BarChart3, Key } from 'lucide-react';

interface HeaderProps {
  onOpenHeatmap: () => void;
  isHeatmapOpen: boolean;
  onOpenApiSettings: () => void;
  hasOpenRouterKey: boolean;
  modelCount: number;
  freeModelCount: number;
  onRefreshModels: () => void;
  isRefreshingModels: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHeatmap,
  isHeatmapOpen,
  onOpenApiSettings,
  hasOpenRouterKey,
}) => {
  return (
    <header className="bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 relative flex items-center justify-center">
        {/* Brand identity - Centered */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 shadow-md shadow-blue-900/30 flex items-center justify-center text-white shrink-0">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div className="text-left">
            <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent leading-none">
              TeamWork<span className="text-emerald-400">Ai</span>
            </h1>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              Multi-LLM Teaming
            </span>
          </div>
        </div>

        {/* Right Action buttons: API Keys and Matrix */}
        <div className="absolute right-4 flex items-center gap-2">
          {/* API Keys Configuration Button */}
          <button
            id="btn-open-api-settings"
            onClick={onOpenApiSettings}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border ${
              hasOpenRouterKey
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="text-[11px]">API Keys</span>
            {hasOpenRouterKey ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            ) : null}
          </button>

          {/* Matrix Drawer Toggle */}
          <button
            id="btn-toggle-benchmark-matrix"
            onClick={onOpenHeatmap}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              isHeatmapOpen
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-[11px]">{isHeatmapOpen ? 'Close Matrix' : 'Matrix'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
