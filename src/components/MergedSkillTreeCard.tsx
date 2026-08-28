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
                    fill={rIdx === 3 ? '#080d1a' : 'none'}
                    stroke="#1e293b"
                    strokeWidth={rIdx === 3 ? '1.5' : '1'}
                    strokeDasharray={rIdx < 3 ? '2 2' : undefined}
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

              {/* Domain Vertices and Category Labels */}
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
                    <circle
                      cx={vx}
                      cy={vy}
                      r={isHovered ? '6' : '4.5'}
                      fill={colorMeta.color}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all duration-200"
                    />

                    <text
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      fill={isHovered ? '#ffffff' : colorMeta.color}
                      className="text-[10px] font-black tracking-tight transition-colors duration-150"
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
          <div className="relative w-full h-[320px] my-2 bg-[#050811] rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center shadow-inner">
            <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0a0f1d] to-[#03060c]" />

            <svg
              viewBox="0 0 100 100"
              className="w-full h-full p-3 overflow-visible select-none z-10"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <radialGradient id="nexusRadial" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
                  <stop offset="60%" stopColor="#eab308" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#854d0e" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Connecting Lines */}
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

                  return (
                    <line
                      key={`line-${pId}-${perk.id}`}
                      x1={parentX}
                      y1={parentY}
                      x2={perk.x}
                      y2={perk.y}
                      stroke={isUnlockedPath ? perk.color : '#334155'}
                      strokeWidth={isUnlockedPath ? (perk.category === 'Hybrid' ? '0.9' : '0.7') : '0.4'}
                      strokeDasharray={isUnlockedPath ? (perk.category === 'Hybrid' ? '1.5 1' : undefined) : '1 1.5'}
                      strokeOpacity={isUnlockedPath ? 0.85 : 0.4}
                      className="transition-all duration-300"
                    />
                  );
                });
              })}

              {/* Core Center Node (50, 50) */}
              <g className="cursor-pointer" onClick={() => setSelectedPerkId('hyb-legendary-sovereign')}>
                <circle cx="50" cy="50" r="7" fill="url(#nexusRadial)" filter="url(#starGlow)" opacity="0.6" />
                <circle cx="50" cy="50" r="2.8" fill="#facc15" stroke="#ffffff" strokeWidth="0.6" />
                <text
                  x="50"
                  y="53.8"
                  textAnchor="middle"
                  fill="#000000"
                  fontSize="2.2"
                  fontWeight="bold"
                  className="pointer-events-none font-sans"
                >
                  ⚡
                </text>
              </g>

              {/* Skill Nodes */}
              {mergedData.perks.map((perk) => {
                if (perk.id === 'hyb-legendary-sovereign') return null;

                const isSelected = selectedPerkId === perk.id || hoveredPerk?.id === perk.id;
                const isHybrid = perk.category === 'Hybrid';

                return (
                  <g
                    key={perk.id}
                    id={`skill-node-${perk.id}`}
                    className="cursor-pointer transition-transform duration-200"
                    onMouseEnter={() => setHoveredPerk(perk)}
                    onMouseLeave={() => setHoveredPerk(null)}
                    onClick={() => setSelectedPerkId(perk.id)}
                  >
                    {/* Outer selection ring if selected */}
                    {isSelected && (
                      <circle
                        cx={perk.x}
                        cy={perk.y}
                        r="4"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="0.5"
                        strokeDasharray="1 0.8"
                        className="animate-spin"
                        style={{ animationDuration: '6s' }}
                      />
                    )}

                    {/* Unlocked Radiant Glow */}
                    {perk.isUnlocked && (
                      <circle
                        cx={perk.x}
                        cy={perk.y}
                        r={isHybrid ? '3.2' : '2.5'}
                        fill={perk.color}
                        opacity="0.35"
                        filter="url(#starGlow)"
                      />
                    )}

                    {/* Node Core */}
                    <circle
                      cx={perk.x}
                      cy={perk.y}
                      r={perk.isUnlocked ? (isHybrid ? '2.2' : '1.8') : '1.3'}
                      fill={perk.isUnlocked ? perk.color : '#1e293b'}
                      stroke={perk.isUnlocked ? '#ffffff' : '#475569'}
                      strokeWidth={perk.isUnlocked ? '0.5' : '0.3'}
                    />

                    {/* Node Label */}
                    <text
                      x={perk.x}
                      y={perk.y + 3.8}
                      textAnchor="middle"
                      fill={perk.isUnlocked ? (isSelected ? '#ffffff' : perk.color) : '#64748b'}
                      fontSize="2.1"
                      fontWeight={perk.isUnlocked ? 'bold' : 'normal'}
                      className="font-sans"
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
