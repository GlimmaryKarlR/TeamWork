import React from 'react';
import { BarChart3, Key, Sparkles } from 'lucide-react';

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
    <header className="bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 border-b border-slate-900/80 shadow-lg shadow-black/40">
      <div className="max-w-4xl mx-auto px-4 py-2.5 relative flex items-center justify-between">
        {/* Brand identity - Celestial Swarm Logo */}
        <div className="flex items-center gap-3 group cursor-pointer select-none">
          {/* Celestial Emblem */}
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#0b1329] via-[#090e1f] to-[#040814] border border-cyan-500/40 p-0.5 shadow-lg shadow-cyan-950/60 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
            {/* Ambient Nebula Glow Behind Emblem */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-violet-500/20 to-emerald-500/20 blur-sm -z-10 group-hover:blur-md transition-all duration-300" />

            {/* Custom Celestial Astrolabe & Constellation SVG */}
            <svg
              viewBox="0 0 40 40"
              className="w-full h-full overflow-visible"
              aria-label="Celestial Swarm Emblem"
            >
              <defs>
                <radialGradient id="celestialCoreGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#818cf8" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#060a16" stopOpacity="0" />
                </radialGradient>
                <filter id="celestialBlur" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Celestial Astrolabe Ring */}
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="#1e293b"
                strokeWidth="0.8"
                strokeDasharray="2 3"
                opacity="0.8"
              />

              {/* Inclined Orbital Ellipse */}
              <ellipse
                cx="20"
                cy="20"
                rx="15"
                ry="6"
                transform="rotate(-25 20 20)"
                fill="none"
                stroke="url(#celestialCoreGlow)"
                strokeWidth="1.2"
                strokeOpacity="0.7"
              />

              {/* Secondary Counter Orbit */}
              <ellipse
                cx="20"
                cy="20"
                rx="14"
                ry="5"
                transform="rotate(45 20 20)"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.75"
                strokeDasharray="3 2"
                strokeOpacity="0.5"
              />

              {/* Constellation Filaments */}
              <path
                d="M 10 14 L 20 20 L 30 16 L 24 30 Z"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.75"
                strokeOpacity="0.6"
              />

              {/* Orbiting Agent Nodes (Stars) */}
              <circle cx="10" cy="14" r="1.8" fill="#38bdf8" filter="url(#celestialBlur)" />
              <circle cx="10" cy="14" r="1" fill="#ffffff" />

              <circle cx="30" cy="16" r="1.8" fill="#a855f7" filter="url(#celestialBlur)" />
              <circle cx="30" cy="16" r="1" fill="#ffffff" />

              <circle cx="24" cy="30" r="1.8" fill="#34d399" filter="url(#celestialBlur)" />
              <circle cx="24" cy="30" r="1" fill="#ffffff" />

              {/* Central Singularity Star with 4-Point Diffraction Flare */}
              <path
                d="M 20 9 Q 20 20 20 20 Q 20 20 20 31 Q 20 20 20 20 Q 20 20 9 20 Q 20 20 20 20 Q 20 20 31 20 Q 20 20 20 20 Z"
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.6"
                opacity="0.8"
              />
              <path
                d="M 20 12 L 20 28 M 12 20 L 28 20"
                stroke="#38bdf8"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.9"
              />
              <path
                d="M 15 15 L 25 25 M 15 25 L 25 15"
                stroke="#a855f7"
                strokeWidth="0.8"
                strokeLinecap="round"
                opacity="0.7"
              />

              {/* Center Radiant Core Bead */}
              <circle cx="20" cy="20" r="3.2" fill="url(#celestialCoreGlow)" />
              <circle cx="20" cy="20" r="1.6" fill="#ffffff" />
            </svg>
          </div>

          {/* Typography */}
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-emerald-300 bg-clip-text text-transparent leading-none">
                TeamWork<span className="text-emerald-400">Ai</span>
              </h1>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse hidden sm:inline-block" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-slate-400 font-mono">
                Multi-LLM Orchestration
              </span>
            </div>
          </div>
        </div>

        {/* Right Action buttons: API Keys and Matrix */}
        <div className="flex items-center gap-2">
          {/* API Keys Configuration Button */}
          <button
            id="btn-open-api-settings"
            onClick={onOpenApiSettings}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
              hasOpenRouterKey
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60 shadow-sm shadow-emerald-950/50'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="text-[11px]">API Keys</span>
            {hasOpenRouterKey ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ) : null}
          </button>

          {/* Matrix Drawer Toggle */}
          <button
            id="btn-toggle-benchmark-matrix"
            onClick={onOpenHeatmap}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isHeatmapOpen
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/50'
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

