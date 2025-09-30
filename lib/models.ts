import { AIModel } from "@/types";

export const availableModels: AIModel[] = [
  // Google (Direct)
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro (最高性能)",
    group: "Google (Direct)",
    description: "Googleの最高性能モデル",
    contextWindow: 1048576,
    costPer1K: 7.0,
  },
  {
    id: "google/gemini-2.5-flash-preview-09-2025",
    name: "Gemini 2.5 Flash (高速)",
    group: "Google (Direct)",
    description: "高速な応答性能",
    contextWindow: 1048576,
    costPer1K: 0.3,
  },
  {
    id: "google/gemini-2.5-flash-lite-preview-09-2025",
    name: "Gemini 2.5 Flash Lite (軽量)",
    group: "Google (Direct)",
    description: "軽量で効率的",
    contextWindow: 1048576,
    costPer1K: 0.075,
  },

  // Anthropic (OpenRouter)
  {
    id: "anthropic/claude-opus-4.1",
    name: "Claude Opus 4.1",
    group: "Anthropic (OpenRouter)",
    description: "最高性能のClaude",
    contextWindow: 200000,
    costPer1K: 60.0,
  },
  {
    id: "anthropic/claude-sonnet-4.5",
    name: "Claude Sonnet 4.5",
    group: "Anthropic (OpenRouter)",
    description: "バランスの良いClaude - 4.5 アップデート",
    contextWindow: 200000,
    costPer1K: 18.0,
  },

  // xAI (OpenRouter)
  {
    id: "x-ai/grok-4",
    name: "Grok-4",
    group: "xAI (OpenRouter)",
    description: "xAIの最新モデル",
    contextWindow: 131072,
    costPer1K: 15.0,
  },
  {
    id: "x-ai/grok-4-fast:free",
    name: "Grok-4-fast",
    group: "xAI (OpenRouter)",
    description: "コーディングに特化した高速モデル",
    contextWindow: 32768,
    costPer1K: 5.0,
  },

  // OpenAI (OpenRouter)
  {
    id: "openai/gpt-5",
    name: "GPT-5",
    group: "OpenAI (OpenRouter)",
    description: "OpenAIの最新モデル",
    contextWindow: 128000,
    costPer1K: 30.0,
  },
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    group: "OpenAI (OpenRouter)",
    description: "軽量版GPT-5",
    contextWindow: 128000,
    costPer1K: 3.0,
  },

  // DeepSeek (OpenRouter)
  {
    id: "deepseek/deepseek-v3.2-exp",
    name: "DeepSeek v3.2 Exp",
    group: "DeepSeek (OpenRouter)",
    description: "DeepSeekの実験的最新版 v3.2",
    contextWindow: 65536,
    costPer1K: 0.6,
  },
  // Standard (OpenRouter)
  // Specialized (OpenRouter)
  {
    id: "qwen/qwen3-next-80b-a3b-thinking",
    name: "Qwen3 Next 80B A3B Thinking",
    group: "Specialized (OpenRouter)",
    description: "思考特化型モデル",
    contextWindow: 32768,
    costPer1K: 0.9,
  },
  {
    id: "qwen/qwen3-vl-235b-a22b-thinking",
    name: "VL 235B A22B",
    group: "Specialized (OpenRouter)",
    description: "指示特化型モデル",
    contextWindow: 32768,
    costPer1K: 0.9,
  },
  {
    id: "moonshotai/kimi-k2",
    name: "Kimi K2",
    group: "Specialized (OpenRouter)",
    description: "MoonShotの知識モデル",
    contextWindow: 200000,
    costPer1K: 0.8,
  },
];

export const getModelsByGroup = () => {
  const groups: Record<string, AIModel[]> = {};
  availableModels.forEach((model) => {
    if (!groups[model.group]) {
      groups[model.group] = [];
    }
    groups[model.group].push(model);
  });
  return groups;
};

export const getModelById = (id: string): AIModel | undefined => {
  return availableModels.find((model) => model.id === id);
};

export const getModelName = (id: string): string => {
  const model = getModelById(id);
  return model?.name || id;
};

// Type-safe model ID extraction
export const ALLOWED_MODEL_IDS = availableModels.map(m => m.id);
export type AllowedModelId = typeof availableModels[number]['id'];

/**
 * Checks if a model ID is valid (exists in availableModels)
 */
export const isValidModelId = (modelId: string): modelId is AllowedModelId => {
  return availableModels.some(model => model.id === modelId);
};
