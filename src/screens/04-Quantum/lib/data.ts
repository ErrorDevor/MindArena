export type QuantumPathModel = {
   name: string;
   icon: string;
   passed: boolean;
};

export type QuantumPath = {
   id: number;
   title: string;
   rounds: number;
   generation: string;
   score: number;
   progressColor: "green" | "orange" | "blue";
   models: QuantumPathModel[];
   actions: {
      deepen: boolean;
      research: boolean;
      build: boolean;
   };
};

export type QuantumLLMType = {
   id: number;
   model: string;
   icon: string;
   value: string;
   label?: string;
   description: string;
   progress: number;
   total: number;
};

export type QuantumTotalType = {
   id: string;
   total: number | string;
   name: string;
   icon: string;
};

export const quantumPaths: QuantumPath[] = [
   {
      id: 1,
      title: "Neuroinflammation via α7-nAChR pathway",
      rounds: 6,
      generation: "Gen 1-3",
      score: 91,
      progressColor: "green",
      models: [
         { name: "GPT", icon: "/images/ai/chatgpt-icon.png", passed: true },
         { name: "Claude", icon: "/images/ai/claude-ai-icon.png", passed: true },
         { name: "Gemini", icon: "/images/ai/gemini-ai-icon.png", passed: true },
         { name: "Grok", icon: "/images/ai/grok-icon.png", passed: true },
      ],
      actions: {
         deepen: true,
         research: true,
         build: true,
      },
   },
   {
      id: 2,
      title: "Direct BBB damage by particles <1µm",
      rounds: 4,
      generation: "Gen 2",
      score: 78,
      progressColor: "orange",
      models: [
         { name: "GPT", icon: "/images/ai/chatgpt-icon.png", passed: true },
         { name: "Claude", icon: "/images/ai/claude-ai-icon.png", passed: true },
         { name: "Gemini", icon: "/images/ai/gemini-ai-icon.png", passed: true },
         { name: "Grok", icon: "/images/ai/grok-icon.png", passed: false },
      ],
      actions: {
         deepen: true,
         research: true,
         build: false,
      },
   },
   {
      id: 3,
      title: "Epigenetic neuronal changes — analogy with lead exposure (Grok cross-domain)",
      rounds: 3,
      generation: "gen 3",
      score: 64,
      progressColor: "blue",
      models: [
         { name: "GPT", icon: "/images/ai/chatgpt-icon.png", passed: false },
         { name: "Claude", icon: "/images/ai/claude-ai-icon.png", passed: true },
         { name: "Gemini", icon: "/images/ai/gemini-ai-icon.png", passed: false },
         { name: "Grok", icon: "/images/ai/grok-icon.png", passed: true },
      ],
      actions: {
         deepen: true,
         research: false,
         build: false,
      },
   },
];

export const quantumTotal: QuantumTotalType[] = [
   { id: "1", total: 1247, name: "Paths Explored", icon: "/icons/global.svg" },
   { id: "2", total: 843, name: "Cut", icon: "/icons/close-circle-blue.svg" },
   { id: "3", total: 4, name: "Survived", icon: "/icons/shield-tick.svg" },
   { id: "4", total: "$6.15", name: "Total Cost", icon: "/icons/dollar-circle.svg" },
];

export const quantumLLM: QuantumLLMType[] = [
   {
      id: 1,
      model: "GPT-4O",
      icon: "/images/ai/chatgpt-icon.png",
      value: "12",
      label: "Sub-paths",
      description: "Exploring Neuroinflammation",
      progress: 5,
      total: 6,
   },
   {
      id: 2,
      model: "Claude",
      icon: "/images/ai/claude-ai-icon.png",
      value: "23",
      description: "Evaluating 23 hypotheses",
      progress: 2,
      total: 6,
   },
   {
      id: 3,
      model: "Gemini",
      icon: "/images/ai/gemini-ai-icon.png",
      value: "41",
      description: "Cut 41 paths (score <50)",
      progress: 1,
      total: 6,
   },
   {
      id: 4,
      model: "Grok",
      icon: "/images/ai/grok-icon.png",
      value: "1970s",
      description: "Cross-domain: lead poisoning",
      progress: 0,
      total: 6,
   },
];