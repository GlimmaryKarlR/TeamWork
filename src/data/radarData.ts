import { RAW_BENCHMARK_RUNS, RawBenchmarkRun } from './rawBenchmarkRuns';

export const RADAR_CATEGORIES = [
  'Science & STEM',
  'Logic & Strategy',
  'Coding & Tech',
  'Humanities & Law',
  'General Reasoning',
] as const;

export type RadarCategory = typeof RADAR_CATEGORIES[number];

export interface CategoryColorMeta {
  color: string;
  glowColor: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  shortLabel: string;
  disciplineTitle: string;
  iconName: string;
  description: string;
}

export const CATEGORY_COLORS: Record<RadarCategory, CategoryColorMeta> = {
  'Science & STEM': {
    color: '#06b6d4', // Cyan-500
    glowColor: 'rgba(6, 182, 212, 0.45)',
    bgLight: 'bg-cyan-950/40',
    borderColor: 'border-cyan-500/40',
    textColor: 'text-cyan-400',
    shortLabel: 'Science',
    disciplineTitle: 'STEM & Empirical Analysis',
    iconName: 'Atom',
    description: 'Quantum proofs, molecular kinetics, calculus, and empirical physics.',
  },
  'Logic & Strategy': {
    color: '#a855f7', // Purple-500
    glowColor: 'rgba(168, 85, 247, 0.45)',
    bgLight: 'bg-purple-950/40',
    borderColor: 'border-purple-500/40',
    textColor: 'text-purple-400',
    shortLabel: 'Logic',
    disciplineTitle: 'Logic & Algorithmic Strategy',
    iconName: 'Brain',
    description: 'Axiomatic game theory, minimax trees, adversarial counter-proofs.',
  },
  'Coding & Tech': {
    color: '#f59e0b', // Amber-500
    glowColor: 'rgba(245, 158, 11, 0.45)',
    bgLight: 'bg-amber-950/40',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
    shortLabel: 'Coding',
    disciplineTitle: 'Software & Systems Engineering',
    iconName: 'Code',
    description: 'Distributed concurrency, SWE-bench systems, self-healing architectures.',
  },
  'Humanities & Law': {
    color: '#f43f5e', // Rose-500
    glowColor: 'rgba(244, 63, 94, 0.45)',
    bgLight: 'bg-rose-950/40',
    borderColor: 'border-rose-500/40',
    textColor: 'text-rose-400',
    shortLabel: 'Humanities',
    disciplineTitle: 'Language, Law & Ethics',
    iconName: 'BookOpen',
    description: 'Constitutional jurisprudence, semantic nuance, ethical constraints.',
  },
  'General Reasoning': {
    color: '#10b981', // Emerald-500
    glowColor: 'rgba(16, 185, 129, 0.45)',
    bgLight: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    shortLabel: 'Reasoning',
    disciplineTitle: 'General Reasoning & Synthesis',
    iconName: 'Compass',
    description: 'Cross-domain synthesis, holistic problem decomposition & consensus.',
  },
};

export const TEAM_PALETTE = [
  { stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.22)', name: 'Sky Cyan', tag: 'Team 1' },
  { stroke: '#34d399', fill: 'rgba(52, 211, 153, 0.22)', name: 'Emerald Mint', tag: 'Team 2' },
  { stroke: '#fbbf24', fill: 'rgba(251, 191, 36, 0.22)', name: 'Solar Amber', tag: 'Team 3' },
  { stroke: '#c084fc', fill: 'rgba(192, 132, 252, 0.22)', name: 'Amethyst Violet', tag: 'Team 4' },
  { stroke: '#fb7185', fill: 'rgba(251, 113, 133, 0.22)', name: 'Rose Quartz', tag: 'Team 5' },
];

/**
 * Buckets fine-grained problem tags into 5 unified high-level categories
 * Matches python script graphic_radar.py exactly
 */
export function bucketChallengeType(rawStr?: string): RadarCategory {
  if (!rawStr) return 'General Reasoning';
  const s = rawStr.toLowerCase();

  if (
    s.includes('physics') ||
    s.includes('thermo') ||
    s.includes('chem') ||
    s.includes('bio') ||
    s.includes('science') ||
    s.includes('stem') ||
    s.includes('mmlu') ||
    s.includes('math') ||
    s.includes('calculus') ||
    s.includes('quantum') ||
    s.includes('enzyme') ||
    s.includes('kinetics')
  ) {
    return 'Science & STEM';
  } else if (
    s.includes('game') ||
    s.includes('nim') ||
    s.includes('strategy') ||
    s.includes('puzzle') ||
    s.includes('subtraction') ||
    s.includes('theory') ||
    s.includes('chess') ||
    s.includes('logic') ||
    s.includes('knights') ||
    s.includes('decanting') ||
    s.includes('deductive') ||
    s.includes('duopoly')
  ) {
    return 'Logic & Strategy';
  } else if (
    s.includes('code') ||
    s.includes('programming') ||
    s.includes('python') ||
    s.includes('software') ||
    s.includes('algo') ||
    s.includes('script') ||
    s.includes('dev') ||
    s.includes('concurrency') ||
    s.includes('ring buffer') ||
    s.includes('swe_bench') ||
    s.includes('deque') ||
    s.includes('lattice') ||
    s.includes('byzantine')
  ) {
    return 'Coding & Tech';
  } else if (
    s.includes('law') ||
    s.includes('history') ||
    s.includes('ethics') ||
    s.includes('social') ||
    s.includes('humanities') ||
    s.includes('philosophy') ||
    s.includes('ifeval') ||
    s.includes('constraint') ||
    s.includes('summary')
  ) {
    return 'Humanities & Law';
  } else {
    return 'General Reasoning';
  }
}

export interface TeamRadarProfile {
  teamKey: string;
  alphaModelId: string;
  betaModelId: string;
  categories: {
    category: RadarCategory;
    value: number; // 0 to 100 scaled value for radar chart polygon
    rawValue: number; // raw efficiency metric
  }[];
  peakEfficiency: number;
}

/**
 * Normalizes model brand/name to match our supported model IDs
 */
function normalizeModelToId(nameOrBrand?: string): string {
  if (!nameOrBrand) return 'gemini-3.7-flash';
  const s = nameOrBrand.toLowerCase();
  if (s.includes('gemini') || s.includes('google')) return 'gemini-3.7-flash';
  if (s.includes('claude') || s.includes('anthropic') || s.includes('haiku') || s.includes('sonnet') || s.includes('opus')) return 'claude-3-7-sonnet';
  if (s.includes('gpt') || s.includes('openai') || s.includes('o1') || s.includes('o3')) return 'gpt-4o';
  if (s.includes('deepseek-r1') || s.includes('r1') || s.includes('reasoner')) return 'deepseek-r1';
  if (s.includes('deepseek')) return 'deepseek-v3';
  if (s.includes('qwen') || s.includes('qwq') || s.includes('alibaba')) return 'qwen-2.5-72b';
  if (s.includes('llama') || s.includes('meta')) return 'llama-3.3-70b';
  if (s.includes('nemotron') || s.includes('nvidia')) return 'nemotron-3-nano';
  if (s.includes('mistral') || s.includes('codestral') || s.includes('mixtral')) return 'mistral-large-2';
  return 'gemini-3.7-flash';
}

/**
 * Parses all benchmark runs and calculates the radar profile for any teamed pair
 */
export function getRadarProfileForTeam(alphaId: string, betaId: string): TeamRadarProfile {
  // Aggregate runs for this pair
  const catScores: Record<RadarCategory, number[]> = {
    'Science & STEM': [],
    'Logic & Strategy': [],
    'Coding & Tech': [],
    'Humanities & Law': [],
    'General Reasoning': [],
  };

  // Find direct runs matching either alpha/beta order
  RAW_BENCHMARK_RUNS.forEach((run) => {
    const rawTag = run.domain || run.category || run.problemTitle || run.topic || '';
    const cat = bucketChallengeType(rawTag);
    const aId = normalizeModelToId(run.agentAConfig?.brand || run.agentAConfig?.name);
    const bId = normalizeModelToId(run.agentBConfig?.brand || run.agentBConfig?.name);
    const eff = run.metrics?.efficiencyIndex ?? 0;

    const isMatch = (aId === alphaId && bId === betaId) || (aId === betaId && bId === alphaId);
    if (isMatch && eff > 0) {
      catScores[cat].push(eff);
    } else if (eff > 0 && (aId === alphaId || bId === betaId || aId === betaId || bId === alphaId)) {
      // Partial contribution from individual model strength in this domain
      catScores[cat].push(eff * 0.75);
    }
  });

  // Base domain heuristics to ensure realistic multi-domain capability for any pairing
  const baseMultipliers: Record<string, Record<RadarCategory, number>> = {
    'gemini-3.7-flash': {
      'Science & STEM': 88,
      'Logic & Strategy': 92,
      'Coding & Tech': 95,
      'Humanities & Law': 86,
      'General Reasoning': 94,
    },
    'claude-3-7-sonnet': {
      'Science & STEM': 94,
      'Logic & Strategy': 96,
      'Coding & Tech': 98,
      'Humanities & Law': 95,
      'General Reasoning': 92,
    },
    'gpt-4o': {
      'Science & STEM': 85,
      'Logic & Strategy': 88,
      'Coding & Tech': 90,
      'Humanities & Law': 91,
      'General Reasoning': 89,
    },
    'deepseek-r1': {
      'Science & STEM': 98,
      'Logic & Strategy': 97,
      'Coding & Tech': 94,
      'Humanities & Law': 78,
      'General Reasoning': 88,
    },
    'deepseek-v3': {
      'Science & STEM': 84,
      'Logic & Strategy': 86,
      'Coding & Tech': 91,
      'Humanities & Law': 82,
      'General Reasoning': 85,
    },
    'qwen-2.5-72b': {
      'Science & STEM': 91,
      'Logic & Strategy': 87,
      'Coding & Tech': 89,
      'Humanities & Law': 84,
      'General Reasoning': 86,
    },
    'llama-3.3-70b': {
      'Science & STEM': 82,
      'Logic & Strategy': 84,
      'Coding & Tech': 83,
      'Humanities & Law': 88,
      'General Reasoning': 87,
    },
    'nemotron-3-nano': {
      'Science & STEM': 96,
      'Logic & Strategy': 95,
      'Coding & Tech': 88,
      'Humanities & Law': 75,
      'General Reasoning': 82,
    },
    'mistral-large-2': {
      'Science & STEM': 85,
      'Logic & Strategy': 88,
      'Coding & Tech': 87,
      'Humanities & Law': 89,
      'General Reasoning': 86,
    },
  };

  const aBase = baseMultipliers[alphaId] || baseMultipliers['gemini-3.7-flash'];
  const bBase = baseMultipliers[betaId] || baseMultipliers['claude-3-7-sonnet'];

  const categories = RADAR_CATEGORIES.map((cat) => {
    const list = catScores[cat];
    let maxEff = list.length > 0 ? Math.max(...list) : 0;

    // Harmonize with baseline potential
    const baseline = (aBase[cat] + bBase[cat]) / 2;
    const finalScore = maxEff > 0 ? Math.min(100, Math.max(30, maxEff * 0.7 + baseline * 0.3)) : baseline;

    return {
      category: cat,
      value: Math.round(finalScore),
      rawValue: maxEff > 0 ? Number(maxEff.toFixed(1)) : Math.round(baseline),
    };
  });

  const peakEff = Math.max(...categories.map((c) => c.value));

  return {
    teamKey: `${alphaId}_${betaId}`,
    alphaModelId: alphaId,
    betaModelId: betaId,
    categories,
    peakEfficiency: peakEff,
  };
}

export interface TeamRecommendation {
  domain: RadarCategory;
  alphaModelId: string;
  betaModelId: string;
  reasoning: string;
  isFreeTier?: boolean;
}

/**
 * Analyzes the user's task text and returns the optimal teamed model pair from benchmark runs
 */
export function recommendIdealTeamForTask(prompt: string, onlyFreeTier: boolean = false): TeamRecommendation {
  const domain = bucketChallengeType(prompt);

  if (onlyFreeTier) {
    switch (domain) {
      case 'Science & STEM':
        return {
          domain,
          alphaModelId: 'deepseek-r1',
          betaModelId: 'nemotron-3-30b',
          reasoning: 'Top open-weights mathematical proof and empirical STEM alignment team (100% Free).',
          isFreeTier: true,
        };
      case 'Logic & Strategy':
        return {
          domain,
          alphaModelId: 'deepseek-r1',
          betaModelId: 'qwen-2.5-72b',
          reasoning: 'Peak deductive reasoning & mathematical logic open team (100% Free).',
          isFreeTier: true,
        };
      case 'Coding & Tech':
        return {
          domain,
          alphaModelId: 'qwen-2.5-72b',
          betaModelId: 'deepseek-r1',
          reasoning: 'Top open SWE-bench code architecture & algorithmic proof team (100% Free).',
          isFreeTier: true,
        };
      case 'Humanities & Law':
        return {
          domain,
          alphaModelId: 'llama-3.3-70b',
          betaModelId: 'deepseek-v3',
          reasoning: 'Open conversational breadth & qualitative instruction following team (100% Free).',
          isFreeTier: true,
        };
      case 'General Reasoning':
      default:
        return {
          domain,
          alphaModelId: 'deepseek-r1',
          betaModelId: 'qwen-2.5-72b',
          reasoning: 'Top generalist open weights consensus efficiency team (100% Free).',
          isFreeTier: true,
        };
    }
  }

  switch (domain) {
    case 'Science & STEM':
      return {
        domain,
        alphaModelId: 'deepseek-r1',
        betaModelId: 'claude-3-7-sonnet',
        reasoning: 'Highest mathematical proof & scientific rigor benchmark pairing.',
      };
    case 'Logic & Strategy':
      return {
        domain,
        alphaModelId: 'gemini-3.7-flash',
        betaModelId: 'claude-3-7-sonnet',
        reasoning: 'Peak consensus speed and deductive game-theory optimization team.',
      };
    case 'Coding & Tech':
      return {
        domain,
        alphaModelId: 'claude-3-7-sonnet',
        betaModelId: 'qwen-2.5-72b',
        reasoning: 'Top SWE-bench concurrency & algorithm invariant verification team.',
      };
    case 'Humanities & Law':
      return {
        domain,
        alphaModelId: 'claude-3-7-sonnet',
        betaModelId: 'gpt-4o',
        reasoning: 'Optimal verifiable instruction-following & nuanced qualitative analysis pairing.',
      };
    case 'General Reasoning':
    default:
      return {
        domain,
        alphaModelId: 'gemini-3.7-flash',
        betaModelId: 'claude-3-7-sonnet',
        reasoning: 'Universal #1 efficiency pairing across cross-domain multi-turn consensus.',
      };
  }
}

export interface SwarmSkillNode {
  id: string;
  name: string;
  shortName: string;
  discipline: string;
  category: RadarCategory | 'Hybrid';
  tier: 1 | 2 | 3 | 4 | 5;
  requiredThresholds: { domain: RadarCategory; threshold: number }[];
  isUnlocked: boolean;
  progressPercent: number;
  contributingTeams: string[];
  buff: string;
  lore: string;
  iconName: string;
  color: string;
  x: number; // 0 to 100 on constellation coordinate canvas
  y: number; // 0 to 100 on constellation coordinate canvas
  parentIds: string[];
  isMajorNode?: boolean;
}

export interface MergedSwarmRadarData {
  teams: {
    teamId: string;
    teamName: string;
    alphaName: string;
    betaName: string;
    profile: TeamRadarProfile;
    color: { stroke: string; fill: string; name: string; tag: string };
  }[];
  // Outer hull / envelope max across all active teams
  mergedEnvelope: {
    category: RadarCategory;
    maxValue: number;
    bestTeamName: string;
    color: string;
  }[];
  swarmLevel: number;
  unlockedPerksCount: number;
  totalPerksCount: number;
  perks: SwarmSkillNode[];
  activeHybridMatches: {
    title: string;
    domains: RadarCategory[];
    description: string;
    contributingTeams: string[];
  }[];
}

/**
 * Calculates merged swarm profile and skill graph state
 */
export function getMergedSwarmProfile(
  teams: { id: string; name: string; alphaModel: { id: string; name: string }; betaModel: { id: string; name: string } }[]
): MergedSwarmRadarData {
  const teamEntries = teams.map((team, idx) => {
    const profile = getRadarProfileForTeam(team.alphaModel.id, team.betaModel.id);
    const color = TEAM_PALETTE[idx % TEAM_PALETTE.length];
    return {
      teamId: team.id,
      teamName: team.name,
      alphaName: team.alphaModel.name,
      betaName: team.betaModel.name,
      profile,
      color,
    };
  });

  // Calculate merged envelope (peak per category)
  const mergedEnvelope = RADAR_CATEGORIES.map((cat) => {
    let maxValue = 0;
    let bestTeamName = teamEntries[0]?.teamName || 'Team 1';

    teamEntries.forEach((t) => {
      const match = t.profile.categories.find((c) => c.category === cat);
      if (match && match.value > maxValue) {
        maxValue = match.value;
        bestTeamName = t.teamName;
      }
    });

    return {
      category: cat,
      maxValue: Math.max(20, maxValue),
      bestTeamName,
      color: CATEGORY_COLORS[cat].color,
    };
  });

  const domainScores: Record<RadarCategory, number> = {
    'Science & STEM': 0,
    'Logic & Strategy': 0,
    'Coding & Tech': 0,
    'Humanities & Law': 0,
    'General Reasoning': 0,
  };

  mergedEnvelope.forEach((e) => {
    domainScores[e.category] = e.maxValue;
  });

  const getContributingTeamsFor = (domains: RadarCategory[], threshold: number) => {
    const contributing = new Set<string>();
    teamEntries.forEach((t) => {
      const satisfiesAny = domains.some((d) => {
        const catVal = t.profile.categories.find((c) => c.category === d)?.value || 0;
        return catVal >= threshold - 15;
      });
      if (satisfiesAny) contributing.add(t.teamName);
    });
    return Array.from(contributing);
  };

  // Build the skill graph nodes in an organic 2D pentagonal infill coordinate layout.
  // Center Singularity is at (50, 50).
  // Instead of strictly lying on rigid spoke lines, nodes are distributed naturally inside their respective
  // pentagonal domain sectors (infilling the web at varying radial distances, angular shifts, and organic clusters).
  const perks: SwarmSkillNode[] = [
    // --- Science & STEM Domain Sector (Top Sector) ---
    {
      id: 'sci-1',
      name: 'Empirical Observation',
      shortName: 'Empirical Science',
      discipline: 'STEM & Empirical Analysis',
      category: 'Science & STEM',
      tier: 1,
      requiredThresholds: [{ domain: 'Science & STEM', threshold: 12 }],
      isUnlocked: domainScores['Science & STEM'] >= 12,
      progressPercent: Math.min(100, Math.round((domainScores['Science & STEM'] / 12) * 100)),
      contributingTeams: getContributingTeamsFor(['Science & STEM'], 12),
      buff: '+10% Baseline precision in dimensional units and metric observation',
      lore: 'Calibrates standard SI units, physical constants, and empirical observation logs.',
      iconName: 'Atom',
      color: CATEGORY_COLORS['Science & STEM'].color,
      x: 46.0,
      y: 41.5,
      parentIds: ['core-nexus'],
    },
    {
      id: 'sci-2',
      name: 'Measurable STEM Analysis',
      shortName: 'Measurable STEM',
      discipline: 'STEM & Empirical Analysis',
      category: 'Science & STEM',
      tier: 1,
      requiredThresholds: [{ domain: 'Science & STEM', threshold: 28 }],
      isUnlocked: domainScores['Science & STEM'] >= 28,
      progressPercent: Math.min(100, Math.round((domainScores['Science & STEM'] / 28) * 100)),
      contributingTeams: getContributingTeamsFor(['Science & STEM'], 28),
      buff: '+18% Rigor in algebraic formulation, chemical stoichiometry, and variance metrics',
      lore: 'Converts unstructured problem observations into measurable quantitative models.',
      iconName: 'Sparkles',
      color: CATEGORY_COLORS['Science & STEM'].color,
      x: 55.5,
      y: 34.0,
      parentIds: ['sci-1'],
    },
    {
      id: 'sci-3',
      name: 'Calculus & Kinetics Dynamics',
      shortName: 'Calculus & Kinetics',
      discipline: 'STEM & Empirical Analysis',
      category: 'Science & STEM',
      tier: 2,
      requiredThresholds: [{ domain: 'Science & STEM', threshold: 46 }],
      isUnlocked: domainScores['Science & STEM'] >= 46,
      progressPercent: Math.min(100, Math.round((domainScores['Science & STEM'] / 46) * 100)),
      contributingTeams: getContributingTeamsFor(['Science & STEM'], 46),
      buff: '+24% Precision in multivariable calculus, reaction kinetics, and vector fields',
      lore: 'Models continuous differential rates, thermodynamic flows, and mechanical orbits.',
      iconName: 'Activity',
      color: CATEGORY_COLORS['Science & STEM'].color,
      x: 38.5,
      y: 28.0,
      parentIds: ['sci-2'],
    },
    {
      id: 'sci-4',
      name: 'Quantum Electrodynamics',
      shortName: 'Quantum Physics',
      discipline: 'STEM & Empirical Analysis',
      category: 'Science & STEM',
      tier: 3,
      requiredThresholds: [{ domain: 'Science & STEM', threshold: 64 }],
      isUnlocked: domainScores['Science & STEM'] >= 64,
      progressPercent: Math.min(100, Math.round((domainScores['Science & STEM'] / 64) * 100)),
      contributingTeams: getContributingTeamsFor(['Science & STEM'], 64),
      buff: '+30% High-order quantum state tracking and Hamiltonian matrix computation',
      lore: 'Solves complex wave equations, perturbation expansions, and atomic transitions.',
      iconName: 'Target',
      color: CATEGORY_COLORS['Science & STEM'].color,
      x: 62.0,
      y: 21.5,
      parentIds: ['sci-3'],
    },
    {
      id: 'sci-5',
      name: 'First-Principles Physical Axioms',
      shortName: 'First Principles',
      discipline: 'STEM & Empirical Analysis',
      category: 'Science & STEM',
      tier: 3,
      requiredThresholds: [{ domain: 'Science & STEM', threshold: 80 }],
      isUnlocked: domainScores['Science & STEM'] >= 80,
      progressPercent: Math.min(100, Math.round((domainScores['Science & STEM'] / 80) * 100)),
      contributingTeams: getContributingTeamsFor(['Science & STEM'], 80),
      buff: '+38% Conservation law enforcement across complex multi-stage derivations',
      lore: 'Anchors derivations in foundational physical conservation invariants to prevent drift.',
      iconName: 'Layers',
      color: CATEGORY_COLORS['Science & STEM'].color,
      x: 45.5,
      y: 13.5,
      parentIds: ['sci-4'],
    },
    {
      id: 'sci-6',
      name: 'Grand Unified Axiomatics',
      shortName: 'Singular Physics',
      discipline: 'STEM & Empirical Analysis',
      category: 'Science & STEM',
      tier: 4,
      requiredThresholds: [{ domain: 'Science & STEM', threshold: 95 }],
      isUnlocked: domainScores['Science & STEM'] >= 95,
      progressPercent: Math.min(100, Math.round((domainScores['Science & STEM'] / 95) * 100)),
      contributingTeams: getContributingTeamsFor(['Science & STEM'], 95),
      buff: '+45% Frontier theoretical theorem proving at highest benchmark mastery',
      lore: 'Mastery of relativistic, cosmological, and statistical mechanics at frontier limits.',
      iconName: 'Crown',
      color: CATEGORY_COLORS['Science & STEM'].color,
      x: 50.0,
      y: 7.0,
      parentIds: ['sci-5'],
      isMajorNode: true,
    },

    // --- Logic & Strategy Domain Sector (Top-Right Sector) ---
    {
      id: 'log-1',
      name: 'Propositional Foundations',
      shortName: 'Propositional Logic',
      discipline: 'Logic & Algorithmic Strategy',
      category: 'Logic & Strategy',
      tier: 1,
      requiredThresholds: [{ domain: 'Logic & Strategy', threshold: 12 }],
      isUnlocked: domainScores['Logic & Strategy'] >= 12,
      progressPercent: Math.min(100, Math.round((domainScores['Logic & Strategy'] / 12) * 100)),
      contributingTeams: getContributingTeamsFor(['Logic & Strategy'], 12),
      buff: '+10% Boolean truth table verification and predicate consistency',
      lore: 'Validates foundational Boolean structures, syllogisms, and propositional statements.',
      iconName: 'Brain',
      color: CATEGORY_COLORS['Logic & Strategy'].color,
      x: 58.5,
      y: 45.0,
      parentIds: ['core-nexus'],
    },
    {
      id: 'log-2',
      name: 'Invariant Verification',
      shortName: 'Invariant Check',
      discipline: 'Logic & Algorithmic Strategy',
      category: 'Logic & Strategy',
      tier: 1,
      requiredThresholds: [{ domain: 'Logic & Strategy', threshold: 28 }],
      isUnlocked: domainScores['Logic & Strategy'] >= 28,
      progressPercent: Math.min(100, Math.round((domainScores['Logic & Strategy'] / 28) * 100)),
      contributingTeams: getContributingTeamsFor(['Logic & Strategy'], 28),
      buff: '+18% Edge-case detection and contradiction prevention across state transitions',
      lore: 'Enforces invariant state guarantees and eliminates contradictory intermediate claims.',
      iconName: 'Target',
      color: CATEGORY_COLORS['Logic & Strategy'].color,
      x: 65.5,
      y: 38.0,
      parentIds: ['log-1'],
    },
    {
      id: 'log-3',
      name: 'Decision Space Exploration',
      shortName: 'Decision Space',
      discipline: 'Logic & Algorithmic Strategy',
      category: 'Logic & Strategy',
      tier: 2,
      requiredThresholds: [{ domain: 'Logic & Strategy', threshold: 46 }],
      isUnlocked: domainScores['Logic & Strategy'] >= 46,
      progressPercent: Math.min(100, Math.round((domainScores['Logic & Strategy'] / 46) * 100)),
      contributingTeams: getContributingTeamsFor(['Logic & Strategy'], 46),
      buff: '+24% Branch pruning efficiency and transition matrix pathfinding',
      lore: 'Navigates multi-branch option trees with heuristic pruning and state caching.',
      iconName: 'Compass',
      color: CATEGORY_COLORS['Logic & Strategy'].color,
      x: 74.0,
      y: 47.0,
      parentIds: ['log-2'],
    },
    {
      id: 'log-4',
      name: 'Minimax Game Theoretic Trees',
      shortName: 'Minimax Trees',
      discipline: 'Logic & Algorithmic Strategy',
      category: 'Logic & Strategy',
      tier: 3,
      requiredThresholds: [{ domain: 'Logic & Strategy', threshold: 64 }],
      isUnlocked: domainScores['Logic & Strategy'] >= 64,
      progressPercent: Math.min(100, Math.round((domainScores['Logic & Strategy'] / 64) * 100)),
      contributingTeams: getContributingTeamsFor(['Logic & Strategy'], 64),
      buff: '+30% Equilibrium convergence speed and adversarial payoff optimization',
      lore: 'Calculates Nash equilibria, subgame perfect strategies, and adversarial payoff grids.',
      iconName: 'Zap',
      color: CATEGORY_COLORS['Logic & Strategy'].color,
      x: 78.5,
      y: 35.0,
      parentIds: ['log-3'],
    },
    {
      id: 'log-5',
      name: 'Strategic Reasoning & Proofs',
      shortName: 'Strategic Engine',
      discipline: 'Logic & Algorithmic Strategy',
      category: 'Logic & Strategy',
      tier: 3,
      requiredThresholds: [{ domain: 'Logic & Strategy', threshold: 80 }],
      isUnlocked: domainScores['Logic & Strategy'] >= 80,
      progressPercent: Math.min(100, Math.round((domainScores['Logic & Strategy'] / 80) * 100)),
      contributingTeams: getContributingTeamsFor(['Logic & Strategy'], 80),
      buff: '+38% Deductive clarity in high-complexity constraint satisfaction problems',
      lore: 'Executes long-horizon deductive reasoning with verifiable proof logs.',
      iconName: 'CheckCircle',
      color: CATEGORY_COLORS['Logic & Strategy'].color,
      x: 86.5,
      y: 52.0,
      parentIds: ['log-4'],
    },
    {
      id: 'log-6',
      name: 'Autonomous Formal Prover',
      shortName: 'Formal Prover',
      discipline: 'Logic & Algorithmic Strategy',
      category: 'Logic & Strategy',
      tier: 4,
      requiredThresholds: [{ domain: 'Logic & Strategy', threshold: 95 }],
      isUnlocked: domainScores['Logic & Strategy'] >= 95,
      progressPercent: Math.min(100, Math.round((domainScores['Logic & Strategy'] / 95) * 100)),
      contributingTeams: getContributingTeamsFor(['Logic & Strategy'], 95),
      buff: '+45% Machine-checked formal verification across complex axiomatic spaces',
      lore: 'Generates mathematically rigorous formal proofs immune to logical fallacies.',
      iconName: 'Crown',
      color: CATEGORY_COLORS['Logic & Strategy'].color,
      x: 92.5,
      y: 34.0,
      parentIds: ['log-5'],
      isMajorNode: true,
    },

    // --- Coding & Tech Domain Sector (Bottom-Right Sector) ---
    {
      id: 'cod-1',
      name: 'Syntactic Scaffolding',
      shortName: 'Syntax & Types',
      discipline: 'Software & Systems Engineering',
      category: 'Coding & Tech',
      tier: 1,
      requiredThresholds: [{ domain: 'Coding & Tech', threshold: 12 }],
      isUnlocked: domainScores['Coding & Tech'] >= 12,
      progressPercent: Math.min(100, Math.round((domainScores['Coding & Tech'] / 12) * 100)),
      contributingTeams: getContributingTeamsFor(['Coding & Tech'], 12),
      buff: '+10% Type-safe interfaces and syntactically clean module structures',
      lore: 'Establishes boilerplate-free signatures, static typing, and schema declarations.',
      iconName: 'Code',
      color: CATEGORY_COLORS['Coding & Tech'].color,
      x: 56.5,
      y: 59.0,
      parentIds: ['core-nexus'],
    },
    {
      id: 'cod-2',
      name: 'Algorithmic Synthesis',
      shortName: 'Algo Synthesis',
      discipline: 'Software & Systems Engineering',
      category: 'Coding & Tech',
      tier: 1,
      requiredThresholds: [{ domain: 'Coding & Tech', threshold: 28 }],
      isUnlocked: domainScores['Coding & Tech'] >= 28,
      progressPercent: Math.min(100, Math.round((domainScores['Coding & Tech'] / 28) * 100)),
      contributingTeams: getContributingTeamsFor(['Coding & Tech'], 28),
      buff: '+18% Complexity reduction and algorithmic efficiency in data structures',
      lore: 'Constructs optimal sorting, tree-indexing, and dynamic programming implementations.',
      iconName: 'Cpu',
      color: CATEGORY_COLORS['Coding & Tech'].color,
      x: 63.5,
      y: 64.0,
      parentIds: ['cod-1'],
    },
    {
      id: 'cod-3',
      name: 'Concurrent Pipelines & Workers',
      shortName: 'Concurrency',
      discipline: 'Software & Systems Engineering',
      category: 'Coding & Tech',
      tier: 2,
      requiredThresholds: [{ domain: 'Coding & Tech', threshold: 46 }],
      isUnlocked: domainScores['Coding & Tech'] >= 46,
      progressPercent: Math.min(100, Math.round((domainScores['Coding & Tech'] / 46) * 100)),
      contributingTeams: getContributingTeamsFor(['Coding & Tech'], 46),
      buff: '+24% Asynchronous event loop throughput and deadlock-free worker queues',
      lore: 'Coordinates thread-safe conduits, streaming buffers, and non-blocking I/O routines.',
      iconName: 'Activity',
      color: CATEGORY_COLORS['Coding & Tech'].color,
      x: 69.5,
      y: 73.5,
      parentIds: ['cod-2'],
    },
    {
      id: 'cod-4',
      name: 'Distributed Systems & State',
      shortName: 'Distributed Systems',
      discipline: 'Software & Systems Engineering',
      category: 'Coding & Tech',
      tier: 3,
      requiredThresholds: [{ domain: 'Coding & Tech', threshold: 64 }],
      isUnlocked: domainScores['Coding & Tech'] >= 64,
      progressPercent: Math.min(100, Math.round((domainScores['Coding & Tech'] / 64) * 100)),
      contributingTeams: getContributingTeamsFor(['Coding & Tech'], 64),
      buff: '+30% Resilient distributed state coordination and network consensus',
      lore: 'Designs distributed Raft nodes, idempotent RPC channels, and crash-resilient storage.',
      iconName: 'Network',
      color: CATEGORY_COLORS['Coding & Tech'].color,
      x: 80.0,
      y: 76.5,
      parentIds: ['cod-3'],
    },
    {
      id: 'cod-5',
      name: 'Production Reliability & SWE-bench',
      shortName: 'Production Reliability',
      discipline: 'Software & Systems Engineering',
      category: 'Coding & Tech',
      tier: 3,
      requiredThresholds: [{ domain: 'Coding & Tech', threshold: 80 }],
      isUnlocked: domainScores['Coding & Tech'] >= 80,
      progressPercent: Math.min(100, Math.round((domainScores['Coding & Tech'] / 80) * 100)),
      contributingTeams: getContributingTeamsFor(['Coding & Tech'], 80),
      buff: '+38% First-pass test pass rate and self-healing error boundary recovery',
      lore: 'Ensures zero-regression builds with automated unit tests and fault-tolerant guards.',
      iconName: 'CheckCircle',
      color: CATEGORY_COLORS['Coding & Tech'].color,
      x: 65.5,
      y: 87.5,
      parentIds: ['cod-4'],
    },
    {
      id: 'cod-6',
      name: 'Kernel & Bare-Metal Architecture',
      shortName: 'Kernel Architecture',
      discipline: 'Software & Systems Engineering',
      category: 'Coding & Tech',
      tier: 4,
      requiredThresholds: [{ domain: 'Coding & Tech', threshold: 95 }],
      isUnlocked: domainScores['Coding & Tech'] >= 95,
      progressPercent: Math.min(100, Math.round((domainScores['Coding & Tech'] / 95) * 100)),
      contributingTeams: getContributingTeamsFor(['Coding & Tech'], 95),
      buff: '+45% Low-level SIMD vectorization and zero-copy memory pipelines',
      lore: 'Optimizes assembly, custom memory allocators, and high-performance kernel drivers.',
      iconName: 'Crown',
      color: CATEGORY_COLORS['Coding & Tech'].color,
      x: 84.5,
      y: 91.5,
      parentIds: ['cod-5'],
      isMajorNode: true,
    },

    // --- Humanities & Law Domain Sector (Bottom-Left Sector) ---
    {
      id: 'hum-1',
      name: 'Linguistic Nuance',
      shortName: 'Linguistics',
      discipline: 'Language, Law & Ethics',
      category: 'Humanities & Law',
      tier: 1,
      requiredThresholds: [{ domain: 'Humanities & Law', threshold: 12 }],
      isUnlocked: domainScores['Humanities & Law'] >= 12,
      progressPercent: Math.min(100, Math.round((domainScores['Humanities & Law'] / 12) * 100)),
      contributingTeams: getContributingTeamsFor(['Humanities & Law'], 12),
      buff: '+10% Subtle tone calibration and register consistency across contexts',
      lore: 'Parses nuanced linguistic semantics, tone modulations, and cultural metaphors.',
      iconName: 'BookOpen',
      color: CATEGORY_COLORS['Humanities & Law'].color,
      x: 44.0,
      y: 57.5,
      parentIds: ['core-nexus'],
    },
    {
      id: 'hum-2',
      name: 'Semantic Precision & Constraints',
      shortName: 'Semantic Precision',
      discipline: 'Language, Law & Ethics',
      category: 'Humanities & Law',
      tier: 1,
      requiredThresholds: [{ domain: 'Humanities & Law', threshold: 28 }],
      isUnlocked: domainScores['Humanities & Law'] >= 28,
      progressPercent: Math.min(100, Math.round((domainScores['Humanities & Law'] / 28) * 100)),
      contributingTeams: getContributingTeamsFor(['Humanities & Law'], 28),
      buff: '+18% Strict adherence to fine-grained negative constraints and formatting rules',
      lore: 'Eliminates prompt drift and strictly satisfies complex negative instruction rules.',
      iconName: 'FileText',
      color: CATEGORY_COLORS['Humanities & Law'].color,
      x: 37.5,
      y: 65.5,
      parentIds: ['hum-1'],
    },
    {
      id: 'hum-3',
      name: 'Policy & Compliance Analysis',
      shortName: 'Policy Analysis',
      discipline: 'Language, Law & Ethics',
      category: 'Humanities & Law',
      tier: 2,
      requiredThresholds: [{ domain: 'Humanities & Law', threshold: 46 }],
      isUnlocked: domainScores['Humanities & Law'] >= 46,
      progressPercent: Math.min(100, Math.round((domainScores['Humanities & Law'] / 46) * 100)),
      contributingTeams: getContributingTeamsFor(['Humanities & Law'], 46),
      buff: '+24% Regulatory synthesis and governance framework auditing',
      lore: 'Audits deliverables against industry compliance standards and institutional mandates.',
      iconName: 'Scale',
      color: CATEGORY_COLORS['Humanities & Law'].color,
      x: 25.5,
      y: 71.0,
      parentIds: ['hum-2'],
    },
    {
      id: 'hum-4',
      name: 'Statutory Jurisprudence',
      shortName: 'Jurisprudence',
      discipline: 'Language, Law & Ethics',
      category: 'Humanities & Law',
      tier: 3,
      requiredThresholds: [{ domain: 'Humanities & Law', threshold: 64 }],
      isUnlocked: domainScores['Humanities & Law'] >= 64,
      progressPercent: Math.min(100, Math.round((domainScores['Humanities & Law'] / 64) * 100)),
      contributingTeams: getContributingTeamsFor(['Humanities & Law'], 64),
      buff: '+30% Statutory interpretation and contractual clause verification',
      lore: 'Analyzes legal precedent, contract clauses, and multilateral treaties with rigor.',
      iconName: 'ShieldAlert',
      color: CATEGORY_COLORS['Humanities & Law'].color,
      x: 41.5,
      y: 77.5,
      parentIds: ['hum-3'],
    },
    {
      id: 'hum-5',
      name: 'Ethical Constitutionalism',
      shortName: 'Ethical Reasoning',
      discipline: 'Language, Law & Ethics',
      category: 'Humanities & Law',
      tier: 3,
      requiredThresholds: [{ domain: 'Humanities & Law', threshold: 80 }],
      isUnlocked: domainScores['Humanities & Law'] >= 80,
      progressPercent: Math.min(100, Math.round((domainScores['Humanities & Law'] / 80) * 100)),
      contributingTeams: getContributingTeamsFor(['Humanities & Law'], 80),
      buff: '+38% Value alignment, safety bounds, and multi-stakeholder consensus',
      lore: 'Harmonizes complex ethical trade-offs into balanced, universally accountable outputs.',
      iconName: 'CheckCircle',
      color: CATEGORY_COLORS['Humanities & Law'].color,
      x: 19.5,
      y: 83.5,
      parentIds: ['hum-4'],
    },
    {
      id: 'hum-6',
      name: 'Global Governance & Policy Synthesis',
      shortName: 'Global Governance',
      discipline: 'Language, Law & Ethics',
      category: 'Humanities & Law',
      tier: 4,
      requiredThresholds: [{ domain: 'Humanities & Law', threshold: 95 }],
      isUnlocked: domainScores['Humanities & Law'] >= 95,
      progressPercent: Math.min(100, Math.round((domainScores['Humanities & Law'] / 95) * 100)),
      contributingTeams: getContributingTeamsFor(['Humanities & Law'], 95),
      buff: '+45% Authoritative executive drafting and treaty-level resolution clarity',
      lore: 'Synthesizes multifaceted policy perspectives into cohesive international resolutions.',
      iconName: 'Crown',
      color: CATEGORY_COLORS['Humanities & Law'].color,
      x: 13.5,
      y: 91.5,
      parentIds: ['hum-5'],
      isMajorNode: true,
    },

    // --- General Reasoning Domain Sector (Top-Left Sector) ---
    {
      id: 'rea-1',
      name: 'Task Decomposition',
      shortName: 'Decomposition',
      discipline: 'General Reasoning & Synthesis',
      category: 'General Reasoning',
      tier: 1,
      requiredThresholds: [{ domain: 'General Reasoning', threshold: 12 }],
      isUnlocked: domainScores['General Reasoning'] >= 12,
      progressPercent: Math.min(100, Math.round((domainScores['General Reasoning'] / 12) * 100)),
      contributingTeams: getContributingTeamsFor(['General Reasoning'], 12),
      buff: '+10% Speed in breaking complex instructions into modular sub-tasks',
      lore: 'Deconstructs ambiguous requirements into clear, verifiable linear checkpoints.',
      iconName: 'Compass',
      color: CATEGORY_COLORS['General Reasoning'].color,
      x: 42.5,
      y: 46.5,
      parentIds: ['core-nexus'],
    },
    {
      id: 'rea-2',
      name: 'Causal Inference & Tracing',
      shortName: 'Causal Tracing',
      discipline: 'General Reasoning & Synthesis',
      category: 'General Reasoning',
      tier: 1,
      requiredThresholds: [{ domain: 'General Reasoning', threshold: 28 }],
      isUnlocked: domainScores['General Reasoning'] >= 28,
      progressPercent: Math.min(100, Math.round((domainScores['General Reasoning'] / 28) * 100)),
      contributingTeams: getContributingTeamsFor(['General Reasoning'], 28),
      buff: '+18% Root cause identification and dependency graph traversal',
      lore: 'Traces causal chains and eliminates spurious correlations during problem analysis.',
      iconName: 'Eye',
      color: CATEGORY_COLORS['General Reasoning'].color,
      x: 34.0,
      y: 44.0,
      parentIds: ['rea-1'],
    },
    {
      id: 'rea-3',
      name: 'Analogical Mapping',
      shortName: 'Analogical Transfer',
      discipline: 'General Reasoning & Synthesis',
      category: 'General Reasoning',
      tier: 2,
      requiredThresholds: [{ domain: 'General Reasoning', threshold: 46 }],
      isUnlocked: domainScores['General Reasoning'] >= 46,
      progressPercent: Math.min(100, Math.round((domainScores['General Reasoning'] / 46) * 100)),
      contributingTeams: getContributingTeamsFor(['General Reasoning'], 46),
      buff: '+24% Cross-domain pattern transfer and conceptual mapping',
      lore: 'Identifies structural isomorphisms across unrelated domains to transfer proven solutions.',
      iconName: 'Layers',
      color: CATEGORY_COLORS['General Reasoning'].color,
      x: 19.5,
      y: 49.5,
      parentIds: ['rea-2'],
    },
    {
      id: 'rea-4',
      name: 'Hypothesis Elimination & Abduction',
      shortName: 'Abductive Inference',
      discipline: 'General Reasoning & Synthesis',
      category: 'General Reasoning',
      tier: 3,
      requiredThresholds: [{ domain: 'General Reasoning', threshold: 64 }],
      isUnlocked: domainScores['General Reasoning'] >= 64,
      progressPercent: Math.min(100, Math.round((domainScores['General Reasoning'] / 64) * 100)),
      contributingTeams: getContributingTeamsFor(['General Reasoning'], 64),
      buff: '+30% Bayesian belief updating and counter-hypothesis elimination',
      lore: 'Systematically rejects competing hypotheses based on empirical evidence weighting.',
      iconName: 'Target',
      color: CATEGORY_COLORS['General Reasoning'].color,
      x: 29.5,
      y: 33.5,
      parentIds: ['rea-3'],
    },
    {
      id: 'rea-5',
      name: 'Swarm Consensus Convergence',
      shortName: 'Consensus Arbiter',
      discipline: 'General Reasoning & Synthesis',
      category: 'General Reasoning',
      tier: 3,
      requiredThresholds: [{ domain: 'General Reasoning', threshold: 80 }],
      isUnlocked: domainScores['General Reasoning'] >= 80,
      progressPercent: Math.min(100, Math.round((domainScores['General Reasoning'] / 80) * 100)),
      contributingTeams: getContributingTeamsFor(['General Reasoning'], 80),
      buff: '+38% Multi-model reconciliation and collective intelligence convergence',
      lore: 'Synthesizes conflicting agent outputs into unified, high-confidence consensus solutions.',
      iconName: 'CheckCircle',
      color: CATEGORY_COLORS['General Reasoning'].color,
      x: 14.5,
      y: 40.0,
      parentIds: ['rea-4'],
    },
    {
      id: 'rea-6',
      name: 'Autonomous Meta-Reasoning',
      shortName: 'Meta-Reasoning',
      discipline: 'General Reasoning & Synthesis',
      category: 'General Reasoning',
      tier: 4,
      requiredThresholds: [{ domain: 'General Reasoning', threshold: 95 }],
      isUnlocked: domainScores['General Reasoning'] >= 95,
      progressPercent: Math.min(100, Math.round((domainScores['General Reasoning'] / 95) * 100)),
      contributingTeams: getContributingTeamsFor(['General Reasoning'], 95),
      buff: '+45% Recursive self-reflection, self-correction, and cognitive orchestration',
      lore: 'Autonomous self-monitoring and strategic plan correction across long execution chains.',
      iconName: 'Crown',
      color: CATEGORY_COLORS['General Reasoning'].color,
      x: 7.5,
      y: 34.0,
      parentIds: ['rea-5'],
      isMajorNode: true,
    },

    // --- INTER-DISCIPLINARY HYBRID CAPABILITY WEBS (Infilling the spaces between adjacent sectors) ---
    {
      id: 'hyb-cyber-physicist',
      name: 'Computational Physics & Modeling',
      shortName: 'Computational Physics',
      discipline: 'Science & Engineering Integration',
      category: 'Hybrid',
      tier: 4,
      requiredThresholds: [
        { domain: 'Science & STEM', threshold: 64 },
        { domain: 'Coding & Tech', threshold: 64 },
      ],
      isUnlocked: domainScores['Science & STEM'] >= 64 && domainScores['Coding & Tech'] >= 64,
      progressPercent: Math.min(
        100,
        Math.round(((domainScores['Science & STEM'] + domainScores['Coding & Tech']) / (64 * 2)) * 100)
      ),
      contributingTeams: getContributingTeamsFor(['Science & STEM', 'Coding & Tech'], 64),
      buff: '+32% High-performance scientific computing and numerical simulation efficiency',
      lore: 'Combines computational mathematics and scientific modeling with systems engineering to accelerate numerical workflows.',
      iconName: 'Activity',
      color: '#38bdf8',
      x: 66.0,
      y: 26.0,
      parentIds: ['sci-4', 'log-2'],
      isMajorNode: true,
    },
    {
      id: 'hyb-juris-logician',
      name: 'Formal Verification & Compliance',
      shortName: 'Formal Compliance',
      discipline: 'Logic & Policy Integration',
      category: 'Hybrid',
      tier: 4,
      requiredThresholds: [
        { domain: 'Logic & Strategy', threshold: 64 },
        { domain: 'Humanities & Law', threshold: 64 },
      ],
      isUnlocked: domainScores['Logic & Strategy'] >= 64 && domainScores['Humanities & Law'] >= 64,
      progressPercent: Math.min(
        100,
        Math.round(((domainScores['Logic & Strategy'] + domainScores['Humanities & Law']) / (64 * 2)) * 100)
      ),
      contributingTeams: getContributingTeamsFor(['Logic & Strategy', 'Humanities & Law'], 64),
      buff: '+30% Formally verified policy compliance and contractual constraint proofs',
      lore: 'Bridges mathematical logic verification with legal and policy frameworks to guarantee compliance.',
      iconName: 'ShieldAlert',
      color: '#d946ef',
      x: 76.5,
      y: 58.5,
      parentIds: ['log-3', 'cod-2'],
    },
    {
      id: 'hyb-systems-architect',
      name: 'Distributed Systems Architecture',
      shortName: 'Systems Architecture',
      discipline: 'Engineering & Strategic Reasoning',
      category: 'Hybrid',
      tier: 4,
      requiredThresholds: [
        { domain: 'Coding & Tech', threshold: 64 },
        { domain: 'General Reasoning', threshold: 64 },
      ],
      isUnlocked: domainScores['Coding & Tech'] >= 64 && domainScores['General Reasoning'] >= 64,
      progressPercent: Math.min(
        100,
        Math.round(((domainScores['Coding & Tech'] + domainScores['General Reasoning']) / (64 * 2)) * 100)
      ),
      contributingTeams: getContributingTeamsFor(['Coding & Tech', 'General Reasoning'], 64),
      buff: '+34% Resilient state machine coordination and distributed execution',
      lore: 'Fuses high-level system design with low-level execution concurrency for fault-tolerant operation.',
      iconName: 'Network',
      color: '#10b981',
      x: 50.0,
      y: 81.0,
      parentIds: ['cod-3', 'hum-4'],
      isMajorNode: true,
    },
    {
      id: 'hyb-quantum-ethicist',
      name: 'STEM Ethics & Bio-Jurisprudence',
      shortName: 'Bio-Jurisprudence',
      discipline: 'Science & Humanities Integration',
      category: 'Hybrid',
      tier: 4,
      requiredThresholds: [
        { domain: 'Science & STEM', threshold: 64 },
        { domain: 'Humanities & Law', threshold: 64 },
      ],
      isUnlocked: domainScores['Science & STEM'] >= 64 && domainScores['Humanities & Law'] >= 64,
      progressPercent: Math.min(
        100,
        Math.round(((domainScores['Science & STEM'] + domainScores['Humanities & Law']) / (64 * 2)) * 100)
      ),
      contributingTeams: getContributingTeamsFor(['Science & STEM', 'Humanities & Law'], 64),
      buff: '+32% Responsible empirical research alignment and bioethical compliance',
      lore: 'Harmonizes scientific advancements with ethical oversight and human safety boundaries.',
      iconName: 'Scale',
      color: '#f43f5e',
      x: 31.5,
      y: 25.0,
      parentIds: ['sci-3', 'rea-4'],
    },
    {
      id: 'hyb-strategic-architect',
      name: 'Strategic Reasoning & Game Architecture',
      shortName: 'Strategic Architecture',
      discipline: 'Logic & Reasoning Integration',
      category: 'Hybrid',
      tier: 4,
      requiredThresholds: [
        { domain: 'Logic & Strategy', threshold: 64 },
        { domain: 'General Reasoning', threshold: 64 },
      ],
      isUnlocked: domainScores['Logic & Strategy'] >= 64 && domainScores['General Reasoning'] >= 64,
      progressPercent: Math.min(
        100,
        Math.round(((domainScores['Logic & Strategy'] + domainScores['General Reasoning']) / (64 * 2)) * 100)
      ),
      contributingTeams: getContributingTeamsFor(['Logic & Strategy', 'General Reasoning'], 64),
      buff: '+34% Multi-horizon strategy planning and autonomous goal decomposition',
      lore: 'Synthesizes game-theoretic minimax trees with holistic multi-stage task decomposition.',
      iconName: 'Compass',
      color: '#a855f7',
      x: 23.0,
      y: 61.5,
      parentIds: ['rea-3', 'hum-2'],
    },
    {
      id: 'hyb-legendary-sovereign',
      name: 'Universal Swarm Sovereign Core',
      shortName: 'Sovereign Core',
      discipline: 'Full-Spectrum Capability Integration',
      tier: 5,
      category: 'Hybrid',
      requiredThresholds: [
        { domain: 'Science & STEM', threshold: 75 },
        { domain: 'Logic & Strategy', threshold: 75 },
        { domain: 'Coding & Tech', threshold: 75 },
        { domain: 'Humanities & Law', threshold: 75 },
        { domain: 'General Reasoning', threshold: 75 },
      ],
      isUnlocked:
        domainScores['Science & STEM'] >= 75 &&
        domainScores['Logic & Strategy'] >= 75 &&
        domainScores['Coding & Tech'] >= 75 &&
        domainScores['Humanities & Law'] >= 75 &&
        domainScores['General Reasoning'] >= 75,
      progressPercent: Math.min(
        100,
        Math.round(
          ((domainScores['Science & STEM'] +
            domainScores['Logic & Strategy'] +
            domainScores['Coding & Tech'] +
            domainScores['Humanities & Law'] +
            domainScores['General Reasoning']) /
            (75 * 5)) *
            100
        )
      ),
      contributingTeams: getContributingTeamsFor(RADAR_CATEGORIES as any, 75),
      buff: '+50% End-to-end task execution across all cognitive and technical domains',
      lore: 'Coordinates specialized models across STEM, logic, software, policy, and reasoning into a cohesive multi-agent swarm.',
      iconName: 'Flame',
      color: '#facc15',
      x: 50,
      y: 50,
      parentIds: ['core-nexus'],
      isMajorNode: true,
    },
  ];

  // Calculate active hybrid matches for informative display
  const activeHybridMatches: MergedSwarmRadarData['activeHybridMatches'] = [];

  if (domainScores['Science & STEM'] >= 65 && domainScores['Coding & Tech'] >= 65) {
    activeHybridMatches.push({
      title: 'STEM + Code Fusion',
      domains: ['Science & STEM', 'Coding & Tech'],
      description: 'Combines deep mathematical physics modeling with clean concurrency architecture.',
      contributingTeams: getContributingTeamsFor(['Science & STEM', 'Coding & Tech'], 65),
    });
  }

  if (domainScores['Logic & Strategy'] >= 65 && domainScores['Humanities & Law'] >= 65) {
    activeHybridMatches.push({
      title: 'Logic + Jurisprudence Pairing',
      domains: ['Logic & Strategy', 'Humanities & Law'],
      description: 'Pairs formal game-theoretic invariance checks with ethical constraint auditing.',
      contributingTeams: getContributingTeamsFor(['Logic & Strategy', 'Humanities & Law'], 65),
    });
  }

  if (domainScores['Coding & Tech'] >= 65 && domainScores['General Reasoning'] >= 65) {
    activeHybridMatches.push({
      title: 'Engineering + Synthesis Alignment',
      domains: ['Coding & Tech', 'General Reasoning'],
      description: 'Merges full-stack software production with multi-turn autonomous consensus.',
      contributingTeams: getContributingTeamsFor(['Coding & Tech', 'General Reasoning'], 65),
    });
  }

  const unlockedPerksCount = perks.filter((p) => p.isUnlocked).length;
  const avgScore = Math.round(
    Object.values(domainScores).reduce((a, b) => a + b, 0) / RADAR_CATEGORIES.length
  );
  const swarmLevel = Math.max(1, Math.round((avgScore / 100) * 80) + unlockedPerksCount * 3);

  return {
    teams: teamEntries,
    mergedEnvelope,
    swarmLevel,
    unlockedPerksCount,
    totalPerksCount: perks.length,
    perks,
    activeHybridMatches,
  };
}

export interface NodeTeamRecommendation {
  nodeId: string;
  primaryAlphaId: string;
  primaryBetaId: string;
  freeAlphaId: string;
  freeBetaId: string;
  teamLabel: string;
  rationale: string;
  recommendedRoleAlpha: string;
  recommendedRoleBeta: string;
}

export const NODE_RECOMMENDATIONS: Record<string, NodeTeamRecommendation> = {
  // --- Science & STEM Measuring Nodes ---
  'sci-1': {
    nodeId: 'sci-1',
    primaryAlphaId: 'gemini-3.7-flash',
    primaryBetaId: 'claude-3-7-sonnet',
    freeAlphaId: 'gemini-2.5-flash-free',
    freeBetaId: 'qwen-2.5-72b-free',
    teamLabel: 'Empirical Science Unit (12 pts)',
    rationale: 'Calibrates unit metrics and rapid empirical data ingestion with verified precision.',
    recommendedRoleAlpha: 'Empirical Modeler',
    recommendedRoleBeta: 'Unit & Metric Auditor',
  },
  'sci-2': {
    nodeId: 'sci-2',
    primaryAlphaId: 'deepseek-r1',
    primaryBetaId: 'claude-3-7-sonnet',
    freeAlphaId: 'deepseek-r1-free',
    freeBetaId: 'llama-3.3-70b-free',
    teamLabel: 'Measurable STEM Unit (28 pts)',
    rationale: 'Executes structured algebraic transformations, chemical stoichiometry, and variance metrics.',
    recommendedRoleAlpha: 'Quantitative Analyst',
    recommendedRoleBeta: 'Numerical Auditor',
  },
  'sci-3': {
    nodeId: 'sci-3',
    primaryAlphaId: 'deepseek-r1',
    primaryBetaId: 'gemini-3.7-flash',
    freeAlphaId: 'deepseek-r1-free',
    freeBetaId: 'gemini-2.5-flash-free',
    teamLabel: 'Calculus & Dynamics Lab (46 pts)',
    rationale: 'Solves multivariable differential rate problems, thermodynamic orbits, and kinetics vector fields.',
    recommendedRoleAlpha: 'Differential Kinetics Lead',
    recommendedRoleBeta: 'Vector Calculation Specialist',
  },
  'sci-4': {
    nodeId: 'sci-4',
    primaryAlphaId: 'deepseek-r1',
    primaryBetaId: 'claude-3-7-sonnet',
    freeAlphaId: 'deepseek-r1-free',
    freeBetaId: 'qwen-2.5-72b-free',
    teamLabel: 'Quantum Electrodynamics Cell (64 pts)',
    rationale: 'Tackles quantum wave equations, Hamiltonian matrix computations, and atomic perturbations.',
    recommendedRoleAlpha: 'Quantum Physicist',
    recommendedRoleBeta: 'Hamiltonian Auditor',
  },
  'sci-5': {
    nodeId: 'sci-5',
    primaryAlphaId: 'deepseek-r1',
    primaryBetaId: 'gemini-3.7-flash',
    freeAlphaId: 'deepseek-r1-free',
    freeBetaId: 'gemini-2.5-flash-free',
    teamLabel: 'First-Principles Taskforce (80 pts)',
    rationale: 'Anchors complex multi-stage physical derivations in foundational conservation laws.',
    recommendedRoleAlpha: 'First-Principles Physicist',
    recommendedRoleBeta: 'Conservation Invariant Lead',
  },
  'sci-6': {
    nodeId: 'sci-6',
    primaryAlphaId: 'deepseek-r1',
    primaryBetaId: 'claude-3-7-sonnet',
    freeAlphaId: 'deepseek-r1-free',
    freeBetaId: 'qwen-2.5-72b-free',
    teamLabel: 'Grand Unified Theoretical Core (95 pts)',
    rationale: 'Peak frontier mastery of relativistic field theory and grand unified theoretical derivations.',
    recommendedRoleAlpha: 'Singular Theoretical Lead',
    recommendedRoleBeta: 'Axiomatic Field Arbiter',
  },

  // --- Logic & Strategy Measuring Nodes ---
  'log-1': {
    nodeId: 'log-1',
    primaryAlphaId: 'claude-3-7-sonnet',
    primaryBetaId: 'deepseek-r1',
    freeAlphaId: 'qwen-2.5-72b-free',
    freeBetaId: 'deepseek-r1-free',
    teamLabel: 'Propositional Foundations (12 pts)',
    rationale: 'Verifies Boolean truth tables, predicate satisfiability, and syllogistic structures.',
    recommendedRoleAlpha: 'Propositional Logician',
    recommendedRoleBeta: 'Truth Table Validator',
  },
  'log-2': {
    nodeId: 'log-2',
    primaryAlphaId: 'claude-3-7-sonnet',
    primaryBetaId: 'deepseek-r1',
    freeAlphaId: 'qwen-2.5-72b-free',
    freeBetaId: 'deepseek-r1-free',
    teamLabel: 'Invariant Verification Squad (28 pts)',
    rationale: 'Enforces strict consistency bounds across finite state machines and logic constraints.',
    recommendedRoleAlpha: 'Formal Methods Engineer',
    recommendedRoleBeta: 'Adversarial Edge Auditor',
  },
  'log-3': {
    nodeId: 'log-3',
    primaryAlphaId: 'deepseek-r1',
    primaryBetaId: 'qwen-2.5-72b',
    freeAlphaId: 'deepseek-r1-free',
    freeBetaId: 'qwen-2.5-72b-free',
    teamLabel: 'Decision Space Explorer (46 pts)',
    rationale: 'Explores multi-branch decision trees with heuristic pruning and state caching.',
    recommendedRoleAlpha: 'State Space Navigator',
    recommendedRoleBeta: 'Branch Pruning Specialist',
  },
  'log-4': {
    nodeId: 'log-4',
    primaryAlphaId: 'deepseek-r1',
    primaryBetaId: 'gpt-4o',
    freeAlphaId: 'deepseek-r1-free',
    freeBetaId: 'llama-3.3-70b-free',
    teamLabel: 'Minimax Game Theoretic Lab (64 pts)',
    rationale: 'Traverses deep minimax game trees and payoff matrices to guarantee optimal equilibria.',
    recommendedRoleAlpha: 'Game Theoretic Strategist',
    recommendedRoleBeta: 'Equilibrium Arbiter',
  },
  'log-5': {
    nodeId: 'log-5',
    primaryAlphaId: 'gpt-4o',
    primaryBetaId: 'deepseek-r1',
    freeAlphaId: 'llama-3.3-70b-free',
    freeBetaId: 'deepseek-r1-free',
    teamLabel: 'Strategic Reasoning Group (80 pts)',
    rationale: 'Synthesizes long-horizon planning with deductive clarity in complex constraint spaces.',
    recommendedRoleAlpha: 'Strategic Planner',
    recommendedRoleBeta: 'Deductive Proof Engine',
  },
  'log-6': {
    nodeId: 'log-6',
    primaryAlphaId: 'deepseek-r1',
    primaryBetaId: 'claude-3-7-sonnet',
    freeAlphaId: 'deepseek-r1-free',
    freeBetaId: 'qwen-2.5-72b-free',
    teamLabel: 'Autonomous Formal Prover (95 pts)',
    rationale: 'Generates automated machine-checkable formal mathematical proofs without logical fallacies.',
    recommendedRoleAlpha: 'Autonomous Proof Master',
    recommendedRoleBeta: 'Formal Verification Arbiter',
  },

  // --- Coding & Tech Measuring Nodes ---
  'cod-1': {
    nodeId: 'cod-1',
    primaryAlphaId: 'claude-3-7-sonnet',
    primaryBetaId: 'gpt-4o',
    freeAlphaId: 'qwen-2.5-72b-free',
    freeBetaId: 'llama-3.3-70b-free',
    teamLabel: 'Syntactic Scaffolding Core (12 pts)',
    rationale: 'Generates clean TypeScript/Rust interface contracts and modular code scaffolding.',
    recommendedRoleAlpha: 'Interface Architect',
    recommendedRoleBeta: 'Syntax Validator',
  },
  'cod-2': {
    nodeId: 'cod-2',
    primaryAlphaId: 'claude-3-7-sonnet',
    primaryBetaId: 'gpt-4o',
    freeAlphaId: 'qwen-2.5-72b-free',
    freeBetaId: 'llama-3.3-70b-free',
    teamLabel: 'Algorithmic Synthesis Core (28 pts)',
    rationale: 'Generates optimal algorithmic structures and computational routines with minimal memory overhead.',
    recommendedRoleAlpha: 'Lead Algorithm Engineer',
    recommendedRoleBeta: 'Code Optimization Auditor',
  },
  'cod-3': {
    nodeId: 'cod-3',
    primaryAlphaId: 'claude-3-7-sonnet',
    primaryBetaId: 'qwen-2.5-72b',
    freeAlphaId: 'qwen-2.5-72b-free',
    freeBetaId: 'mistral-small-free',
    teamLabel: 'Concurrent Systems Engine (46 pts)',
    rationale: 'Builds thread-safe asynchronous architectures, worker queues, and event-driven conduits.',
    recommendedRoleAlpha: 'Concurrency Architect',
    recommendedRoleBeta: 'Systems Integrity Specialist',
  },
  'cod-4': {
    nodeId: 'cod-4',
    primaryAlphaId: 'claude-3-7-sonnet',
    primaryBetaId: 'deepseek-r1',
    freeAlphaId: 'qwen-2.5-72b-free',
    freeBetaId: 'deepseek-r1-free',
    teamLabel: 'Distributed State & Raft Squad (64 pts)',
    rationale: 'Coordinates distributed consensus, resilient RPC channels, and crash-safe storage.',
    recommendedRoleAlpha: 'Distributed Systems Lead',
    recommendedRoleBeta: 'Consensus Protocol Engineer',
  },
  'cod-5': {
    nodeId: 'cod-5',
    primaryAlphaId: 'claude-3-7-sonnet',
    primaryBetaId: 'deepseek-r1',
    freeAlphaId: 'qwen-2.5-72b-free',
    freeBetaId: 'deepseek-r1-free',
    teamLabel: 'Production Reliability Brigade (80 pts)',
    rationale: 'Applies rigorous type safety, self-healing circuits, and end-to-end regression guarantees.',
    recommendedRoleAlpha: 'Principal Software Engineer',
    recommendedRoleBeta: 'SWE-bench Verification Lead',
  },
  'cod-6': {
    nodeId: 'cod-6',
    primaryAlphaId: 'claude-3-7-sonnet',
    primaryBetaId: 'deepseek-r1',
    freeAlphaId: 'qwen-2.5-72b-free',
    freeBetaId: 'deepseek-r1-free',
    teamLabel: 'Bare-Metal & Kernel Optimizer (95 pts)',
    rationale: 'Optimizes SIMD vectorized assembly, custom memory allocators, and kernel concurrency.',
    recommendedRoleAlpha: 'Bare-Metal Systems Master',
    recommendedRoleBeta: 'Kernel Optimization Specialist',
  },

  // --- Humanities & Law Measuring Nodes ---
  'hum-1': {
    nodeId: 'hum-1',
    primaryAlphaId: 'gpt-4o',
    primaryBetaId: 'claude-3-7-sonnet',
    freeAlphaId: 'llama-3.3-70b-free',
    freeBetaId: 'mistral-small-free',
    teamLabel: 'Linguistic Nuance Desk (12 pts)',
    rationale: 'Captures subtle contextual nuances, tone modulations, and stylistic register consistency.',
    recommendedRoleAlpha: 'Linguistic Stylist',
    recommendedRoleBeta: 'Tone Auditor',
  },
  'hum-2': {
    nodeId: 'hum-2',
    primaryAlphaId: 'gpt-4o',
    primaryBetaId: 'claude-3-7-sonnet',
    freeAlphaId: 'llama-3.3-70b-free',
    freeBetaId: 'mistral-small-free',
    teamLabel: 'Semantic Precision Guild (28 pts)',
    rationale: 'Strictly satisfies intricate negative constraints and exact formatting rules without hallucination.',
    recommendedRoleAlpha: 'Context & Tone Director',
    recommendedRoleBeta: 'Semantic Constraint Auditor',
  },
  'hum-3': {
    nodeId: 'hum-3',
    primaryAlphaId: 'gpt-4o',
    primaryBetaId: 'mistral-large-2',
    freeAlphaId: 'llama-3.3-70b-free',
    freeBetaId: 'mistral-small-free',
    teamLabel: 'Policy & Compliance Council (46 pts)',
    rationale: 'Audits multi-stakeholder requirements against governance frameworks and statutory regulations.',
    recommendedRoleAlpha: 'Jurisprudence Lead',
    recommendedRoleBeta: 'Compliance Inspector',
  },
  'hum-4': {
    nodeId: 'hum-4',
    primaryAlphaId: 'claude-3-7-sonnet',
    primaryBetaId: 'gpt-4o',
    freeAlphaId: 'llama-3.3-70b-free',
    freeBetaId: 'qwen-2.5-72b-free',
    teamLabel: 'Statutory Jurisprudence Chamber (64 pts)',
    rationale: 'Analyzes case law precedents, contractual ambiguity, and multilateral statutory directives.',
    recommendedRoleAlpha: 'Statutory Jurist',
    recommendedRoleBeta: 'Contractual Clause Arbiter',
  },
  'hum-5': {
    nodeId: 'hum-5',
    primaryAlphaId: 'claude-3-7-sonnet',
    primaryBetaId: 'gemini-3.7-flash',
    freeAlphaId: 'qwen-2.5-72b-free',
    freeBetaId: 'gemini-2.5-flash-free',
    teamLabel: 'Ethical Constitutionalism Board (80 pts)',
    rationale: 'Balances multi-stakeholder ethical trade-offs, safety bounds, and global institutional alignment.',
    recommendedRoleAlpha: 'Constitutional Safety Lead',
    recommendedRoleBeta: 'Ethical Value Arbiter',
  },
  'hum-6': {
    nodeId: 'hum-6',
    primaryAlphaId: 'claude-3-7-sonnet',
    primaryBetaId: 'gpt-4o',
    freeAlphaId: 'qwen-2.5-72b-free',
    freeBetaId: 'llama-3.3-70b-free',
    teamLabel: 'Global Governance Assembly (95 pts)',
    rationale: 'Synthesizes multifaceted policy perspectives into authoritative international resolutions.',
    recommendedRoleAlpha: 'Global Policy Dean',
    recommendedRoleBeta: 'Treaty Resolution Drafter',
  },

  // --- General Reasoning Measuring Nodes ---
  'rea-1': {
    nodeId: 'rea-1',
    primaryAlphaId: 'gemini-3.7-flash',
    primaryBetaId: 'claude-3-7-sonnet',
    freeAlphaId: 'gemini-2.5-flash-free',
    freeBetaId: 'qwen-2.5-72b-free',
    teamLabel: 'Problem Decomposition Unit (12 pts)',
    rationale: 'Breaks complex multi-faceted prompts into cleanly separated, actionable execution stages.',
    recommendedRoleAlpha: 'Decomposition Strategist',
    recommendedRoleBeta: 'Modular Execution Planner',
  },
  'rea-2': {
    nodeId: 'rea-2',
    primaryAlphaId: 'gemini-3.7-flash',
    primaryBetaId: 'claude-3-7-sonnet',
    freeAlphaId: 'gemini-2.5-flash-free',
    freeBetaId: 'llama-3.3-70b-free',
    teamLabel: 'Causal Inference Bureau (28 pts)',
    rationale: 'Traces causal dependency graphs and isolates root causes from confounding correlations.',
    recommendedRoleAlpha: 'Causal Dependency Analyst',
    recommendedRoleBeta: 'Root Cause Investigator',
  },
  'rea-3': {
    nodeId: 'rea-3',
    primaryAlphaId: 'claude-3-7-sonnet',
    primaryBetaId: 'gpt-4o',
    freeAlphaId: 'llama-3.3-70b-free',
    freeBetaId: 'qwen-2.5-72b-free',
    teamLabel: 'Analogical Reasoning Circle (46 pts)',
    rationale: 'Maps isomorphic solution patterns across disparate domains for rapid cross-pollination.',
    recommendedRoleAlpha: 'Conceptual Architect',
    recommendedRoleBeta: 'Cross-Domain Mapper',
  },
  'rea-4': {
    nodeId: 'rea-4',
    primaryAlphaId: 'deepseek-r1',
    primaryBetaId: 'gemini-3.7-flash',
    freeAlphaId: 'deepseek-r1-free',
    freeBetaId: 'gemini-2.5-flash-free',
    teamLabel: 'Abductive Inference Core (64 pts)',
    rationale: 'Performs Bayesian hypothesis elimination to isolate the most coherent structural explanation.',
    recommendedRoleAlpha: 'Abductive Hypothesis Master',
    recommendedRoleBeta: 'Bayesian Evidence Auditor',
  },
  'rea-5': {
    nodeId: 'rea-5',
    primaryAlphaId: 'gemini-3.7-flash',
    primaryBetaId: 'deepseek-r1',
    freeAlphaId: 'gemini-2.5-flash-free',
    freeBetaId: 'deepseek-r1-free',
    teamLabel: 'Swarm Consensus Convergence (80 pts)',
    rationale: 'Harmonizes multi-agent deliberations into high-confidence consensus decisions.',
    recommendedRoleAlpha: 'Swarm Orchestrator',
    recommendedRoleBeta: 'Consensus Arbiter',
  },
  'rea-6': {
    nodeId: 'rea-6',
    primaryAlphaId: 'gemini-3.7-flash',
    primaryBetaId: 'claude-3-7-sonnet',
    freeAlphaId: 'gemini-2.5-flash-free',
    freeBetaId: 'deepseek-r1-free',
    teamLabel: 'Autonomous Meta-Reasoning Engine (95 pts)',
    rationale: 'Recursive self-monitoring, self-correction, and cognitive orchestration over long tasks.',
    recommendedRoleAlpha: 'Meta-Cognitive Architect',
    recommendedRoleBeta: 'Recursive Self-Correction Lead',
  },

  // --- Cross-Discipline Hybrids ---
  'hyb-cyber-physicist': {
    nodeId: 'hyb-cyber-physicist',
    primaryAlphaId: 'deepseek-r1',
    primaryBetaId: 'claude-3-7-sonnet',
    freeAlphaId: 'deepseek-r1-free',
    freeBetaId: 'qwen-2.5-72b-free',
    teamLabel: 'Computational Physics Division',
    rationale: 'Fuses mathematical physics modeling with high-performance concurrency engineering.',
    recommendedRoleAlpha: 'Computational Physicist',
    recommendedRoleBeta: 'Systems Engine Lead',
  },
  'hyb-juris-logician': {
    nodeId: 'hyb-juris-logician',
    primaryAlphaId: 'deepseek-r1',
    primaryBetaId: 'gpt-4o',
    freeAlphaId: 'deepseek-r1-free',
    freeBetaId: 'llama-3.3-70b-free',
    teamLabel: 'Formal Verification & Compliance',
    rationale: 'Bridges formal deductive proofs with regulatory and ethical governance frameworks.',
    recommendedRoleAlpha: 'Formal Logician',
    recommendedRoleBeta: 'Governance Arbiter',
  },
  'hyb-systems-architect': {
    nodeId: 'hyb-systems-architect',
    primaryAlphaId: 'claude-3-7-sonnet',
    primaryBetaId: 'llama-3.3-70b',
    freeAlphaId: 'qwen-2.5-72b-free',
    freeBetaId: 'llama-3.3-70b-free',
    teamLabel: 'Distributed Systems Architect',
    rationale: 'Blends production-grade distributed concurrency with broad cross-domain synthesis.',
    recommendedRoleAlpha: 'Principal Systems Architect',
    recommendedRoleBeta: 'Resilience Specialist',
  },
  'hyb-quantum-ethicist': {
    nodeId: 'hyb-quantum-ethicist',
    primaryAlphaId: 'claude-3-7-sonnet',
    primaryBetaId: 'deepseek-r1',
    freeAlphaId: 'llama-3.3-70b-free',
    freeBetaId: 'deepseek-r1-free',
    teamLabel: 'Bio-Jurisprudence & Science Ethics',
    rationale: 'Harmonizes frontier empirical science breakthroughs with bioethical safeguards.',
    recommendedRoleAlpha: 'Bioethical Lead',
    recommendedRoleBeta: 'Empirical Alignment Auditor',
  },
  'hyb-strategic-architect': {
    nodeId: 'hyb-strategic-architect',
    primaryAlphaId: 'deepseek-r1',
    primaryBetaId: 'gemini-3.7-flash',
    freeAlphaId: 'deepseek-r1-free',
    freeBetaId: 'gemini-2.5-flash-free',
    teamLabel: 'Strategic Game Architecture',
    rationale: 'Pairs game-theoretic minimax trees with multi-turn autonomous goal decomposition.',
    recommendedRoleAlpha: 'Strategic Game Theorist',
    recommendedRoleBeta: 'Goal Decomposition Lead',
  },
  'hyb-legendary-sovereign': {
    nodeId: 'hyb-legendary-sovereign',
    primaryAlphaId: 'gemini-3.7-flash',
    primaryBetaId: 'claude-3-7-sonnet',
    freeAlphaId: 'gemini-2.5-flash-free',
    freeBetaId: 'deepseek-r1-free',
    teamLabel: 'Universal Swarm Sovereign Vanguard',
    rationale: 'Delivers full-spectrum intelligence across STEM, Logic, Software, Policy, and Reasoning.',
    recommendedRoleAlpha: 'Swarm Commander (Alpha)',
    recommendedRoleBeta: 'Swarm Sovereign (Beta)',
  },
};

export function getNodeRecommendedTeam(nodeId: string, isFreeOnly = false): NodeTeamRecommendation {
  const rec = NODE_RECOMMENDATIONS[nodeId] || NODE_RECOMMENDATIONS['hyb-legendary-sovereign'];
  if (isFreeOnly) {
    return {
      ...rec,
      primaryAlphaId: rec.freeAlphaId || rec.primaryAlphaId,
      primaryBetaId: rec.freeBetaId || rec.primaryBetaId,
    };
  }
  return rec;
}
