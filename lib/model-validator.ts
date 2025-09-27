import { availableModels } from './models';

/**
 * Validates and corrects model IDs to ensure they are valid
 */
export function validateModelId(modelId: string): string {
  if (!modelId || modelId.trim() === '') {
    // Empty model ID provided, falling back to default
    return 'google/gemini-2.5-flash';
  }

  // Check if the model exists in our available models
  const isValidModel = availableModels.some(model => model.id === modelId);

  if (isValidModel) {
    return modelId;
  }

  // Handle common invalid model IDs
  const modelMappings: Record<string, string> = {
    'google/gemini-1.5-flash': 'google/gemini-2.5-flash',
    'google/gemini-1.5-pro': 'google/gemini-2.5-pro',
    'google/gemini-flash': 'google/gemini-2.5-flash',
    'google/gemini-pro': 'google/gemini-2.5-pro',
  };

  // Check for mapped models
  if (modelMappings[modelId]) {
    // Invalid model ID "${modelId}" mapped to "${modelMappings[modelId]}"
    return modelMappings[modelId];
  }

  // If it's a Gemini model but not in our list, use Flash as default
  if (modelId.toLowerCase().includes('gemini')) {
    // Unknown Gemini model "${modelId}", falling back to gemini-2.5-flash
    return 'google/gemini-2.5-flash';
  }

  // If it's a Claude model but not in our list, use Sonnet as default
  if (modelId.toLowerCase().includes('claude')) {
    // Unknown Claude model "${modelId}", falling back to claude-sonnet-4
    return 'anthropic/claude-sonnet-4';
  }

  // For any other unknown model, use the default
  // Unknown model ID "${modelId}", falling back to default
  return 'google/gemini-2.5-flash';
}

/**
 * Validates all model IDs in a configuration object
 */
export function validateModelConfig(config: Record<string, string>): Record<string, string> {
  const validatedConfig: Record<string, string> = {};

  for (const [key, modelId] of Object.entries(config)) {
    validatedConfig[key] = validateModelId(modelId);
  }

  return validatedConfig;
}

/**
 * Gets the display name for a model ID, handling invalid IDs gracefully
 */
export function getModelDisplayName(modelId: string): string {
  const validatedId = validateModelId(modelId);
  const model = availableModels.find(m => m.id === validatedId);
  return model?.name || validatedId;
}