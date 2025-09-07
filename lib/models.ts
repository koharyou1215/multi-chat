import { AIModel } from '@/types'

export const availableModels: AIModel[] = [
  // Google (Direct)
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro (最高性能)',
    group: 'Google (Direct)',
    description: 'Googleの最高性能モデル',
    contextWindow: 1048576,
    costPer1K: 7.0
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (高速)',
    group: 'Google (Direct)',
    description: '高速な応答性能',
    contextWindow: 1048576,
    costPer1K: 0.3
  },
  {
    id: 'google/gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite (軽量)',
    group: 'Google (Direct)',
    description: '軽量で効率的',
    contextWindow: 1048576,
    costPer1K: 0.075
  },
  
  // Anthropic (OpenRouter)
  {
    id: 'anthropic/claude-opus-4',
    name: 'Claude Opus 4',
    group: 'Anthropic (OpenRouter)',
    description: '最高性能のClaude',
    contextWindow: 200000,
    costPer1K: 60.0
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    group: 'Anthropic (OpenRouter)',
    description: 'バランスの良いClaude',
    contextWindow: 200000,
    costPer1K: 15.0
  },
  
  // xAI (OpenRouter)
  {
    id: 'x-ai/grok-4',
    name: 'Grok-4',
    group: 'xAI (OpenRouter)',
    description: 'xAIの最新モデル',
    contextWindow: 131072,
    costPer1K: 15.0
  },
  {
    id: 'z-ai/glm-4.5',
    name: 'GLM-4.5',
    group: 'xAI (OpenRouter)',
    description: 'GLM系の高性能モデル',
    contextWindow: 32768,
    costPer1K: 5.0
  },
  {
    id: 'x-ai/grok-code-fast-1',
    name: 'Grok Code Fast',
    group: 'xAI (OpenRouter)',
    description: 'コーディングに特化した高速モデル',
    contextWindow: 32768,
    costPer1K: 5.0
  },
  
  // OpenAI (OpenRouter)
  {
    id: 'openai/gpt-5-chat',
    name: 'GPT-5',
    group: 'OpenAI (OpenRouter)',
    description: 'OpenAIの最新モデル',
    contextWindow: 128000,
    costPer1K: 30.0
  },
  {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    group: 'OpenAI (OpenRouter)',
    description: '軽量版GPT-5',
    contextWindow: 128000,
    costPer1K: 3.0
  },
  
  // DeepSeek (OpenRouter)
  {
    id: 'deepseek/deepseek-chat-v3.1',
    name: 'DeepSeek Chat v3',
    group: 'DeepSeek (OpenRouter)',
    description: 'DeepSeekの会話特化モデル',
    contextWindow: 64000,
    costPer1K: 0.55
  },
  {
    id: 'deepcogito/cogito-v2-preview-deepseek-671b',
    name: 'DeepSeek 671B',
    group: 'DeepSeek (OpenRouter)',
    description: 'DeepSeekの大規模モデル',
    contextWindow: 64000,
    costPer1K: 7.5
  },
  
  // Standard (OpenRouter)
  {
    id: 'mistralai/mistral-medium-3.1',
    name: 'Mistral Medium 3.1',
    group: 'Standard (OpenRouter)',
    description: 'Mistralの中性能モデル',
    contextWindow: 128000,
    costPer1K: 2.7
  },
  {
    id: 'meta-llama/llama-4-maverick',
    name: 'Llama 4 Maverick',
    group: 'Standard (OpenRouter)',
    description: 'Metaの最新Llama',
    contextWindow: 131072,
    costPer1K: 0.27
  },
  
  // Specialized (OpenRouter)
  {
    id: 'qwen/qwen3-30b-a3b-thinking-2507',
    name: 'Qwen3 30B A3B Thinking',
    group: 'Specialized (OpenRouter)',
    description: '思考特化型モデル',
    contextWindow: 32768,
    costPer1K: 0.90
  },
  {
    id: 'qwen/qwen3-30b-a3b-instruct-2507',
    name: 'Qwen3 30B A3B',
    group: 'Specialized (OpenRouter)',
    description: '指示特化型モデル',
    contextWindow: 32768,
    costPer1K: 0.90
  },
  {
    id: 'moonshotai/kimi-k2',
    name: 'Kimi K2',
    group: 'Specialized (OpenRouter)',
    description: 'MoonShotの知識モデル',
    contextWindow: 200000,
    costPer1K: 0.80
  },
]

export const getModelsByGroup = () => {
  const groups: Record<string, AIModel[]> = {}
  availableModels.forEach(model => {
    if (!groups[model.group]) {
      groups[model.group] = []
    }
    groups[model.group].push(model)
  })
  return groups
}

export const getModelById = (id: string): AIModel | undefined => {
  return availableModels.find(model => model.id === id)
}

export const getModelName = (id: string): string => {
  const model = getModelById(id)
  return model?.name || id
}