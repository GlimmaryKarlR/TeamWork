import { bucketChallengeType } from './radarData';

export interface RawBenchmarkRun {
  problemId?: string;
  problemTitle?: string;
  topic?: string;
  domain?: string;
  category?: string;
  difficulty?: string;
  agentAConfig?: {
    brand?: string;
    name?: string;
    model?: string;
    provider?: string;
  };
  agentBConfig?: {
    brand?: string;
    name?: string;
    model?: string;
    provider?: string;
  };
  metrics?: {
    efficiencyIndex?: number;
    accuracyScore?: number;
    totalTokens?: number;
    totalWallClockMs?: number;
  };
  verification?: {
    accuracyScore?: number;
  };
}

// User-provided benchmark run logs (regularly updated)
export const RAW_BENCHMARK_RUNS: RawBenchmarkRun[] = [
  {
    problemId: "mmlu-pro-01",
    problemTitle: "Relativistic Carnot Engine Efficiency with Heat Exchange",
    topic: "science",
    domain: "Physics & Thermodynamics",
    agentAConfig: { brand: "NVIDIA", name: "Agent Alpha (NVIDIA: Nemotron 3 Nano 30B A3B)", model: "tencent/hy-mt2-30b-a3b" },
    agentBConfig: { brand: "NVIDIA", name: "Agent Beta (NVIDIA: Nemotron 3 Nano 30B A3B)", model: "tencent/hy-mt2-30b-a3b" },
    metrics: { efficiencyIndex: 137.3, accuracyScore: 100, totalTokens: 1477, totalWallClockMs: 4931 }
  },
  {
    problemId: "strategy-01",
    problemTitle: "The 21-Token Subtraction Game (Nim Variant)",
    topic: "strategy",
    agentAConfig: { brand: "Amazon", name: "Agent Alpha", model: "amazon/nova-lite-v1" },
    agentBConfig: { brand: "Amazon", name: "Agent Beta", model: "amazon/nova-lite-v1" },
    metrics: { efficiencyIndex: 112.2, accuracyScore: 100, totalTokens: 2080, totalWallClockMs: 4285 }
  },
  {
    problemId: "mmlu-pro-01",
    problemTitle: "Relativistic Carnot Engine Efficiency with Heat Exchange",
    topic: "science",
    domain: "Physics & Thermodynamics",
    agentAConfig: { brand: "NVIDIA", model: "tencent/hy-mt2-30b-a3b" },
    agentBConfig: { brand: "NVIDIA", model: "tencent/hy-mt2-30b-a3b" },
    metrics: { efficiencyIndex: 106.56, accuracyScore: 100, totalTokens: 1454, totalWallClockMs: 6454 }
  },
  {
    problemId: "logic-01",
    problemTitle: "Cheryl’s Birthday Deductive Gridlock",
    topic: "logic",
    agentAConfig: { brand: "Google", model: "gemini-2.5-flash" },
    agentBConfig: { brand: "Google", model: "gemini-2.5-flash" },
    metrics: { efficiencyIndex: 82.96, accuracyScore: 100, totalTokens: 410, totalWallClockMs: 2940 }
  },
  {
    problemId: "strategy-01",
    problemTitle: "The 21-Token Subtraction Game (Nim Variant)",
    topic: "strategy",
    domain: "Combinatorial Nim Variants",
    agentAConfig: { brand: "DeepSeek", model: "deepseek/deepseek-chat:free" },
    agentBConfig: { brand: "Google", model: "google/gemma-2-9b-it:free" },
    metrics: { efficiencyIndex: 58.44, accuracyScore: 100, totalTokens: 1911, totalWallClockMs: 8955 }
  },
  {
    problemId: "strat-01",
    problemTitle: "Three-Duelist Truel Optimization",
    topic: "strategy",
    agentAConfig: { brand: "Google", model: "gemini-2.5-flash" },
    agentBConfig: { brand: "Google", model: "gemini-2.5-flash" },
    metrics: { efficiencyIndex: 50.34, accuracyScore: 100, totalTokens: 520, totalWallClockMs: 3820 }
  },
  {
    problemId: "logic-01",
    problemTitle: "The 3-Jug Decanting Optimization",
    topic: "logic",
    agentAConfig: { brand: "Anthropic", model: "anthropic-claude-3-haiku" },
    agentBConfig: { brand: "Anthropic", model: "anthropic-claude-3-haiku" },
    metrics: { efficiencyIndex: 43.02, accuracyScore: 100, totalTokens: 2423, totalWallClockMs: 9594 }
  },
  {
    problemId: "logic-03",
    problemTitle: "The Three Mislabelled Fruit Crates",
    topic: "logic",
    domain: "Deductive Elimination",
    agentAConfig: { brand: "OpenRouter", model: "openrouter/free" },
    agentBConfig: { brand: "Google", model: "google/gemini-2.0-flash-exp:free" },
    metrics: { efficiencyIndex: 41.5, accuracyScore: 100, totalTokens: 2356, totalWallClockMs: 10227 }
  },
  {
    problemId: "mmlu-pro-01",
    problemTitle: "Relativistic Carnot Engine Efficiency with Heat Exchange",
    topic: "science",
    domain: "Physics & Thermodynamics",
    agentAConfig: { brand: "Poolside", model: "poolside/laguna-xs-2.1:free" },
    agentBConfig: { brand: "Google", model: "google/gemini-2.0-flash-exp:free" },
    metrics: { efficiencyIndex: 40.28, accuracyScore: 100, totalTokens: 2519, totalWallClockMs: 9856 }
  },
  {
    problemId: "swe-bench-01",
    problemTitle: "Lock-Free Ring Buffer Head-Tail Invariant & Capacity Calculation",
    topic: "coding",
    domain: "Software Engineering & Concurrency",
    agentAConfig: { brand: "Qwen", model: "qwen/qwen-2.5-coder-32b-instruct:free" },
    agentBConfig: { brand: "DeepSeek", model: "deepseek/deepseek-r1:free" },
    metrics: { efficiencyIndex: 39.68, accuracyScore: 100, totalTokens: 2216, totalWallClockMs: 11374 }
  },
  {
    problemId: "mmlu-pro-01",
    problemTitle: "Relativistic Carnot Engine Efficiency with Heat Exchange",
    topic: "science",
    domain: "Physics & Thermodynamics",
    agentAConfig: { brand: "MiniMax", model: "minimax/minimax-m3:free" },
    agentBConfig: { brand: "MiniMax", model: "minimax/minimax-m3:free" },
    metrics: { efficiencyIndex: 38.27, accuracyScore: 100, totalTokens: 2444, totalWallClockMs: 10692 }
  },
  {
    problemId: "mmlu-pro-01",
    problemTitle: "Relativistic Carnot Engine Efficiency with Heat Exchange",
    topic: "science",
    domain: "Physics & Thermodynamics",
    agentAConfig: { brand: "OpenAI", model: "openai/gpt-4o-mini" },
    agentBConfig: { brand: "NVIDIA", model: "tencent/hy-mt2-30b-a3b" },
    metrics: { efficiencyIndex: 36.58, accuracyScore: 100, totalTokens: 3001, totalWallClockMs: 9109 }
  },
  {
    problemId: "strategy-01",
    problemTitle: "The 21-Token Subtraction Game",
    topic: "strategy",
    domain: "Combinatorial Game Theory & Nim-Sum",
    agentAConfig: { brand: "Google", model: "gemini-3.7-flash" },
    agentBConfig: { brand: "Google", model: "gemini-3.7-flash" },
    metrics: { efficiencyIndex: 36.06, accuracyScore: 100, totalTokens: 2950, totalWallClockMs: 9400 }
  },
  {
    problemId: "math-aime-02",
    problemTitle: "Derangements of a 6-Element Permutation Set",
    topic: "math",
    domain: "Discrete Combinatorics",
    agentAConfig: { brand: "OpenRouter", model: "openrouter/free" },
    agentBConfig: { brand: "Google", model: "google/gemini-2.0-flash-exp:free" },
    metrics: { efficiencyIndex: 35.12, accuracyScore: 100, totalTokens: 2382, totalWallClockMs: 11953 }
  },
  {
    problemId: "math-aime-02",
    problemTitle: "Derangements of a 6-Element Permutation Set",
    topic: "math",
    domain: "Discrete Combinatorics",
    agentAConfig: { brand: "Google", model: "google/gemma-2-9b-it:free" },
    agentBConfig: { brand: "Mistral", model: "mistralai/mistral-small-24b-instruct-2501:free" },
    metrics: { efficiencyIndex: 29.65, accuracyScore: 100, totalTokens: 2182, totalWallClockMs: 15456 }
  },
  {
    problemId: "swe-bench-01",
    problemTitle: "Lock-Free Ring Buffer Head-Tail Invariant & Capacity Calculation",
    topic: "coding",
    domain: "Software Engineering & Concurrency",
    agentAConfig: { brand: "NVIDIA", model: "nvidia/llama-3.1-nemotron-70b-instruct:free" },
    agentBConfig: { brand: "Qwen", model: "qwen/qwen-2.5-72b-instruct:free" },
    metrics: { efficiencyIndex: 26.65, accuracyScore: 100, totalTokens: 2265, totalWallClockMs: 16567 }
  },
  {
    problemId: "logic-03",
    problemTitle: "The Three Mislabelled Fruit Crates",
    topic: "logic",
    domain: "Deductive Elimination",
    agentAConfig: { brand: "DeepSeek", model: "deepseek/deepseek-r1:free" },
    agentBConfig: { brand: "Google", model: "google/gemma-2-9b-it:free" },
    metrics: { efficiencyIndex: 26.35, accuracyScore: 100, totalTokens: 2520, totalWallClockMs: 15061 }
  },
  {
    problemId: "logic-03",
    problemTitle: "The Three Mislabelled Fruit Crates",
    topic: "logic",
    domain: "Deductive Elimination",
    agentAConfig: { brand: "DeepSeek", model: "deepseek/deepseek-chat:free" },
    agentBConfig: { brand: "Microsoft", model: "microsoft/phi-3-mini-128k-instruct:free" },
    metrics: { efficiencyIndex: 26.01, accuracyScore: 100, totalTokens: 2612, totalWallClockMs: 14721 }
  },
  {
    problemId: "mmlu-pro-01",
    problemTitle: "Relativistic Carnot Engine Efficiency with Heat Exchange",
    topic: "science",
    domain: "Physics & Thermodynamics",
    agentAConfig: { brand: "Poolside", model: "poolside/laguna-xs-2.1:free" },
    agentBConfig: { brand: "Qwen", model: "qwen/qwen-2.5-coder-32b-instruct:free" },
    metrics: { efficiencyIndex: 25.81, accuracyScore: 100, totalTokens: 3521, totalWallClockMs: 11004 }
  },
  {
    problemId: "strategy-02",
    problemTitle: "Cournot Duopoly Equilibrium Pricing",
    topic: "strategy",
    agentAConfig: { brand: "DeepSeek", model: "deepseek-deepseek-v3" },
    agentBConfig: { brand: "DeepSeek", model: "deepseek-deepseek-v3" },
    metrics: { efficiencyIndex: 25.65, accuracyScore: 100, totalTokens: 1934, totalWallClockMs: 20158 }
  },
  {
    problemId: "math-aime-02",
    problemTitle: "Derangements of a 6-Element Permutation Set",
    topic: "math",
    domain: "Combinatorics & Subfactorials",
    agentAConfig: { brand: "Google", model: "gemini-3.7-flash" },
    agentBConfig: { brand: "Anthropic", model: "claude-3-7-sonnet-20250219" },
    metrics: { efficiencyIndex: 24.93, accuracyScore: 100, totalTokens: 3400, totalWallClockMs: 11800 }
  },
  {
    problemId: "strategy-03",
    problemTitle: "Pirate Gold Division (5 Rational Pirates)",
    topic: "strategy",
    agentAConfig: { brand: "OpenAI", model: "gpt-4o" },
    agentBConfig: { brand: "OpenAI", model: "gpt-4o" },
    metrics: { efficiencyIndex: 24.18, accuracyScore: 100, totalTokens: 4811, totalWallClockMs: 8597 }
  },
  {
    problemId: "strategy-02",
    problemTitle: "Cournot Duopoly Equilibrium Pricing",
    topic: "strategy",
    agentAConfig: { brand: "Google", model: "google-gemini-3.7-flash" },
    agentBConfig: { brand: "Google", model: "google-gemini-3.7-flash" },
    metrics: { efficiencyIndex: 23.1, accuracyScore: 100, totalTokens: 3775, totalWallClockMs: 11466 }
  },
  {
    problemId: "abstract-04",
    problemTitle: "The Monty Hall Variant with 4 Doors and 2 Car Prizes",
    topic: "abstract",
    agentAConfig: { brand: "Google", model: "google-gemini-3.7-flash" },
    agentBConfig: { brand: "Google", model: "google-gemini-3.7-flash" },
    metrics: { efficiencyIndex: 22.79, accuracyScore: 100, totalTokens: 3567, totalWallClockMs: 12303 }
  },
  {
    problemId: "arc-challenge-01",
    problemTitle: "3x3 Matrix 90-Degree Orthogonal Rotation with Inversion Invariant",
    topic: "abstract",
    domain: "Visual Logic & Matrix Transformations",
    agentAConfig: { brand: "Google", model: "gemini-3.7-flash" },
    agentBConfig: { brand: "Anthropic", model: "claude-3-7-sonnet-20250219" },
    metrics: { efficiencyIndex: 22.22, accuracyScore: 100, totalTokens: 3600, totalWallClockMs: 12500 }
  },
  {
    problemId: "mmlu-pro-02",
    problemTitle: "Byzantine Agreement Quorum Intersection Invariant",
    topic: "science",
    domain: "Distributed Systems & Byzantine Fault Tolerance",
    agentAConfig: { brand: "Meta", model: "meta-llama/llama-3.3-70b-instruct:free" },
    agentBConfig: { brand: "Poolside", model: "poolside/laguna-xs-2.1:free" },
    metrics: { efficiencyIndex: 21.57, accuracyScore: 100, totalTokens: 2191, totalWallClockMs: 21157 }
  },
  {
    problemId: "swe-bench-01",
    problemTitle: "Lock-Free Ring Buffer Head-Tail Invariant & Capacity Calculation",
    topic: "coding",
    domain: "Software Engineering & Concurrency",
    agentAConfig: { brand: "Google", model: "google/gemma-2-9b-it:free" },
    agentBConfig: { brand: "CognitiveComputations", model: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free" },
    metrics: { efficiencyIndex: 21.52, accuracyScore: 100, totalTokens: 2262, totalWallClockMs: 20539 }
  },
  {
    problemId: "gpqa-diamond-02",
    problemTitle: "Competitive Enzyme Inhibition Apparent Km Ratio",
    topic: "science",
    domain: "Biochemistry & Michaelis-Menten Kinetics",
    agentAConfig: { brand: "Poolside", model: "poolside/laguna-s-2.1:free" },
    agentBConfig: { brand: "Google", model: "google/gemma-2-9b-it:free" },
    metrics: { efficiencyIndex: 20.86, accuracyScore: 100, totalTokens: 2311, totalWallClockMs: 20745 }
  },
  {
    problemId: "mmlu-pro-01",
    problemTitle: "Relativistic Carnot Engine Efficiency with Heat Exchange",
    topic: "science",
    domain: "Physics & Thermodynamics",
    agentAConfig: { brand: "OpenAI", model: "openai/gpt-4o-mini" },
    agentBConfig: { brand: "OpenAI", model: "openai/gpt-4o-mini" },
    metrics: { efficiencyIndex: 20.06, accuracyScore: 100, totalTokens: 3489, totalWallClockMs: 14290 }
  },
  {
    problemId: "swe-bench-01",
    problemTitle: "Lock-Free Ring Buffer Head-Tail Invariant & Capacity Calculation",
    topic: "coding",
    domain: "Software Engineering & Concurrency",
    agentAConfig: { brand: "Anthropic", model: "claude-3-7-sonnet-20250219" },
    agentBConfig: { brand: "Google", model: "gemini-3.7-flash" },
    metrics: { efficiencyIndex: 19.18, accuracyScore: 100, totalTokens: 3950, totalWallClockMs: 13200 }
  },
  {
    problemId: "ifeval-01",
    problemTitle: "Strict JSON Schema with Negative Word Constraints",
    topic: "instruction_following",
    domain: "Verifiable Instruction Following",
    agentAConfig: { brand: "Google", model: "google-gemini-3.7-flash" },
    agentBConfig: { brand: "Anthropic", model: "claude-3-7-sonnet-20250219" },
    metrics: { efficiencyIndex: 18.69, accuracyScore: 100, totalTokens: 3850, totalWallClockMs: 13900 }
  },
  {
    problemId: "gpqa-diamond-02",
    problemTitle: "Competitive Enzyme Inhibition Apparent Km Ratio",
    topic: "science",
    domain: "Biochemistry & Michaelis-Menten Kinetics",
    agentAConfig: { brand: "Qwen", model: "qwen/qwen-2.5-72b-instruct:free" },
    agentBConfig: { brand: "Mistral", model: "mistralai/mistral-7b-instruct:free" },
    metrics: { efficiencyIndex: 18.47, accuracyScore: 100, totalTokens: 4240, totalWallClockMs: 12772 }
  },
  {
    problemId: "mmlu-pro-01",
    problemTitle: "Relativistic Carnot Engine Efficiency with Heat Exchange",
    topic: "science",
    domain: "Physics & Thermodynamics",
    agentAConfig: { brand: "Google", model: "google-gemini-3.7-flash" },
    agentBConfig: { brand: "Anthropic", model: "claude-3-7-sonnet-20250219" },
    metrics: { efficiencyIndex: 18.42, accuracyScore: 100, totalTokens: 3820, totalWallClockMs: 14210 }
  },
  {
    problemId: "logic-02",
    problemTitle: "The Island of Knights, Knaves, and Spies",
    topic: "logic",
    domain: "Truth-Functional Logic & Case Exhaustion",
    agentAConfig: { brand: "Anthropic", model: "claude-3-7-sonnet-20250219" },
    agentBConfig: { brand: "NVIDIA", model: "nvidia/nemotron-3-nano" },
    metrics: { efficiencyIndex: 16.89, accuracyScore: 100, totalTokens: 4200, totalWallClockMs: 14100 }
  },
  {
    problemId: "strategy-02",
    problemTitle: "Cournot Duopoly Equilibrium Pricing",
    topic: "strategy",
    domain: "Microeconomics & Nash Equilibria",
    agentAConfig: { brand: "Qwen", model: "qwen/qwen-2.5-72b-instruct" },
    agentBConfig: { brand: "Google", model: "gemini-3.7-flash" },
    metrics: { efficiencyIndex: 16.8, accuracyScore: 100, totalTokens: 4120, totalWallClockMs: 14448 }
  },
  {
    problemId: "strategy-02",
    problemTitle: "Cournot Duopoly Equilibrium Pricing",
    topic: "strategy",
    domain: "Oligopoly Pricing & Nash Equilibrium",
    agentAConfig: { brand: "Google", model: "google/gemma-2-9b-it:free" },
    agentBConfig: { brand: "Meta", model: "meta-llama/llama-3.3-70b-instruct:free" },
    metrics: { efficiencyIndex: 16.61, accuracyScore: 100, totalTokens: 2799, totalWallClockMs: 21507 }
  },
  {
    problemId: "swe-bench-01",
    problemTitle: "Lock-Free Ring Buffer Head-Tail Invariant & Capacity Calculation",
    topic: "coding",
    domain: "Software Engineering & Concurrency",
    agentAConfig: { brand: "Google", model: "google/gemini-2.0-flash-exp:free" },
    agentBConfig: { brand: "Mistral", model: "mistralai/mistral-7b-instruct:free" },
    metrics: { efficiencyIndex: 16.11, accuracyScore: 100, totalTokens: 3694, totalWallClockMs: 16807 }
  },
  {
    problemId: "strategy-02",
    problemTitle: "Cournot Duopoly Equilibrium Pricing",
    topic: "strategy",
    domain: "Oligopoly Pricing & Nash Equilibrium",
    agentAConfig: { brand: "Qwen", model: "qwen/qwen-2.5-72b-instruct:free" },
    agentBConfig: { brand: "Qwen", model: "qwen/qwq-32b:free" },
    metrics: { efficiencyIndex: 15.16, accuracyScore: 100, totalTokens: 2943, totalWallClockMs: 22409 }
  },
  {
    problemId: "strategy-01",
    problemTitle: "The 21-Token Subtraction Game (Nim Variant)",
    topic: "strategy",
    domain: "Combinatorial Nim Variants",
    agentAConfig: { brand: "Qwen", model: "qwen/qwen-2.5-72b-instruct:free" },
    agentBConfig: { brand: "CognitiveComputations", model: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free" },
    metrics: { efficiencyIndex: 15.13, accuracyScore: 100, totalTokens: 4257, totalWallClockMs: 15522 }
  },
  {
    problemId: "math-aime-02",
    problemTitle: "Derangements of a 6-Element Permutation Set",
    topic: "math",
    domain: "Discrete Combinatorics",
    agentAConfig: { brand: "Mistral", model: "mistralai/mistral-7b-instruct:free" },
    agentBConfig: { brand: "Poolside", model: "poolside/laguna-xs-2.1:free" },
    metrics: { efficiencyIndex: 14, accuracyScore: 100, totalTokens: 3102, totalWallClockMs: 23032 }
  },
  {
    problemId: "swe-bench-01",
    problemTitle: "Lock-Free Ring Buffer Head-Tail Invariant & Capacity Calculation",
    topic: "coding",
    domain: "Software Engineering & Concurrency",
    agentAConfig: { brand: "Qwen", model: "qwen/qwen-2.5-coder-32b-instruct:free" },
    agentBConfig: { brand: "Meta", model: "meta-llama/llama-3.1-8b-instruct:free" },
    metrics: { efficiencyIndex: 13.39, accuracyScore: 100, totalTokens: 2789, totalWallClockMs: 26785 }
  },
  {
    problemId: "swe-bench-02",
    problemTitle: "Sliding Window Maximum Monotonic Deque Amortized Time Complexity",
    topic: "coding",
    domain: "Algorithms & Invariants",
    agentAConfig: { brand: "Google", model: "google-gemini-3.7-flash" },
    agentBConfig: { brand: "OpenAI", model: "gpt-4.5-preview" },
    metrics: { efficiencyIndex: 13.18, accuracyScore: 100, totalTokens: 4800, totalWallClockMs: 15800 }
  },
  {
    problemId: "mmlu-pro-02",
    problemTitle: "Byzantine Agreement Quorum Intersection Invariant",
    topic: "science",
    domain: "Distributed Systems & Byzantine Fault Tolerance",
    agentAConfig: { brand: "DeepSeek", model: "deepseek-r1" },
    agentBConfig: { brand: "OpenAI", model: "o3-mini" },
    metrics: { efficiencyIndex: 12.28, accuracyScore: 100, totalTokens: 4920, totalWallClockMs: 16540 }
  },
  {
    problemId: "logic-04",
    problemTitle: "Strict Five-Person Seating Deduction",
    topic: "logic",
    domain: "Linear Constraint Satisfaction",
    agentAConfig: { brand: "Google", model: "google/gemini-2.0-flash-exp:free" },
    agentBConfig: { brand: "Google", model: "google/gemma-2-9b-it:free" },
    metrics: { efficiencyIndex: 12.22, accuracyScore: 100, totalTokens: 4983, totalWallClockMs: 16424 }
  },
  {
    problemId: "mmlu-pro-02",
    problemTitle: "Byzantine Agreement Quorum Intersection Invariant",
    topic: "science",
    domain: "Distributed Systems & Byzantine Fault Tolerance",
    agentAConfig: { brand: "Qwen", model: "qwen/qwen-2.5-coder-32b-instruct:free" },
    agentBConfig: { brand: "Mistral", model: "mistralai/mistral-7b-instruct:free" },
    metrics: { efficiencyIndex: 11.97, accuracyScore: 100, totalTokens: 3866, totalWallClockMs: 21606 }
  },
  {
    problemId: "ifeval-01",
    problemTitle: "Strict JSON Schema with Negative Word Constraints & Key Counts",
    topic: "instruction_following",
    domain: "Constraint Compliance & Schema Enforcement",
    agentAConfig: { brand: "DeepSeek", model: "deepseek/deepseek-r1-distill-llama-70b:free" },
    agentBConfig: { brand: "Microsoft", model: "microsoft/phi-3-mini-128k-instruct:free" },
    metrics: { efficiencyIndex: 11.88, accuracyScore: 100, totalTokens: 3816, totalWallClockMs: 22055 }
  },
  {
    problemId: "logic-01",
    problemTitle: "The 3-Jug Decanting Optimization",
    topic: "logic",
    domain: "State-Space Search & Graph Invariants",
    agentAConfig: { brand: "Google", model: "gemini-3.7-flash" },
    agentBConfig: { brand: "OpenAI", model: "gpt-4.5-preview" },
    metrics: { efficiencyIndex: 11.45, accuracyScore: 100, totalTokens: 5200, totalWallClockMs: 16800 }
  },
  {
    problemId: "gpqa-diamond-02",
    problemTitle: "Competitive Enzyme Inhibition Apparent Km Ratio",
    topic: "science",
    domain: "Biochemistry & Michaelis-Menten Kinetics",
    agentAConfig: { brand: "Google", model: "google/gemma-2-9b-it:free" },
    agentBConfig: { brand: "CognitiveComputations", model: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free" },
    metrics: { efficiencyIndex: 11.25, accuracyScore: 100, totalTokens: 4560, totalWallClockMs: 19493 }
  },
  {
    problemId: "logic-03",
    problemTitle: "The Three Mislabelled Fruit Crates",
    topic: "logic",
    domain: "Deductive Elimination",
    agentAConfig: { brand: "Microsoft", model: "microsoft/phi-3-mini-128k-instruct:free" },
    agentBConfig: { brand: "Meta", model: "meta-llama/llama-3.1-8b-instruct:free" },
    metrics: { efficiencyIndex: 10.72, accuracyScore: 100, totalTokens: 4353, totalWallClockMs: 21423 }
  },
  {
    problemId: "gpqa-diamond-01",
    problemTitle: "3D Isotropic Quantum Harmonic Oscillator Degeneracy",
    topic: "science",
    domain: "Quantum Mechanics & Degeneracy",
    agentAConfig: { brand: "Google", model: "google-gemini-3.7-flash" },
    agentBConfig: { brand: "Anthropic", model: "claude-3-7-sonnet-20250219" },
    metrics: { efficiencyIndex: 10.1, accuracyScore: 100, totalTokens: 5240, totalWallClockMs: 18900 }
  },
  {
    problemId: "abstract-03",
    problemTitle: "Recursive Difference Pattern Induction",
    topic: "abstract",
    domain: "Polynomial Sequence Induction",
    agentAConfig: { brand: "Meta", model: "meta-llama/llama-3.3-70b-instruct:free" },
    agentBConfig: { brand: "CognitiveComputations", model: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free" },
    metrics: { efficiencyIndex: 10.08, accuracyScore: 100, totalTokens: 3396, totalWallClockMs: 29213 }
  },
  {
    problemId: "math-aime-01",
    problemTitle: "Least Positive Integer with Triple Modular Congruences",
    topic: "math",
    domain: "Number Theory & Chinese Remainder Theorem",
    agentAConfig: { brand: "DeepSeek", model: "deepseek-r1" },
    agentBConfig: { brand: "Qwen", model: "qwen/qwen-2.5-72b-instruct" },
    metrics: { efficiencyIndex: 8.89, accuracyScore: 100, totalTokens: 5800, totalWallClockMs: 19400 }
  },
  {
    problemId: "gpqa-diamond-01",
    problemTitle: "3D Isotropic Quantum Harmonic Oscillator Degeneracy",
    topic: "science",
    domain: "Quantum Mechanics & Degeneracy",
    agentAConfig: { brand: "Qwen", model: "qwen/qwen-2.5-coder-32b-instruct:free" },
    agentBConfig: { brand: "DeepSeek", model: "deepseek/deepseek-r1:free" },
    metrics: { efficiencyIndex: 8.72, accuracyScore: 100, totalTokens: 2904, totalWallClockMs: 39491 }
  },
  {
    problemId: "mmlu-pro-02",
    problemTitle: "Byzantine Agreement Quorum Intersection Invariant",
    topic: "science",
    domain: "Distributed Systems & Byzantine Fault Tolerance",
    agentAConfig: { brand: "LiquidAI", model: "liquid/lfm-2.5-2.6b:free" },
    agentBConfig: { brand: "Google", model: "google/gemma-4-26b-a4b-it:free" },
    metrics: { efficiencyIndex: 8.48, accuracyScore: 100, totalTokens: 4194, totalWallClockMs: 28130 }
  },
  {
    problemId: "swe-bench-01",
    problemTitle: "Lock-Free Ring Buffer Head-Tail Invariant & Capacity Calculation",
    topic: "coding",
    domain: "Software Engineering & Concurrency",
    agentAConfig: { brand: "NVIDIA", model: "nvidia/llama-3.1-nemotron-70b-instruct:free" },
    agentBConfig: { brand: "DeepSeek", model: "deepseek/deepseek-chat:free" },
    metrics: { efficiencyIndex: 8.14, accuracyScore: 100, totalTokens: 4547, totalWallClockMs: 27022 }
  },
  {
    problemId: "gpqa-diamond-01",
    problemTitle: "3D Isotropic Quantum Harmonic Oscillator Degeneracy",
    topic: "science",
    domain: "Quantum Mechanics & Degeneracy",
    agentAConfig: { brand: "Qwen", model: "qwen/qwq-32b:free" },
    agentBConfig: { brand: "DeepSeek", model: "deepseek/deepseek-chat:free" },
    metrics: { efficiencyIndex: 8.13, accuracyScore: 100, totalTokens: 3941, totalWallClockMs: 31205 }
  },
  {
    problemId: "logic-04",
    problemTitle: "Strict Five-Person Seating Deduction",
    topic: "logic",
    domain: "Linear Constraint Satisfaction",
    agentAConfig: { brand: "DeepSeek", model: "deepseek/deepseek-chat:free" },
    agentBConfig: { brand: "Mistral", model: "mistralai/mistral-small-24b-instruct-2501:free" },
    metrics: { efficiencyIndex: 8.02, accuracyScore: 100, totalTokens: 5832, totalWallClockMs: 21367 }
  },
  {
    problemId: "gpqa-diamond-02",
    problemTitle: "Competitive Enzyme Inhibition Apparent Km Ratio",
    topic: "science",
    domain: "Biochemistry & Michaelis-Menten Kinetics",
    agentAConfig: { brand: "Anthropic", model: "claude-3-7-sonnet-20250219" },
    agentBConfig: { brand: "OpenAI", model: "gpt-4.5-preview" },
    metrics: { efficiencyIndex: 7.32, accuracyScore: 100, totalTokens: 6100, totalWallClockMs: 22400 }
  },
  {
    problemId: "logic-03",
    problemTitle: "The Three Mislabelled Fruit Crates",
    topic: "logic",
    domain: "Deductive Elimination",
    agentAConfig: { brand: "Meta", model: "meta-llama/llama-3.3-70b-instruct:free" },
    agentBConfig: { brand: "DeepSeek", model: "deepseek/deepseek-chat:free" },
    metrics: { efficiencyIndex: 7, accuracyScore: 100, totalTokens: 4502, totalWallClockMs: 31720 }
  }
];
