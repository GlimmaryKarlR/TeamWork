import React from 'react';
import { RADAR_CATEGORIES, TeamRadarProfile, RadarCategory } from '../data/radarData';
import { LLMModel } from '../types';

interface TeamRadarChartProps {
  alphaModel: LLMModel;
  betaModel: LLMModel;
  profile: TeamRadarProfile;
  size?: number;
}

export const TeamRadarChart: React.FC<TeamRadarChartProps> = ({
  alphaModel,
  betaModel,
  profile,
  size = 220,
}) => {
  const center = size / 2;
  const radius = (size - 60) / 2; // Leave room for category labels
  const totalAxes = RADAR_CATEGORIES.length;
  const angleStep = (2 * Math.PI) / totalAxes;

  // Grid concentric rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Helper to calculate (x, y) given angle and normalized distance (0 - 1)
  const getCoordinates = (index: number, normalizedValue: number) => {
    // Start from top (-Math.PI / 2) and go clockwise
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

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible select-none"
      >
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

        {/* Axis Spokes from Center to each Vertex */}
        {RADAR_CATEGORIES.map((_, idx) => {
          const { x, y } = getCoordinates(idx, 1.0);
          return (
            <line
              key={`spoke-${idx}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#1e293b"
              strokeWidth="1"
            />
          );
        })}

        {/* Dynamic Data Polygon for Selected Team */}
        <polygon
          points={dataPoints}
          fill="url(#teamRadarGradient)"
          fillOpacity="0.35"
          stroke="#3b82f6"
          strokeWidth="2"
          className="transition-all duration-500 ease-out"
        />

        {/* Radar Vertices (Circles) */}
        {profile.categories.map((cat, idx) => {
          const norm = Math.max(0.15, Math.min(1.0, cat.value / 100));
          const { x, y } = getCoordinates(idx, norm);
          return (
            <circle
              key={`dot-${idx}`}
              cx={x}
              cy={y}
              r="3.5"
              fill="#3b82f6"
              stroke="#ffffff"
              strokeWidth="1.5"
              className="transition-all duration-500 ease-out cursor-pointer hover:r-5"
            >
              <title>{`${cat.category}: ${cat.value}`}</title>
            </circle>
          );
        })}

        {/* Axis Labels */}
        {RADAR_CATEGORIES.map((catName, idx) => {
          const labelDist = 1.22;
          const { x, y } = getCoordinates(idx, labelDist);

          // Category abbreviation or line split for compact display
          let shortLabel: string = catName;
          if (catName === 'Science & STEM') shortLabel = 'Science';
          if (catName === 'Logic & Strategy') shortLabel = 'Logic';
          if (catName === 'Coding & Tech') shortLabel = 'Coding';
          if (catName === 'Humanities & Law') shortLabel = 'Humanities';
          if (catName === 'General Reasoning') shortLabel = 'Reasoning';

          return (
            <text
              key={`label-${idx}`}
              x={x}
              y={y + 3}
              textAnchor="middle"
              className="text-[9px] font-semibold fill-slate-300 tracking-tight"
            >
              {shortLabel}
            </text>
          );
        })}

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="teamRadarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
