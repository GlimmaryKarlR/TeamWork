import React, { useState } from 'react';
import { RADAR_CATEGORIES, TeamRadarProfile, CATEGORY_COLORS, RadarCategory } from '../data/radarData';
import { LLMModel } from '../types';

interface TeamRadarChartProps {
  alphaModel: LLMModel;
  betaModel: LLMModel;
  profile: TeamRadarProfile;
  size?: number;
  teamIndex?: number;
  strokeColor?: string;
  fillColor?: string;
}

export const TeamRadarChart: React.FC<TeamRadarChartProps> = ({
  alphaModel,
  betaModel,
  profile,
  size = 220,
  teamIndex = 0,
  strokeColor = '#38bdf8',
  fillColor = 'rgba(56, 189, 248, 0.25)',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const center = size / 2;
  const radius = (size - 60) / 2; // Leave room for category labels
  const totalAxes = RADAR_CATEGORIES.length;
  const angleStep = (2 * Math.PI) / totalAxes;

  // Grid concentric rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Helper to calculate (x, y) given angle and normalized distance (0 - 1)
  const getCoordinates = (index: number, normalizedValue: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const x = center + radius * normalizedValue * Math.cos(angle);
    const y = center + radius * normalizedValue * Math.sin(angle);
    return { x, y };
  };

  // Build polygon points string for data
  const dataPoints = profile.categories.map((cat, idx) => {
    const norm = Math.max(0.15, Math.min(1.0, cat.value / 100));
    const { x, y } = getCoordinates(idx, norm);
    return `${x},${y}`;
  }).join(' ');

  const gradId = `radar-grad-${teamIndex}-${alphaModel.id}-${betaModel.id}`.replace(/[^a-zA-Z0-9_-]/g, '');

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible select-none"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.75" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.25" />
          </linearGradient>
          <filter id={`glow-${teamIndex}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Radial Rings (Concentric Pentagons) */}
        {rings.map((ringFactor, rIdx) => {
          const ringPoints = RADAR_CATEGORIES.map((_, idx) => {
            const { x, y } = getCoordinates(idx, ringFactor);
            return `${x},${y}`;
          }).join(' ');

          return (
            <polygon
              key={`ring-${rIdx}`}
              points={ringPoints}
              fill={rIdx === rings.length - 1 ? '#0b0f19' : 'none'}
              stroke="#1e293b"
              strokeWidth={rIdx === rings.length - 1 ? '1.5' : '1'}
              strokeDasharray={rIdx < rings.length - 1 ? '2 2' : undefined}
              className="transition-all duration-300"
            />
          );
        })}

        {/* Axis Spokes from Center with subtle domain coloring */}
        {RADAR_CATEGORIES.map((cat, idx) => {
          const { x, y } = getCoordinates(idx, 1.0);
          const colorMeta = CATEGORY_COLORS[cat];
          const isHovered = hoveredIdx === idx;

          return (
            <line
              key={`spoke-${idx}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke={isHovered ? colorMeta.color : '#334155'}
              strokeWidth={isHovered ? '1.5' : '1'}
              strokeDasharray={isHovered ? undefined : '1 2'}
              className="transition-colors duration-200"
            />
          );
        })}

        {/* Dynamic Data Polygon for Selected Team */}
        <polygon
          points={dataPoints}
          fill={`url(#${gradId})`}
          fillOpacity="0.3"
          stroke={strokeColor}
          strokeWidth="2"
          filter={`url(#glow-${teamIndex})`}
          className="transition-all duration-500 ease-out"
        />

        {/* Category Vertex Points colored by their UNIQUE SKILL domain */}
        {profile.categories.map((cat, idx) => {
          const norm = Math.max(0.15, Math.min(1.0, cat.value / 100));
          const { x, y } = getCoordinates(idx, norm);
          const colorMeta = CATEGORY_COLORS[cat.category];
          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={`dot-${idx}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {/* Outer halo when active */}
              {isHovered && (
                <circle
                  cx={x}
                  cy={y}
                  r="8"
                  fill={colorMeta.color}
                  fillOpacity="0.25"
                  className="animate-ping"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? '5' : '3.5'}
                fill={colorMeta.color}
                stroke="#0f172a"
                strokeWidth="2"
                className="transition-all duration-200"
              />
            </g>
          );
        })}

        {/* Axis Labels colored corresponding to unique skills */}
        {RADAR_CATEGORIES.map((catName, idx) => {
          const labelDist = 1.25;
          const { x, y } = getCoordinates(idx, labelDist);
          const colorMeta = CATEGORY_COLORS[catName];
          const isHovered = hoveredIdx === idx;
          const score = profile.categories.find(c => c.category === catName)?.value || 0;

          return (
            <g
              key={`label-${idx}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              <text
                x={x}
                y={y}
                textAnchor="middle"
                fill={isHovered ? '#ffffff' : colorMeta.color}
                className="text-[9px] font-bold tracking-tight transition-colors duration-150"
              >
                {colorMeta.shortLabel}
              </text>
              <text
                x={x}
                y={y + 9}
                textAnchor="middle"
                fill={isHovered ? colorMeta.color : '#64748b'}
                className="text-[8px] font-mono font-semibold"
              >
                {score}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Interactive Tooltip on hover */}
      {hoveredIdx !== null && (
        <div
          className="absolute -bottom-8 px-2 py-1 bg-slate-900/95 border border-slate-700/80 rounded shadow-xl text-[10px] flex items-center gap-1.5 backdrop-blur-md pointer-events-none z-20"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS[RADAR_CATEGORIES[hoveredIdx]].color }}
          />
          <span className="font-semibold text-slate-200">
            {RADAR_CATEGORIES[hoveredIdx]}:
          </span>
          <span className="font-mono font-bold text-white">
            {profile.categories.find(c => c.category === RADAR_CATEGORIES[hoveredIdx])?.value || 0} pts
          </span>
        </div>
      )}
    </div>
  );
};
