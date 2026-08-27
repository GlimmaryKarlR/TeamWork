import React from 'react';
import { Layers, BarChart3 } from 'lucide-react';

interface HeaderProps {
  onOpenHeatmap: () => void;
  isHeatmapOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHeatmap,
  isHeatmapOpen,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-emerald-500 shadow-md shadow-blue-900/30 flex items-center justify-center text-white">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            TeamWork<span className="text-emerald-400">Ai</span>
          </h1>
        </div>

        {/* Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-benchmark-matrix"
            onClick={onOpenHeatmap}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              isHeatmapOpen
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{isHeatmapOpen ? 'Close Matrix' : 'Pairings Matrix'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};


