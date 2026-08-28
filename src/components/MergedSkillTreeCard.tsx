import React, { useState, useMemo, useRef } from 'react';
import { AgentTeam, LLMModel } from '../types';
import {
  RADAR_CATEGORIES,
  RadarCategory,
  CATEGORY_COLORS,
  TEAM_PALETTE,
  getMergedSwarmProfile,
  SwarmSkillNode,
  getNodeRecommendedTeam,
} from '../data/radarData';
import { SUPPORTED_MODELS } from '../data/benchmarkData';
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
  Plus,
  Users,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
} from 'lucide-react';

interface MergedSkillTreeCardProps {
  teams: AgentTeam[];
  models?: LLMModel[];
  tierFilter?: 'all' | 'free';
  onApplyTeam1?: (alphaModel: LLMModel, betaModel: LLMModel) => void;
  onAddTeamWithModels?: (alphaModel: LLMModel, betaModel: LLMModel, teamName?: string) => void;
  onSelectTeam?: (alphaId: string, betaId: string) => void;
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const MergedSkillTreeCard: React.FC<MergedSkillTreeCardProps> = ({
  teams,
  models = SUPPORTED_MODELS,
  tierFilter = 'all',
  onApplyTeam1,
  onAddTeamWithModels,
  onSelectTeam,
  isCollapsible = false,
  isCollapsed = false,
  onToggleCollapse,
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
  const [justApplied, setJustApplied] = useState<string | null>(null);

  // Zoom and Pan State for the Skill Tree Canvas
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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

  // Recommendation info for the currently selected perk
  const recInfo = useMemo(() => {
    if (!activePerk) return null;
    const rec = getNodeRecommendedTeam(activePerk.id, tierFilter === 'free');
    const availableList = models && models.length > 0 ? models : SUPPORTED_MODELS;
    const alpha =
      availableList.find((m) => m.id === rec.primaryAlphaId) ||
      SUPPORTED_MODELS.find((m) => m.id === rec.primaryAlphaId) ||
      availableList[0];
    const beta =
      availableList.find((m) => m.id === rec.primaryBetaId) ||
      SUPPORTED_MODELS.find((m) => m.id === rec.primaryBetaId) ||
      availableList[1];

    // Check if this pair is already in one of the teams
    const matchingTeam = teams.find(
      (t) =>
        (t.alphaModel.id === alpha?.id && t.betaModel.id === beta?.id) ||
        (t.alphaModel.id === beta?.id && t.betaModel.id === alpha?.id)
    );

    return {
      rec,
      alpha,
      beta,
      matchingTeam,
    };
  }, [activePerk, tierFilter, models, teams]);

  const handleApplyToTeam1 = () => {
    if (!recInfo || !recInfo.alpha || !recInfo.beta) return;
    if (onApplyTeam1) {
      onApplyTeam1(recInfo.alpha, recInfo.beta);
    } else if (onSelectTeam) {
      onSelectTeam(recInfo.alpha.id, recInfo.beta.id);
    }
    setJustApplied('team-1');
    setTimeout(() => setJustApplied(null), 2500);
  };

  const handleAddNewTeam = () => {
    if (!recInfo || !recInfo.alpha || !recInfo.beta) return;
    if (teams.length >= 5) return;
    if (onAddTeamWithModels) {
      onAddTeamWithModels(recInfo.alpha, recInfo.beta, recInfo.rec.teamLabel);
    }
    setJustApplied('new-team');
    setTimeout(() => setJustApplied(null), 2500);
  };

  const toggleTeam = (id: string) => {
    setActiveTeamFilter((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(2.5, +(prev + 0.25).toFixed(2)));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.75, +(prev - 0.25).toFixed(2)));
  };

  const handleResetZoom = () => {
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Pan Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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

  // --- Large High-Def Multi-Team Overlay Radar Math ---
  const radarSize = 440;
  const radarCenter = radarSize / 2;
  const radarRadius = (radarSize - 90) / 2;
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
      className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-gradient-to-b from-[#0b0f19] via-[#070b14] to-[#04060b] shadow-2xl p-5 md:p-7 mb-6"
    >
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] rounded-full bg-cyan-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[32rem] h-[32rem] rounded-full bg-amber-600/10 blur-3xl" />
      </div>

      {/* Header Banner: Title & Controls */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Swarm Capability Radar & Skill Tree
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/50">
              Full-Scale Vertical Layout
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compare swarm multi-team benchmark envelopes on the upper radar graph, and explore specialized skill nodes with zoomable interactive navigation below.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            {teams.length} Team{teams.length > 1 ? 's' : ''} ({teams.length * 2} Models)
          </span>

          {isCollapsible && onToggleCollapse && (
            <button
              id="btn-toggle-skill-map-collapse"
              onClick={onToggleCollapse}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              {isCollapsed ? (
                <>
                  <span>Expand View</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Collapse View</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="relative z-10 space-y-6 mt-5">
          {/* Team Selection Filters & Overlay Legend (Shown if >1 team) */}
          {teams.length > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 px-4 backdrop-blur-sm">
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
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 cursor-pointer ${
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
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className="text-[9px] text-slate-500">Muted</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 1 (TOP): EXPANDED MULTI-TEAM OVERLAY RADAR GRAPH */}
          {/* ========================================================================= */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col items-center">
            <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 text-xs gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Multi-Team Radar Graph Overlay (Full Dimension)</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
                <span>Peak Swarm Envelope (Outer Vertices)</span>
                <span className="px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/40 font-sans">
                  5 Cognitive Pillars
                </span>
              </div>
            </div>

            {/* SVG Multi-Team Radar (Larger Format) */}
            <div className="my-4 relative flex items-center justify-center w-full max-w-2xl">
              <svg
                width={radarSize}
                height={radarSize}
                viewBox={`0 0 ${radarSize} ${radarSize}`}
                className="overflow-visible select-none max-w-full h-auto"
              >
                <defs>
                  <filter id="radarVertexGlowLarge" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
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
                    <g key={`overlay-ring-${rIdx}`}>
                      <polygon
                        points={ringPoints}
                        fill={rIdx === 3 ? '#050914' : 'none'}
                        stroke={rIdx === 3 ? '#334155' : '#1e293b'}
                        strokeWidth={rIdx === 3 ? '1.8' : '1'}
                        strokeDasharray={rIdx < 3 ? '3 4' : undefined}
                        opacity={rIdx === 3 ? 0.95 : 0.65}
                      />
                      {/* Threshold tag on top ray */}
                      <text
                        x={radarCenter + 6}
                        y={radarCenter - radarRadius * ringFactor + 4}
                        fill="#64748b"
                        fontSize="9.5"
                        fontFamily="monospace"
                        fontWeight="600"
                        opacity="0.8"
                      >
                        {Math.round(ringFactor * 100)}pt
                      </text>
                    </g>
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
                      strokeWidth={isHovered ? '2.5' : '1.2'}
                      strokeOpacity={isHovered ? 0.95 : 0.45}
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
                      strokeWidth="2.5"
                      strokeOpacity="0.88"
                      className="transition-all duration-300 hover:fill-opacity-50 cursor-pointer"
                    >
                      <title>{`${t.teamName} (${t.alphaName} + ${t.betaName})`}</title>
                    </polygon>
                  );
                })}

                {/* Domain Vertices and Category Labels with Optical Starlight Flares */}
                {RADAR_CATEGORIES.map((catName, idx) => {
                  const labelDist = 1.28;
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
                        r={isHovered ? '12' : '8.5'}
                        fill={colorMeta.color}
                        opacity={isHovered ? 0.45 : 0.25}
                        filter="url(#radarVertexGlowLarge)"
                      />

                      {/* Starlight Point */}
                      <circle
                        cx={vx}
                        cy={vy}
                        r={isHovered ? '6' : '4.5'}
                        fill="#ffffff"
                        stroke={colorMeta.color}
                        strokeWidth="2.5"
                        className="transition-all duration-200"
                      />

                      <text
                        x={lx}
                        y={ly - 2}
                        textAnchor="middle"
                        fill={isHovered ? '#ffffff' : colorMeta.color}
                        className="text-xs font-bold tracking-tight transition-colors duration-150"
                      >
                        {colorMeta.shortLabel}
                      </text>
                      <text
                        x={lx}
                        y={ly + 12}
                        textAnchor="middle"
                        fill="#facc15"
                        className="text-[10px] font-mono font-bold"
                      >
                        {env?.maxValue || 0} pts
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Domain Peak Quick Summary Cards */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4 border-t border-slate-800 text-center">
              {mergedData.mergedEnvelope.map((env) => {
                const meta = CATEGORY_COLORS[env.category];
                return (
                  <div
                    key={env.category}
                    className={`p-2 rounded-xl bg-slate-950/70 border transition-all duration-200 ${
                      hoveredDomain === env.category
                        ? 'border-cyan-400 bg-slate-800/90 shadow-md'
                        : 'border-slate-800/80 hover:border-slate-700'
                    }`}
                    onMouseEnter={() => setHoveredDomain(env.category)}
                    onMouseLeave={() => setHoveredDomain(null)}
                  >
                    <div className="text-[11px] font-bold truncate" style={{ color: meta.color }}>
                      {meta.shortLabel}
                    </div>
                    <div className="text-base font-mono font-black text-white mt-0.5">
                      {env.maxValue} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      Top: {env.bestTeamName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2 (BOTTOM): EXPANDED SWARM SKILL TREE MAP (WITH ZOOM & PAN) */}
          {/* ========================================================================= */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 text-xs gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-slate-200 text-sm">The Swarm Skill Tree (Celestial Map)</span>
              </div>

              {/* Interactive Zoom & Pan Navigation Toolbar */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl p-1 px-2 self-start sm:self-auto">
                <span className="text-[10px] font-mono text-slate-400 mr-1.5 flex items-center gap-1">
                  <Maximize2 className="w-3 h-3 text-slate-500" />
                  <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
                </span>

                <button
                  id="btn-zoom-in"
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  id="btn-zoom-out"
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <button
                  id="btn-zoom-reset"
                  type="button"
                  onClick={handleResetZoom}
                  className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer border border-slate-700"
                  title="Reset View"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Skill Graph SVG Canvas (Expanded Height with Zoom and Pan Container) */}
            <div
              className={`relative w-full h-[520px] md:h-[580px] my-3 bg-[#03060f] rounded-xl border border-slate-800/90 overflow-hidden flex items-center justify-center shadow-2xl ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Deep Cosmic Nebulae & Multi-layer Aetherial Glows */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Deep space radial vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(15,23,42,0.6)_0%,_rgba(3,6,15,0.95)_75%,_#02040a_100%)]" />
                
                {/* STEM / Science Cyan Cosmic Cloud (Top) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full bg-cyan-500/15 blur-3xl mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
                
                {/* Logic & Strategy Violet Nebula (Top Right) */}
                <div className="absolute top-8 right-6 w-80 h-64 rounded-full bg-purple-600/15 blur-3xl mix-blend-screen" />
                
                {/* Software & Systems Amber Star Dust (Bottom Right) */}
                <div className="absolute bottom-6 right-10 w-88 h-72 rounded-full bg-amber-500/15 blur-3xl mix-blend-screen" />
                
                {/* Language & Law Rose Stellar Cloud (Bottom Left) */}
                <div className="absolute bottom-6 left-10 w-80 h-64 rounded-full bg-rose-600/15 blur-3xl mix-blend-screen" />
                
                {/* General Reasoning Emerald Auroral Light (Top Left) */}
                <div className="absolute top-10 left-8 w-80 h-64 rounded-full bg-emerald-500/15 blur-3xl mix-blend-screen" />

                {/* Central Golden Singularity Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-400/10 blur-2xl mix-blend-screen" />

                {/* Ambient Scattered Background Stars */}
                {[
                  { t: '10%', l: '15%', s: 1.2, o: 0.6, c: '#e0f2fe' },
                  { t: '18%', l: '85%', s: 1.5, o: 0.8, c: '#ede9fe' },
                  { t: '82%', l: '14%', s: 1.0, o: 0.5, c: '#ffe4e6' },
                  { t: '76%', l: '88%', s: 1.4, o: 0.7, c: '#fef3c7' },
                  { t: '48%', l: '6%', s: 1.1, o: 0.4, c: '#d1fae5' },
                  { t: '42%', l: '94%', s: 1.3, o: 0.6, c: '#e0f2fe' },
                  { t: '12%', l: '60%', s: 1.0, o: 0.5, c: '#ffffff' },
                  { t: '88%', l: '50%', s: 1.2, o: 0.6, c: '#fef08a' },
                  { t: '28%', l: '32%', s: 0.8, o: 0.3, c: '#c7d2fe' },
                  { t: '65%', l: '70%', s: 0.9, o: 0.4, c: '#fde68a' },
                  { t: '70%', l: '30%', s: 0.8, o: 0.3, c: '#a7f3d0' },
                  { t: '8%', l: '38%', s: 1.1, o: 0.5, c: '#bae6fd' },
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

              {/* Transformable Interactive SVG Graph */}
              <div
                className="w-full h-full flex items-center justify-center transition-transform duration-75"
                style={{
                  transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                }}
              >
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

                    {/* Pentagon Measuring Scale Rings (25, 50, 75, 100 pt thresholds) */}
                    {[0.25, 0.5, 0.75, 1.0].map((scale, sIdx) => {
                      const r = 40 * scale;
                      const pts = [0, 72, 144, 216, 288].map((deg) => {
                        const rad = (deg - 90) * (Math.PI / 180);
                        return `${(50 + r * Math.cos(rad)).toFixed(2)},${(50 + r * Math.sin(rad)).toFixed(2)}`;
                      }).join(' ');
                      return (
                        <g key={`measuring-scale-${sIdx}`}>
                          <polygon
                            points={pts}
                            fill="none"
                            stroke={sIdx === 3 ? '#475569' : '#334155'}
                            strokeWidth={sIdx === 3 ? '0.35' : '0.2'}
                            strokeDasharray={sIdx === 3 ? '1 1.5' : '0.8 1.8'}
                            opacity={0.35 + sIdx * 0.1}
                          />
                          {/* Measuring calibration marker tag on top ray */}
                          <text
                            x="51.5"
                            y={50 - r + 1.2}
                            fill="#64748b"
                            fontSize="1.6"
                            fontFamily="monospace"
                            opacity="0.65"
                          >
                            {Math.round(scale * 100)}pt
                          </text>
                        </g>
                      );
                    })}

                    {/* Precision Celestial Coordinate Astrolabe Rings */}
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#334155" strokeWidth="0.3" strokeDasharray="1.5 2" opacity="0.3" />
                    <circle cx="50" cy="50" r="18" fill="none" stroke="#64748b" strokeWidth="0.2" opacity="0.25" />

                    {/* Radial Pentagon Axis Measuring Rays & Graduated Ticks */}
                    {[
                      { deg: 0, cat: 'Science & STEM', col: '#06b6d4' },
                      { deg: 72, cat: 'Logic & Strategy', col: '#a855f7' },
                      { deg: 144, cat: 'Coding & Tech', col: '#f59e0b' },
                      { deg: 216, cat: 'Humanities & Law', col: '#f43f5e' },
                      { deg: 288, cat: 'General Reasoning', col: '#10b981' },
                    ].map((ray, i) => {
                      const rad = (ray.deg - 90) * (Math.PI / 180);
                      const x1 = 50;
                      const y1 = 50;
                      const x2 = 50 + 42 * Math.cos(rad);
                      const y2 = 50 + 42 * Math.sin(rad);

                      // Perpendicular unit vector for tick marks
                      const perpRad = rad + Math.PI / 2;
                      const px = Math.cos(perpRad);
                      const py = Math.sin(perpRad);

                      return (
                        <g key={`axis-measuring-ray-${i}`}>
                          {/* Main Axis Ray */}
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={ray.col}
                            strokeWidth="0.35"
                            strokeDasharray="1.5 1.5"
                            opacity={hoveredDomain === ray.cat ? 0.8 : 0.35}
                          />
                          {/* Graduated Measuring Ticks at 10, 25, 45, 65, 80, 95 pts */}
                          {[10, 25, 45, 65, 80, 95].map((val) => {
                            const dist = (val / 100) * 40;
                            const tx = 50 + dist * Math.cos(rad);
                            const ty = 50 + dist * Math.sin(rad);
                            const tickLen = val % 25 === 0 ? 1.2 : 0.7;
                            return (
                              <line
                                key={`tick-${i}-${val}`}
                                x1={tx - px * tickLen}
                                y1={ty - py * tickLen}
                                x2={tx + px * tickLen}
                                y2={ty + py * tickLen}
                                stroke={ray.col}
                                strokeWidth={val % 25 === 0 ? '0.35' : '0.2'}
                                opacity={hoveredDomain === ray.cat ? 0.85 : 0.4}
                              />
                            );
                          })}
                        </g>
                      );
                    })}

                    {/* Scientific Discipline Geometric Watermarks */}
                    <ellipse cx="50" cy="20" rx="9" ry="3.5" fill="none" stroke="#06b6d4" strokeWidth="0.25" strokeDasharray="0.5 1.5" opacity="0.2" transform="rotate(-20 50 20)" />
                    <ellipse cx="50" cy="20" rx="9" ry="3.5" fill="none" stroke="#06b6d4" strokeWidth="0.25" strokeDasharray="0.5 1.5" opacity="0.2" transform="rotate(40 50 20)" />
                    <polygon points="76,32 84,32 88,38 84,44 76,44 72,38" fill="none" stroke="#a855f7" strokeWidth="0.25" strokeDasharray="0.8 1.2" opacity="0.2" />
                    <rect x="73" y="65" width="12" height="12" rx="2" fill="none" stroke="#f59e0b" strokeWidth="0.25" strokeDasharray="1 1.5" opacity="0.18" transform="rotate(15 79 71)" />
                    <path d="M 12 70 Q 20 62 28 70 T 44 70" fill="none" stroke="#f43f5e" strokeWidth="0.25" strokeDasharray="0.8 1.5" opacity="0.18" />
                    <circle cx="23" cy="38" r="8" fill="none" stroke="#10b981" strokeWidth="0.25" strokeDasharray="1 2" opacity="0.2" />
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

                  {/* --- Skill Nodes with Infilled Sector Offsets and Optical Diffraction Flares --- */}
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
                              d={`M ${perk.x - flareSize} ${perk.y} Q ${perk.x} ${perk.y} ${perk.x} ${perk.y - flareSize * 0.35} Q ${perk.x} ${perk.y} ${perk.x + flareSize} Q ${perk.x} ${perk.y} ${perk.x} ${perk.y + flareSize * 0.35} Z`}
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

                        {/* Node Text Label: Displayed only for landmark major nodes, or when actively hovered/selected */}
                        {(perk.isMajorNode || isSelected || hoveredPerk?.id === perk.id) && (
                          <text
                            x={perk.x}
                            y={perk.y + (perk.y > 65 ? -3.4 : 3.8)}
                            textAnchor="middle"
                            fill={isSelected || hoveredPerk?.id === perk.id ? '#ffffff' : (perk.isUnlocked ? perk.color : '#94a3b8')}
                            fontSize={perk.isMajorNode ? '2.3' : '2.0'}
                            fontWeight={perk.isMajorNode ? '700' : '600'}
                            className="font-sans select-none tracking-tight pointer-events-none"
                            style={{
                              textShadow: perk.isUnlocked
                                ? `0 0 6px ${perk.color}, 0 1px 3px rgba(0,0,0,0.9)`
                                : '0 1px 3px rgba(0,0,0,0.9)',
                            }}
                          >
                            {perk.shortName}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Branch Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-3 border-t border-slate-800">
              <span className="font-semibold text-slate-300">Pentagonal Disciplines:</span>
              <div className="flex flex-wrap items-center gap-3">
                {RADAR_CATEGORIES.map((cat) => {
                  const meta = CATEGORY_COLORS[cat];
                  return (
                    <span key={cat} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                      <span style={{ color: meta.color }} className="font-medium">{meta.shortLabel}</span>
                    </span>
                  );
                })}
                <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Cross-Discipline Hybrid</span>
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3: SKILL NODE DETAIL INSPECTOR & AGENT TEAM DEPLOYER */}
          {/* ========================================================================= */}
          {activePerk && (
            <div
              id="swarm-skill-inspector"
              className="bg-gradient-to-r from-[#0c1220] via-[#090d18] to-[#0c1220] border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-md space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg shrink-0"
                    style={{
                      backgroundColor: `${activePerk.color}15`,
                      borderColor: `${activePerk.color}50`,
                    }}
                  >
                    {React.createElement(getIconComponent(activePerk.iconName), {
                      className: 'w-6 h-6',
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
                    <h4 className="text-xl font-bold text-white tracking-tight mt-0.5">
                      {activePerk.name}
                    </h4>
                  </div>
                </div>

                {/* Node Quick Select Status */}
                {recInfo?.matchingTeam ? (
                  <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Active in Swarm ({recInfo.matchingTeam.name})</span>
                  </div>
                ) : null}
              </div>

              {/* Performance Effect & Discipline Context */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs">
                <div className="md:col-span-6 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-xs">Capability Impact & Performance</span>
                  </div>
                  <p className="text-slate-200 font-mono text-xs leading-relaxed">
                    {activePerk.buff}
                  </p>
                </div>

                <div className="md:col-span-6 bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-400 mb-1.5">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span className="text-xs">Discipline Context</span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {activePerk.lore}
                  </p>
                </div>
              </div>

              {/* Reverse Selection: Recommended Specialized Model Team Deployer */}
              {recInfo && (
                <div
                  id="node-team-deployer"
                  className="bg-slate-950/90 border border-cyan-900/60 rounded-xl p-4 sm:p-5 text-xs space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-slate-100 uppercase tracking-wider text-xs">
                        Recommended Agent Team: <span className="text-cyan-300">{recInfo.rec.teamLabel}</span>
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Specialized for this node
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    {recInfo.rec.rationale}
                  </p>

                  {/* Models in recommended pairing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Alpha Agent */}
                    <div className="bg-slate-900/80 border border-blue-900/50 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-blue-300 font-mono font-bold">
                        <span>AGENT ALPHA (α)</span>
                        <span className="text-slate-400">{recInfo.rec.recommendedRoleAlpha}</span>
                      </div>
                      <div className="font-bold text-slate-100 text-sm">
                        {recInfo.alpha?.name || recInfo.rec.primaryAlphaId}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {recInfo.alpha?.provider || 'AI Model'} • {recInfo.alpha?.isFree ? 'Free Tier' : 'Pro Tier'}
                      </div>
                    </div>

                    {/* Beta Agent */}
                    <div className="bg-slate-900/80 border border-emerald-900/50 rounded-xl p-3 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-emerald-300 font-mono font-bold">
                        <span>AGENT BETA (β)</span>
                        <span className="text-slate-400">{recInfo.rec.recommendedRoleBeta}</span>
                      </div>
                      <div className="font-bold text-slate-100 text-sm">
                        {recInfo.beta?.name || recInfo.rec.primaryBetaId}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {recInfo.beta?.provider || 'AI Model'} • {recInfo.beta?.isFree ? 'Free Tier' : 'Pro Tier'}
                      </div>
                    </div>
                  </div>

                  {/* Deploy Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Reverse-select this pairing into your active swarm:</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        id="btn-apply-node-to-team-1"
                        type="button"
                        onClick={handleApplyToTeam1}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-slate-600 transition-all cursor-pointer shadow-sm"
                      >
                        {justApplied === 'team-1' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        )}
                        <span>{justApplied === 'team-1' ? 'Applied to Team 1!' : 'Set as Team 1'}</span>
                      </button>

                      <button
                        id="btn-add-node-as-swarm-team"
                        type="button"
                        onClick={handleAddNewTeam}
                        disabled={teams.length >= 5}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-md ${
                          teams.length < 5
                            ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-950/40'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        {justApplied === 'new-team' ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        <span>
                          {justApplied === 'new-team'
                            ? 'Team Added to Swarm!'
                            : teams.length >= 5
                            ? 'Max Teams (5)'
                            : '+ Add as Swarm Team'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

