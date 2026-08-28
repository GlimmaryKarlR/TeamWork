import React, { useState, useMemo } from 'react';
import { AgentTeam } from '../types';
import {
  RADAR_CATEGORIES,
  RadarCategory,
  CATEGORY_COLORS,
  TEAM_PALETTE,
  getMergedSwarmProfile,
  SwarmSkillNode,
} from '../data/radarData';
import {
  Sparkles,
  Layers,
  Zap,
  Atom,
  Brain,
  Code,
  BookOpen,
  Compass,
  Eye,
  CheckCircle,
  Cpu,
  Target,
  FileText,
  Scale,
  Crown,
  Flame,
  Activity,
  ShieldAlert,
  Network,
  Sliders,
  Check,
} from 'lucide-react';

interface MergedSkillTreeCardProps {
  teams: AgentTeam[];
  onSelectTeam?: (alphaId: string, betaId: string) => void;
}

export const MergedSkillTreeCard: React.FC<MergedSkillTreeCardProps> = ({
  teams,
}) => {
  const [selectedPerkId, setSelectedPerkId] = useState<string>('hyb-cyber-physicist');
  const [activeTeamFilter, setActiveTeamFilter] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    teams.forEach((t) => {
      init[t.id] = true;
    });
    return init;
  });
  const [hoveredPerk, setHoveredPerk] = useState<SwarmSkillNode | null>(null);
  const [hoveredDomain, setHoveredDomain] = useState<RadarCategory | null>(null);

  // Filtered teams for overlay
  const effectiveTeams = useMemo(() => {
    const filtered = teams.filter((t) => activeTeamFilter[t.id] !== false);
    return filtered.length > 0 ? filtered : teams;
  }, [teams, activeTeamFilter]);

  // Compute merged swarm profile and skill nodes
  const mergedData = useMemo(() => {
    return getMergedSwarmProfile(effectiveTeams);
  }, [effectiveTeams]);

  // Default selected perk fallback
  const activePerk = useMemo(() => {
    return (
      hoveredPerk ||
      mergedData.perks.find((p) => p.id === selectedPerkId) ||
      mergedData.perks[0]
    );
  }, [hoveredPerk, selectedPerkId, mergedData.perks]);

  const toggleTeam = (id: string) => {
    setActiveTeamFilter((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Atom':
        return Atom;
      case 'Sparkles':
        return Sparkles;
      case 'Layers':
        return Layers;
      case 'Brain':
        return Brain;
      case 'Target':
        return Target;
      case 'Zap':
        return Zap;
      case 'Code':
        return Code;
      case 'Cpu':
        return Cpu;
      case 'CheckCircle':
        return CheckCircle;
      case 'BookOpen':
        return BookOpen;
      case 'Scale':
        return Scale;
      case 'FileText':
        return FileText;
      case 'Compass':
        return Compass;
      case 'Eye':
        return Eye;
      case 'Crown':
        return Crown;
      case 'Activity':
        return Activity;
      case 'ShieldAlert':
        return ShieldAlert;
      case 'Network':
        return Network;
      case 'Flame':
      default:
        return Flame;
    }
  };

  // --- Multi-Team Overlay Radar Math ---
  const radarSize = 280;
  const radarCenter = radarSize / 2;
  const radarRadius = (radarSize - 70) / 2;
  const totalAxes = RADAR_CATEGORIES.length;
  const angleStep = (2 * Math.PI) / totalAxes;

  const getRadarCoords = (axisIdx: number, normVal: number) => {
    const angle = axisIdx * angleStep - Math.PI / 2;
    const x = radarCenter + radarRadius * normVal * Math.cos(angle);
    const y = radarCenter + radarRadius * normVal * Math.sin(angle);
    return { x, y };
  };

  return (
    <div
      id="swarm-skill-tree-card"
      className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-gradient-to-b from-[#0b0f19] via-[#070b14] to-[#04060b] shadow-2xl p-5 md:p-6 mb-6"
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-amber-600/10 blur-3xl" />
      </div>

      {/* Header Banner: Title */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div>
          <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Swarm Skill Tree
          </h3>
          <span className="text-xs font-mono text-slate-400 mt-1 inline-block">
            {effectiveTeams.length} Team{effectiveTeams.length > 1 ? 's' : ''} Selected ({effectiveTeams.length * 2} Models)
          </span>
        </div>
      </div>

      {/* Team Selection Filters & Overlay Legend */}
      <div className="relative z-10 mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 px-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Sliders className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-200">Overlay Radar Layers:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {teams.map((t, idx) => {
            const isEnabled = activeTeamFilter[t.id] !== false;
            const color = TEAM_PALETTE[idx % TEAM_PALETTE.length];

            return (
              <button
                key={t.id}
                id={`toggle-team-${t.id}`}
                onClick={() => toggleTeam(t.id)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 ${
                  isEnabled
                    ? 'bg-slate-800/90 text-white shadow-sm'
                    : 'bg-slate-900/40 text-slate-500 border-slate-800 opacity-60 hover:opacity-100'
                }`}
                style={{
                  borderColor: isEnabled ? color.stroke : undefined,
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-900"
                  style={{ backgroundColor: color.stroke }}
                />
                <span className="font-bold">{t.name}</span>
                <span className="text-[10px] text-slate-400">
                  ({t.alphaModel.name.split(' ')[0]} + {t.betaModel.name.split(' ')[0]})
                </span>
                {isEnabled ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <span className="text-[9px] text-slate-500">Muted</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Bento Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
        {/* Left Column: Overlaid Multi-Team Radar Chart (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Multi-Team Radar Graph Overlay</span>
            </div>
          </div>

          {/* SVG Multi-Team Radar */}
          <div className="my-2 relative flex items-center justify-center">
            <svg
              width={radarSize}
              height={radarSize}
              viewBox={`0 0 ${radarSize} ${radarSize}`}
              className="overflow-visible select-none"
            >
              <defs>
                <filter id="radarVertexGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Concentric Pentagons */}
              {[0.25, 0.5, 0.75, 1.0].map((ringFactor, rIdx) => {
                const ringPoints = RADAR_CATEGORIES.map((_, idx) => {
                  const { x, y } = getRadarCoords(idx, ringFactor);
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <polygon
                    key={`overlay-ring-${rIdx}`}
                    points={ringPoints}
                    fill={rIdx === 3 ? '#060a16' : 'none'}
                    stroke={rIdx === 3 ? '#334155' : '#1e293b'}
                    strokeWidth={rIdx === 3 ? '1.5' : '0.8'}
                    strokeDasharray={rIdx < 3 ? '2 3' : undefined}
                    opacity={rIdx === 3 ? 0.9 : 0.6}
                  />
                );
              })}

              {/* Domain Spoke Lines */}
              {RADAR_CATEGORIES.map((cat, idx) => {
                const { x, y } = getRadarCoords(idx, 1.0);
                const colorMeta = CATEGORY_COLORS[cat];
                const isHovered = hoveredDomain === cat;

                return (
                  <line
                    key={`overlay-spoke-${idx}`}
                    x1={radarCenter}
                    y1={radarCenter}
                    x2={x}
                    y2={y}
                    stroke={isHovered ? colorMeta.color : '#334155'}
                    strokeWidth={isHovered ? '2' : '1'}
                    strokeOpacity={isHovered ? 0.9 : 0.4}
                  />
                );
              })}

              {/* Individual Team Polygons Overlaid */}
              {mergedData.teams.map((t) => {
                const isFilteredOut = activeTeamFilter[t.teamId] === false;
                if (isFilteredOut) return null;

                const teamPoints = t.profile.categories
                  .map((cat, idx) => {
                    const norm = Math.max(0.15, Math.min(1.0, cat.value / 100));
                    const { x, y } = getRadarCoords(idx, norm);
                    return `${x},${y}`;
                  })
                  .join(' ');

                return (
                  <polygon
                    key={`overlay-team-${t.teamId}`}
                    points={teamPoints}
                    fill={t.color.fill}
                    stroke={t.color.stroke}
                    strokeWidth="2"
                    strokeOpacity="0.85"
                    className="transition-all duration-300 hover:fill-opacity-50 cursor-pointer"
                  >
                    <title>{`${t.teamName} (${t.alphaName} + ${t.betaName})`}</title>
                  </polygon>
                );
              })}

              {/* Domain Vertices and Category Labels with Optical Starlight Flares */}
              {RADAR_CATEGORIES.map((catName, idx) => {
                const labelDist = 1.25;
                const { x: lx, y: ly } = getRadarCoords(idx, labelDist);
                const colorMeta = CATEGORY_COLORS[catName];
                const env = mergedData.mergedEnvelope.find((e) => e.category === catName);
                const isHovered = hoveredDomain === catName;

                // Vertex dot at peak
                const norm = Math.max(0.15, Math.min(1.0, (env?.maxValue || 50) / 100));
                const { x: vx, y: vy } = getRadarCoords(idx, norm);

                return (
                  <g
                    key={`overlay-cat-${idx}`}
                    onMouseEnter={() => setHoveredDomain(catName)}
                    onMouseLeave={() => setHoveredDomain(null)}
                    className="cursor-pointer"
                  >
                    {/* Glowing Vertex at peak envelope */}
                    <circle
                      cx={vx}
                      cy={vy}
                      r={isHovered ? '9' : '7'}
                      fill={colorMeta.color}
                      opacity={isHovered ? 0.4 : 0.25}
                      filter="url(#radarVertexGlow)"
                    />

                    {/* Starlight Point */}
                    <circle
                      cx={vx}
                      cy={vy}
                      r={isHovered ? '5' : '3.8'}
                      fill="#ffffff"
                      stroke={colorMeta.color}
                      strokeWidth="2"
                      className="transition-all duration-200"
                    />

                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      fill={isHovered ? '#ffffff' : colorMeta.color}
                      className="text-[10.5px] font-bold tracking-tight transition-colors duration-150"
                    >
                      {colorMeta.shortLabel}
                    </text>
                    <text
                      x={lx}
                      y={ly + 10}
                      textAnchor="middle"
                      fill="#facc15"
                      className="text-[9px] font-mono font-bold"
                    >
                      {env?.maxValue || 0} pts
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Domain Peak Bars */}
          <div className="w-full grid grid-cols-5 gap-1.5 pt-3 border-t border-slate-800 text-center">
            {mergedData.mergedEnvelope.map((env) => {
              const meta = CATEGORY_COLORS[env.category];
              return (
                <div
                  key={env.category}
                  className={`p-1 rounded bg-slate-950/60 border border-slate-800/80 transition-colors ${
                    hoveredDomain === env.category ? 'border-cyan-400/50 bg-slate-800/80' : ''
                  }`}
                  onMouseEnter={() => setHoveredDomain(env.category)}
                  onMouseLeave={() => setHoveredDomain(null)}
                >
                  <div className="text-[9px] font-semibold truncate" style={{ color: meta.color }}>
                    {meta.shortLabel}
                  </div>
                  <div className="text-xs font-mono font-bold text-white">
                    {env.maxValue}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Swarm Skill Tree Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>The Swarm Skill Tree</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
              Skill Graph
            </span>
          </div>

          {/* Skill Graph SVG Canvas */}
          <div className="relative w-full h-[360px] my-2 bg-[#03060f] rounded-xl border border-slate-800/90 overflow-hidden flex items-center justify-center shadow-2xl">
            {/* Deep Cosmic Nebulae & Multi-layer Aetherial Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Deep space radial vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.6)_0%,_rgba(3,6,15,0.95)_75%,_#02040a_100%)]" />
              
              {/* STEM / Science Cyan Cosmic Cloud (Top) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-48 rounded-full bg-cyan-500/15 blur-3xl mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
              
              {/* Logic & Strategy Violet Nebula (Top Right) */}
              <div className="absolute top-6 right-4 w-56 h-48 rounded-full bg-purple-600/15 blur-3xl mix-blend-screen" />
              
              {/* Software & Systems Amber Star Dust (Bottom Right) */}
              <div className="absolute bottom-4 right-8 w-60 h-52 rounded-full bg-amber-500/15 blur-3xl mix-blend-screen" />
              
              {/* Language & Law Rose Stellar Cloud (Bottom Left) */}
              <div className="absolute bottom-4 left-6 w-56 h-48 rounded-full bg-rose-600/15 blur-3xl mix-blend-screen" />
              
              {/* General Reasoning Emerald Auroral Light (Top Left) */}
              <div className="absolute top-8 left-4 w-56 h-48 rounded-full bg-emerald-500/15 blur-3xl mix-blend-screen" />

              {/* Central Golden Singularity Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl mix-blend-screen" />

              {/* Ambient Scattered Background Stars */}
              {[
                { t: '12%', l: '18%', s: 1.2, o: 0.6, c: '#e0f2fe' },
                { t: '22%', l: '84%', s: 1.5, o: 0.8, c: '#ede9fe' },
                { t: '82%', l: '16%', s: 1.0, o: 0.5, c: '#ffe4e6' },
                { t: '76%', l: '88%', s: 1.4, o: 0.7, c: '#fef3c7' },
                { t: '48%', l: '8%', s: 1.1, o: 0.4, c: '#d1fae5' },
                { t: '42%', l: '92%', s: 1.3, o: 0.6, c: '#e0f2fe' },
                { t: '15%', l: '62%', s: 1.0, o: 0.5, c: '#ffffff' },
                { t: '88%', l: '52%', s: 1.2, o: 0.6, c: '#fef08a' },
                { t: '30%', l: '35%', s: 0.8, o: 0.3, c: '#c7d2fe' },
                { t: '65%', l: '70%', s: 0.9, o: 0.4, c: '#fde68a' },
                { t: '70%', l: '32%', s: 0.8, o: 0.3, c: '#a7f3d0' },
                { t: '10%', l: '40%', s: 1.1, o: 0.5, c: '#bae6fd' },
              ].map((star, i) => (
                <div
                  key={`bg-star-${i}`}
                  className="absolute rounded-full"
                  style={{
                    top: star.t,
                    left: star.l,
                    width: `${star.s * 2}px`,
                    height: `${star.s * 2}px`,
                    backgroundColor: star.c,
                    opacity: star.o,
                    boxShadow: `0 0 ${star.s * 4}px ${star.c}`,
                  }}
                />
              ))}
            </div>

            <svg
              viewBox="0 0 100 100"
              className="w-full h-full p-2 overflow-visible select-none z-10"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Intense Core Bloom */}
                <filter id="intenseStarGlow" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur1" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur1" />
                    <feMergeNode in="blur2" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Soft Ambient Filament Glow */}
                <filter id="filamentGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="0.9" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Central Singularity Gradient */}
                <radialGradient id="nexusRadial" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                  <stop offset="25%" stopColor="#fef08a" stopOpacity="0.95" />
                  <stop offset="60%" stopColor="#eab308" stopOpacity="0.8" />
                  <stop offset="85%" stopColor="#d97706" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
                </radialGradient>

                {/* Cyan Nebula Gradient */}
                <radialGradient id="cyanNebula" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#0284c7" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
                </radialGradient>

                {/* Purple Nebula Gradient */}
                <radialGradient id="purpleNebula" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#9333ea" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#6b21a8" stopOpacity="0" />
                </radialGradient>

                {/* Amber Nebula Gradient */}
                <radialGradient id="amberNebula" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#d97706" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
                </radialGradient>

                {/* Rose Nebula Gradient */}
                <radialGradient id="roseNebula" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fb7185" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#e11d48" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#9f1239" stopOpacity="0" />
                </radialGradient>

                {/* Emerald Nebula Gradient */}
                <radialGradient id="emeraldNebula" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                  <stop offset="50%" stopColor="#059669" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#065f46" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* --- Ethereal Background Nebulae Clouds & Celestial Coordinate Glyphs --- */}
              <g className="pointer-events-none">
                {/* 5 Domain Nebula Glow Spheres */}
                <circle cx="50" cy="18" r="16" fill="url(#cyanNebula)" />
                <circle cx="80" cy="38" r="16" fill="url(#purpleNebula)" />
                <circle cx="78" cy="74" r="16" fill="url(#amberNebula)" />
                <circle cx="20" cy="74" r="16" fill="url(#roseNebula)" />
                <circle cx="22" cy="38" r="16" fill="url(#emeraldNebula)" />

                {/* Precision Celestial Coordinate Astrolabe Rings */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="#334155" strokeWidth="0.3" strokeDasharray="1.5 2" opacity="0.4" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="#475569" strokeWidth="0.25" strokeDasharray="0.8 1.5" opacity="0.35" />
                <circle cx="50" cy="50" r="18" fill="none" stroke="#64748b" strokeWidth="0.2" opacity="0.3" />

                {/* Faint Radial Astrolabe Longitude Ticks */}
                {[0, 72, 144, 216, 288].map((deg, i) => {
                  const rad = (deg - 90) * (Math.PI / 180);
                  const x1 = 50 + 18 * Math.cos(rad);
                  const y1 = 50 + 18 * Math.sin(rad);
                  const x2 = 50 + 44 * Math.cos(rad);
                  const y2 = 50 + 44 * Math.sin(rad);
                  return (
                    <line
                      key={`astrolabe-ray-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#475569"
                      strokeWidth="0.25"
                      strokeDasharray="1 3"
                      opacity="0.3"
                    />
                  );
                })}

                {/* Scientific Discipline Geometric Watermarks (Faint Ethereal Schematics) */}
                {/* STEM Atomic Orbitals (Top) */}
                <ellipse cx="50" cy="20" rx="9" ry="3.5" fill="none" stroke="#06b6d4" strokeWidth="0.25" strokeDasharray="0.5 1.5" opacity="0.25" transform="rotate(-20 50 20)" />
                <ellipse cx="50" cy="20" rx="9" ry="3.5" fill="none" stroke="#06b6d4" strokeWidth="0.25" strokeDasharray="0.5 1.5" opacity="0.25" transform="rotate(40 50 20)" />
                
                {/* Logic Decision Matrix Ring (Top Right) */}
                <polygon points="76,32 84,32 88,38 84,44 76,44 72,38" fill="none" stroke="#a855f7" strokeWidth="0.25" strokeDasharray="0.8 1.2" opacity="0.25" />

                {/* Systems Engineering Conduit Mesh (Bottom Right) */}
                <rect x="73" y="65" width="12" height="12" rx="2" fill="none" stroke="#f59e0b" strokeWidth="0.25" strokeDasharray="1 1.5" opacity="0.2" transform="rotate(15 79 71)" />

                {/* Humanities & Law Harmonic Balance Arcs (Bottom Left) */}
                <path d="M 12 70 Q 20 62 28 70 T 44 70" fill="none" stroke="#f43f5e" strokeWidth="0.25" strokeDasharray="0.8 1.5" opacity="0.2" />

                {/* Reasoning Compass Astrolabe (Top Left) */}
                <circle cx="23" cy="38" r="8" fill="none" stroke="#10b981" strokeWidth="0.25" strokeDasharray="1 2" opacity="0.25" />
                <line x1="15" y1="38" x2="31" y2="38" stroke="#10b981" strokeWidth="0.2" opacity="0.2" />
                <line x1="23" y1="30" x2="23" y2="46" stroke="#10b981" strokeWidth="0.2" opacity="0.2" />
              </g>

              {/* --- Luminous Constellation Filaments / Energy Beams --- */}
              {mergedData.perks.map((perk) => {
                return perk.parentIds.map((pId) => {
                  let parentX = 50;
                  let parentY = 50;

                  if (pId !== 'core-nexus') {
                    const parentPerk = mergedData.perks.find((p) => p.id === pId);
                    if (parentPerk) {
                      parentX = parentPerk.x;
                      parentY = parentPerk.y;
                    }
                  }

                  const isUnlockedPath = perk.isUnlocked;
                  const isHoveredBranch = hoveredDomain === perk.category || (hoveredPerk && hoveredPerk.id === perk.id);

                  return (
                    <g key={`filament-grp-${pId}-${perk.id}`}>
                      {/* Layer 1: Ambient Plasma Glow */}
                      {isUnlockedPath && (
                        <line
                          x1={parentX}
                          y1={parentY}
                          x2={perk.x}
                          y2={perk.y}
                          stroke={perk.color}
                          strokeWidth={isHoveredBranch ? '2.4' : '1.4'}
                          strokeOpacity={isHoveredBranch ? 0.7 : 0.4}
                          filter="url(#filamentGlow)"
                          className="transition-all duration-300"
                        />
                      )}

                      {/* Layer 2: High-Intensity Laser Core */}
                      <line
                        x1={parentX}
                        y1={parentY}
                        x2={perk.x}
                        y2={perk.y}
                        stroke={isUnlockedPath ? (isHoveredBranch ? '#ffffff' : perk.color) : '#334155'}
                        strokeWidth={isUnlockedPath ? (perk.category === 'Hybrid' ? '0.9' : '0.65') : '0.35'}
                        strokeDasharray={isUnlockedPath ? (perk.category === 'Hybrid' ? '2 0.8' : undefined) : '0.8 1.5'}
                        strokeOpacity={isUnlockedPath ? 0.95 : 0.35}
                        className="transition-all duration-300"
                      />
                    </g>
                  );
                });
              })}

              {/* --- Central Swarm Singularity / Integration Star (50, 50) --- */}
              <g
                className="cursor-pointer"
                onClick={() => setSelectedPerkId('hyb-legendary-sovereign')}
                onMouseEnter={() => setHoveredPerk(mergedData.perks.find(p => p.id === 'hyb-legendary-sovereign') || null)}
                onMouseLeave={() => setHoveredPerk(null)}
              >
                {/* Radiating Celestial Corona */}
                <circle cx="50" cy="50" r="10" fill="url(#nexusRadial)" filter="url(#intenseStarGlow)" opacity="0.75" />
                
                {/* Concentric Singularity Resonator Rings */}
                <circle cx="50" cy="50" r="5.5" fill="none" stroke="#fef08a" strokeWidth="0.4" strokeDasharray="1.2 1" opacity="0.8" className="animate-spin" style={{ animationDuration: '14s', transformOrigin: '50px 50px' }} />
                <circle cx="50" cy="50" r="3.6" fill="none" stroke="#ffffff" strokeWidth="0.3" opacity="0.9" />

                {/* 8-Point Starlight Optical Diffraction Starburst */}
                <path
                  d="M 50 42 Q 50 50 58 50 Q 50 50 50 58 Q 50 50 42 50 Q 50 50 50 42 Z"
                  fill="#ffffff"
                  filter="url(#intenseStarGlow)"
                  opacity="0.9"
                />
                <path
                  d="M 44.5 44.5 Q 50 50 55.5 55.5 Q 50 50 44.5 55.5 Q 50 50 55.5 44.5 Z"
                  fill="#fef08a"
                  opacity="0.7"
                />

                {/* Core White Dwarf Pinpoint */}
                <circle cx="50" cy="50" r="1.6" fill="#ffffff" stroke="#facc15" strokeWidth="0.5" />
              </g>

              {/* --- Skill Nodes with Authentic Skyrim Optical Diffraction Flares --- */}
              {mergedData.perks.map((perk) => {
                if (perk.id === 'hyb-legendary-sovereign') return null;

                const isSelected = selectedPerkId === perk.id || hoveredPerk?.id === perk.id;
                const isHybrid = perk.category === 'Hybrid';
                const flareSize = isHybrid ? 4.5 : (perk.tier === 3 ? 4.0 : 3.2);

                return (
                  <g
                    key={perk.id}
                    id={`skill-node-${perk.id}`}
                    className="cursor-pointer transition-transform duration-200"
                    onMouseEnter={() => setHoveredPerk(perk)}
                    onMouseLeave={() => setHoveredPerk(null)}
                    onClick={() => setSelectedPerkId(perk.id)}
                  >
                    {/* Selected Active Orbit Ring */}
                    {isSelected && (
                      <g>
                        <circle
                          cx={perk.x}
                          cy={perk.y}
                          r={flareSize + 1.8}
                          fill="none"
                          stroke="#ffffff"
                          strokeWidth="0.45"
                          strokeDasharray="1.2 0.8"
                          className="animate-spin"
                          style={{ animationDuration: '6s', transformOrigin: `${perk.x}px ${perk.y}px` }}
                        />
                        <circle
                          cx={perk.x}
                          cy={perk.y}
                          r={flareSize + 3}
                          fill="none"
                          stroke={perk.color}
                          strokeWidth="0.25"
                          opacity="0.6"
                        />
                      </g>
                    )}

                    {/* Unlocked Radiant Starburst Glow & Corona */}
                    {perk.isUnlocked && (
                      <g>
                        {/* Outer Soft Color Halo */}
                        <circle
                          cx={perk.x}
                          cy={perk.y}
                          r={flareSize * 1.6}
                          fill={perk.color}
                          opacity="0.3"
                          filter="url(#intenseStarGlow)"
                        />

                        {/* 4-Point Skyrim Optical Diamond Flare */}
                        <path
                          d={`M ${perk.x} ${perk.y - flareSize} Q ${perk.x} ${perk.y} ${perk.x + flareSize * 0.35} ${perk.y} Q ${perk.x} ${perk.y} ${perk.x} ${perk.y + flareSize} Q ${perk.x} ${perk.y} ${perk.x - flareSize * 0.35} ${perk.y} Z`}
                          fill="#ffffff"
                          filter="url(#intenseStarGlow)"
                          opacity={isSelected ? 0.95 : 0.8}
                        />
                        <path
                          d={`M ${perk.x - flareSize} ${perk.y} Q ${perk.x} ${perk.y} ${perk.x} ${perk.y - flareSize * 0.35} Q ${perk.x} ${perk.y} ${perk.x + flareSize} ${perk.y} Q ${perk.x} ${perk.y} ${perk.x} ${perk.y + flareSize * 0.35} Z`}
                          fill="#ffffff"
                          filter="url(#intenseStarGlow)"
                          opacity={isSelected ? 0.95 : 0.8}
                        />
                      </g>
                    )}

                    {/* Node Core Physical Bead */}
                    <circle
                      cx={perk.x}
                      cy={perk.y}
                      r={perk.isUnlocked ? (isHybrid ? '1.9' : '1.5') : '1.1'}
                      fill={perk.isUnlocked ? '#ffffff' : '#1e293b'}
                      stroke={perk.isUnlocked ? perk.color : '#475569'}
                      strokeWidth={perk.isUnlocked ? '0.6' : '0.3'}
                    />

                    {/* Node Text Label with Starlight Backing */}
                    <text
                      x={perk.x}
                      y={perk.y + (perk.y > 60 ? -3.2 : 4.2)}
                      textAnchor="middle"
                      fill={perk.isUnlocked ? (isSelected ? '#ffffff' : perk.color) : '#64748b'}
                      fontSize="2.15"
                      fontWeight={perk.isUnlocked ? '700' : '500'}
                      className="font-sans select-none tracking-tight"
                      style={{
                        textShadow: perk.isUnlocked ? `0 0 4px ${perk.color}` : 'none',
                      }}
                    >
                      {perk.shortName}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Branch Legend */}
          <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-400 pt-2 border-t border-slate-800">
            <span className="font-semibold text-slate-300">Branches:</span>
            {RADAR_CATEGORIES.map((cat) => {
              const meta = CATEGORY_COLORS[cat];
              return (
                <span key={cat} className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span style={{ color: meta.color }}>{meta.shortLabel}</span>
                </span>
              );
            })}
            <span className="flex items-center gap-1 text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Cross-Discipline Hybrid</span>
            </span>
          </div>
        </div>
      </div>

      {/* Skill Node Detail Inspector */}
      {activePerk && (
        <div
          id="swarm-skill-inspector"
          className="relative z-10 mt-5 bg-gradient-to-r from-[#0c1220] via-[#090d18] to-[#0c1220] border border-slate-700/80 rounded-xl p-4 shadow-xl backdrop-blur-md"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center border shadow-lg"
                style={{
                  backgroundColor: `${activePerk.color}15`,
                  borderColor: `${activePerk.color}50`,
                }}
              >
                {React.createElement(getIconComponent(activePerk.iconName), {
                  className: 'w-5 h-5',
                  style: { color: activePerk.color },
                })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs uppercase font-mono tracking-wider font-bold"
                    style={{ color: activePerk.color }}
                  >
                    {activePerk.discipline}
                  </span>
                  {activePerk.isUnlocked ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Active Skill
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      Inactive
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-bold text-white tracking-tight mt-0.5">
                  {activePerk.name}
                </h4>
              </div>
            </div>
          </div>

          {/* Performance Effect & Discipline Context */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-3 pt-1 text-xs">
            <div className="md:col-span-6 bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Capability Impact & Performance</span>
              </div>
              <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
                {activePerk.buff}
              </p>
            </div>

            <div className="md:col-span-6 bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-400 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Discipline Context</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activePerk.lore}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
