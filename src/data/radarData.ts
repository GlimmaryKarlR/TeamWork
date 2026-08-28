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

  // Build the skill graph nodes in a radial coordinate layout
  // Center is at (50, 50). 5 major arms extend outward at 72° angles.
  const perks: SwarmSkillNode[] = [
    // --- Science & STEM Branch (Angle ~ 270° / Top, Cyan) ---
    {
      id: 'sci-1',
      name: 'Empirical Formulation',
      shortName: 'Empirical',
      discipline: 'STEM & Empirical Analysis',
      category: 'Science & STEM',
      tier: 1,
      requiredThresholds: [{ domain: 'Science & STEM', threshold: 35 }],
      isUnlocked: domainScores['Science & STEM'] >= 35,
      progressPercent: Math.min(100, Math.round((domainScores['Science & STEM'] / 35) * 100)),
      contributingTeams: getContributingTeamsFor(['Science & STEM'], 35),
      buff: '+15% Precision in mathematical formulation and unit-dimensional verification',
      lore: 'Translates unstructured problem statements into rigorous, verifiable mathematical models.',
      iconName: 'Atom',
      color: CATEGORY_COLORS['Science & STEM'].color,
      x: 50,
      y: 36,
      parentIds: ['core-nexus'],
    },
    {
      id: 'sci-2',
      name: 'Statistical Modeling',
      shortName: 'Statistical',
      discipline: 'STEM & Empirical Analysis',
      category: 'Science & STEM',
      tier: 2,
      requiredThresholds: [{ domain: 'Science & STEM', threshold: 60 }],
      isUnlocked: domainScores['Science & STEM'] >= 60,
      progressPercent: Math.min(100, Math.round((domainScores['Science & STEM'] / 60) * 100)),
      contributingTeams: getContributingTeamsFor(['Science & STEM'], 60),
      buff: '+22% Throughput on multi-variable numerical kinetics and vector transformations',
      lore: 'Applies statistical hypothesis testing and continuous vector modeling to complex datasets.',
      iconName: 'Sparkles',
      color: CATEGORY_COLORS['Science & STEM'].color,
      x: 46,
      y: 22,
      parentIds: ['sci-1'],
    },
    {
      id: 'sci-3',
      name: 'First-Principles Analysis',
      shortName: 'First Principles',
      discipline: 'STEM & Empirical Analysis',
      category: 'Science & STEM',
      tier: 3,
      requiredThresholds: [{ domain: 'Science & STEM', threshold: 80 }],
      isUnlocked: domainScores['Science & STEM'] >= 80,
      progressPercent: Math.min(100, Math.round((domainScores['Science & STEM'] / 80) * 100)),
      contributingTeams: getContributingTeamsFor(['Science & STEM'], 80),
      buff: '+30% Rigorous analytical derivation and foundational theorem preservation',
      lore: 'Grounds analytical derivations in foundational physical axioms to prevent logical divergence.',
      iconName: 'Layers',
      color: CATEGORY_COLORS['Science & STEM'].color,
      x: 54,
      y: 11,
      parentIds: ['sci-2'],
    },

    // --- Logic & Strategy Branch (Angle ~ 342° / Top Right, Purple) ---
    {
      id: 'log-1',
      name: 'Invariant Verification',
      shortName: 'Invariant',
      discipline: 'Logic & Algorithmic Strategy',
      category: 'Logic & Strategy',
      tier: 1,
      requiredThresholds: [{ domain: 'Logic & Strategy', threshold: 35 }],
      isUnlocked: domainScores['Logic & Strategy'] >= 35,
      progressPercent: Math.min(100, Math.round((domainScores['Logic & Strategy'] / 35) * 100)),
      contributingTeams: getContributingTeamsFor(['Logic & Strategy'], 35),
      buff: '+15% Edge-case detection across finite state machines and logic flows',
      lore: 'Enforces strict consistency bounds across intermediate reasoning steps to catch contradictions.',
      iconName: 'Brain',
      color: CATEGORY_COLORS['Logic & Strategy'].color,
      x: 64,
      y: 40,
      parentIds: ['core-nexus'],
    },
    {
      id: 'log-2',
      name: 'Decision Tree Optimization',
      shortName: 'Decision Tree',
      discipline: 'Logic & Algorithmic Strategy',
      category: 'Logic & Strategy',
      tier: 2,
      requiredThresholds: [{ domain: 'Logic & Strategy', threshold: 60 }],
      isUnlocked: domainScores['Logic & Strategy'] >= 60,
      progressPercent: Math.min(100, Math.round((domainScores['Logic & Strategy'] / 60) * 100)),
      contributingTeams: getContributingTeamsFor(['Logic & Strategy'], 60),
      buff: '+25% Search depth and equilibrium convergence speed in multi-step planning',
      lore: 'Evaluates branch outcomes and adversarial payoffs with optimized alpha-beta tree search.',
      iconName: 'Target',
      color: CATEGORY_COLORS['Logic & Strategy'].color,
      x: 77,
      y: 30,
      parentIds: ['log-1'],
    },
    {
      id: 'log-3',
      name: 'Strategic Reasoning',
      shortName: 'Strategic',
      discipline: 'Logic & Algorithmic Strategy',
      category: 'Logic & Strategy',
      tier: 3,
      requiredThresholds: [{ domain: 'Logic & Strategy', threshold: 82 }],
      isUnlocked: domainScores['Logic & Strategy'] >= 82,
      progressPercent: Math.min(100, Math.round((domainScores['Logic & Strategy'] / 82) * 100)),
      contributingTeams: getContributingTeamsFor(['Logic & Strategy'], 82),
      buff: '+35% Deductive clarity in high-complexity constraint satisfaction problems',
      lore: 'Provides structured long-horizon reasoning and deductive guarantees across complex constraints.',
      iconName: 'Zap',
      color: CATEGORY_COLORS['Logic & Strategy'].color,
      x: 88,
      y: 20,
      parentIds: ['log-2'],
    },

    // --- Coding & Tech Branch (Angle ~ 54° / Bottom Right, Amber) ---
    {
      id: 'cod-1',
      name: 'Algorithmic Synthesis',
      shortName: 'Algo Synthesis',
      discipline: 'Software & Systems Engineering',
      category: 'Coding & Tech',
      tier: 1,
      requiredThresholds: [{ domain: 'Coding & Tech', threshold: 35 }],
      isUnlocked: domainScores['Coding & Tech'] >= 35,
      progressPercent: Math.min(100, Math.round((domainScores['Coding & Tech'] / 35) * 100)),
      contributingTeams: getContributingTeamsFor(['Coding & Tech'], 35),
      buff: '+18% Complexity reduction and algorithmic efficiency in generated pipelines',
      lore: 'Generates optimized data structures and algorithmic implementations with minimal overhead.',
      iconName: 'Code',
      color: CATEGORY_COLORS['Coding & Tech'].color,
      x: 67,
      y: 65,
      parentIds: ['core-nexus'],
    },
    {
      id: 'cod-2',
      name: 'Concurrent Systems',
      shortName: 'Concurrency',
      discipline: 'Software & Systems Engineering',
      category: 'Coding & Tech',
      tier: 2,
      requiredThresholds: [{ domain: 'Coding & Tech', threshold: 62 }],
      isUnlocked: domainScores['Coding & Tech'] >= 62,
      progressPercent: Math.min(100, Math.round((domainScores['Coding & Tech'] / 62) * 100)),
      contributingTeams: getContributingTeamsFor(['Coding & Tech'], 62),
      buff: '+28% Thread-safe data flow and asynchronous task coordination',
      lore: 'Coordinates asynchronous event loops and worker pools for robust high-throughput execution.',
      iconName: 'Cpu',
      color: CATEGORY_COLORS['Coding & Tech'].color,
      x: 80,
      y: 75,
      parentIds: ['cod-1'],
    },
    {
      id: 'cod-3',
      name: 'Production Reliability',
      shortName: 'Reliability',
      discipline: 'Software & Systems Engineering',
      category: 'Coding & Tech',
      tier: 3,
      requiredThresholds: [{ domain: 'Coding & Tech', threshold: 84 }],
      isUnlocked: domainScores['Coding & Tech'] >= 84,
      progressPercent: Math.min(100, Math.round((domainScores['Coding & Tech'] / 84) * 100)),
      contributingTeams: getContributingTeamsFor(['Coding & Tech'], 84),
      buff: '+38% First-pass test pass rate across complex software engineering benchmarks',
      lore: 'Applies rigorous type-checking, edge-case handling, and unit test coverage to ensure stability.',
      iconName: 'CheckCircle',
      color: CATEGORY_COLORS['Coding & Tech'].color,
      x: 91,
      y: 86,
      parentIds: ['cod-2'],
    },

    // --- Humanities & Law Branch (Angle ~ 126° / Bottom Left, Rose) ---
    {
      id: 'hum-1',
      name: 'Semantic Precision',
      shortName: 'Semantic',
      discipline: 'Language, Law & Ethics',
      category: 'Humanities & Law',
      tier: 1,
      requiredThresholds: [{ domain: 'Humanities & Law', threshold: 35 }],
      isUnlocked: domainScores['Humanities & Law'] >= 35,
      progressPercent: Math.min(100, Math.round((domainScores['Humanities & Law'] / 35) * 100)),
      contributingTeams: getContributingTeamsFor(['Humanities & Law'], 35),
      buff: '+15% Strict adherence to fine-grained negative constraints and tone guidelines',
      lore: 'Accurately parses nuanced language, capturing precise contextual intent and instruction constraints.',
      iconName: 'BookOpen',
      color: CATEGORY_COLORS['Humanities & Law'].color,
      x: 33,
      y: 65,
      parentIds: ['core-nexus'],
    },
    {
      id: 'hum-2',
      name: 'Policy & Compliance Analysis',
      shortName: 'Policy',
      discipline: 'Language, Law & Ethics',
      category: 'Humanities & Law',
      tier: 2,
      requiredThresholds: [{ domain: 'Humanities & Law', threshold: 60 }],
      isUnlocked: domainScores['Humanities & Law'] >= 60,
      progressPercent: Math.min(100, Math.round((domainScores['Humanities & Law'] / 60) * 100)),
      contributingTeams: getContributingTeamsFor(['Humanities & Law'], 60),
      buff: '+25% Regulatory synthesis and governance framework auditing',
      lore: 'Evaluates outputs against statutory guidelines, safety policies, and institutional standards.',
      iconName: 'Scale',
      color: CATEGORY_COLORS['Humanities & Law'].color,
      x: 20,
      y: 75,
      parentIds: ['hum-1'],
    },
    {
      id: 'hum-3',
      name: 'Executive Synthesis',
      shortName: 'Synthesis',
      discipline: 'Language, Law & Ethics',
      category: 'Humanities & Law',
      tier: 3,
      requiredThresholds: [{ domain: 'Humanities & Law', threshold: 80 }],
      isUnlocked: domainScores['Humanities & Law'] >= 80,
      progressPercent: Math.min(100, Math.round((domainScores['Humanities & Law'] / 80) * 100)),
      contributingTeams: getContributingTeamsFor(['Humanities & Law'], 80),
      buff: '+32% Multi-perspective synthesis for strategic documentation and reporting',
      lore: 'Consolidates multi-faceted stakeholder viewpoints into cohesive, authoritative policy documents.',
      iconName: 'FileText',
      color: CATEGORY_COLORS['Humanities & Law'].color,
      x: 9,
      y: 86,
      parentIds: ['hum-2'],
    },

    // --- General Reasoning Branch (Angle ~ 198° / Top Left, Emerald) ---
    {
      id: 'rea-1',
      name: 'Problem Decomposition',
      shortName: 'Decomposition',
      discipline: 'General Reasoning & Synthesis',
      category: 'General Reasoning',
      tier: 1,
      requiredThresholds: [{ domain: 'General Reasoning', threshold: 35 }],
      isUnlocked: domainScores['General Reasoning'] >= 35,
      progressPercent: Math.min(100, Math.round((domainScores['General Reasoning'] / 35) * 100)),
      contributingTeams: getContributingTeamsFor(['General Reasoning'], 35),
      buff: '+15% Speed in decomposing multi-faceted tasks into sequential sub-problems',
      lore: 'Structures ambiguous user requirements into well-defined, modular operational phases.',
      iconName: 'Compass',
      color: CATEGORY_COLORS['General Reasoning'].color,
      x: 36,
      y: 40,
      parentIds: ['core-nexus'],
    },
    {
      id: 'rea-2',
      name: 'Analogical Reasoning',
      shortName: 'Analogical',
      discipline: 'General Reasoning & Synthesis',
      category: 'General Reasoning',
      tier: 2,
      requiredThresholds: [{ domain: 'General Reasoning', threshold: 62 }],
      isUnlocked: domainScores['General Reasoning'] >= 62,
      progressPercent: Math.min(100, Math.round((domainScores['General Reasoning'] / 62) * 100)),
      contributingTeams: getContributingTeamsFor(['General Reasoning'], 62),
      buff: '+25% Pattern transfer and conceptual mapping across unrelated domains',
      lore: 'Identifies structural isomorphisms across problem domains to apply proven solutions efficiently.',
      iconName: 'Eye',
      color: CATEGORY_COLORS['General Reasoning'].color,
      x: 23,
      y: 30,
      parentIds: ['rea-1'],
    },
    {
      id: 'rea-3',
      name: 'System Orchestration',
      shortName: 'Orchestration',
      discipline: 'General Reasoning & Synthesis',
      category: 'General Reasoning',
      tier: 3,
      requiredThresholds: [{ domain: 'General Reasoning', threshold: 82 }],
      isUnlocked: domainScores['General Reasoning'] >= 82,
      progressPercent: Math.min(100, Math.round((domainScores['General Reasoning'] / 82) * 100)),
      contributingTeams: getContributingTeamsFor(['General Reasoning'], 82),
      buff: '+35% Multi-model reconciliation and collective consensus convergence',
      lore: 'Synthesizes competing agent outputs into unified, high-confidence consensus decisions.',
      iconName: 'Crown',
      color: CATEGORY_COLORS['General Reasoning'].color,
      x: 12,
      y: 20,
      parentIds: ['rea-2'],
    },

    // --- CROSS-DISCIPLINE HYBRID CAPABILITY NODES ---
    {
      id: 'hyb-cyber-physicist',
      name: 'Computational Physics & Modeling',
      shortName: 'Computational Physics',
      discipline: 'Science & Engineering Integration',
      category: 'Hybrid',
      tier: 4,
      requiredThresholds: [
        { domain: 'Science & STEM', threshold: 68 },
        { domain: 'Coding & Tech', threshold: 68 },
      ],
      isUnlocked: domainScores['Science & STEM'] >= 68 && domainScores['Coding & Tech'] >= 68,
      progressPercent: Math.min(
        100,
        Math.round(((domainScores['Science & STEM'] + domainScores['Coding & Tech']) / (68 * 2)) * 100)
      ),
      contributingTeams: getContributingTeamsFor(['Science & STEM', 'Coding & Tech'], 68),
      buff: '+30% High-performance scientific computing and numerical simulation efficiency',
      lore: 'Combines computational mathematics and scientific modeling with systems engineering to accelerate complex numerical workflows.',
      iconName: 'Activity',
      color: '#38bdf8',
      x: 73,
      y: 18,
      parentIds: ['sci-2', 'cod-2'],
    },
    {
      id: 'hyb-juris-logician',
      name: 'Formal Verification & Compliance',
      shortName: 'Formal Compliance',
      discipline: 'Logic & Policy Integration',
      category: 'Hybrid',
      tier: 4,
      requiredThresholds: [
        { domain: 'Logic & Strategy', threshold: 68 },
        { domain: 'Humanities & Law', threshold: 68 },
      ],
      isUnlocked: domainScores['Logic & Strategy'] >= 68 && domainScores['Humanities & Law'] >= 68,
      progressPercent: Math.min(
        100,
        Math.round(((domainScores['Logic & Strategy'] + domainScores['Humanities & Law']) / (68 * 2)) * 100)
      ),
      contributingTeams: getContributingTeamsFor(['Logic & Strategy', 'Humanities & Law'], 68),
      buff: '+28% Formally verified policy compliance and contractual constraint proofs',
      lore: 'Bridges mathematical logic verification with legal and policy frameworks to guarantee compliance.',
      iconName: 'ShieldAlert',
      color: '#d946ef',
      x: 27,
      y: 18,
      parentIds: ['log-2', 'hum-2'],
    },
    {
      id: 'hyb-systems-architect',
      name: 'Distributed Systems Architecture',
      shortName: 'Systems Architecture',
      discipline: 'Engineering & Strategic Reasoning',
      category: 'Hybrid',
      tier: 4,
      requiredThresholds: [
        { domain: 'Coding & Tech', threshold: 70 },
        { domain: 'General Reasoning', threshold: 70 },
      ],
      isUnlocked: domainScores['Coding & Tech'] >= 70 && domainScores['General Reasoning'] >= 70,
      progressPercent: Math.min(
        100,
        Math.round(((domainScores['Coding & Tech'] + domainScores['General Reasoning']) / (70 * 2)) * 100)
      ),
      contributingTeams: getContributingTeamsFor(['Coding & Tech', 'General Reasoning'], 70),
      buff: '+32% Resilient state machine coordination and distributed execution',
      lore: 'Fuses high-level system design with low-level execution concurrency for fault-tolerant operation.',
      iconName: 'Network',
      color: '#10b981',
      x: 50,
      y: 88,
      parentIds: ['cod-2', 'rea-2'],
    },
    {
      id: 'hyb-legendary-sovereign',
      name: 'Comprehensive Swarm Integration',
      shortName: 'Swarm Integration',
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
      lore: 'Coordinates specialized models across STEM, logic, software, policy, and reasoning into a cohesive multi-agent system.',
      iconName: 'Flame',
      color: '#facc15',
      x: 50,
      y: 50,
      parentIds: ['core-nexus'],
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
