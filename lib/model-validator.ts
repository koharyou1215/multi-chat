import { availableModels } from './models';

/**
 * Validates model IDs to ensure they exist in availableModels.
 * NO fallbacks, NO mappings - only strict validation.
 */
export function validateModelId(modelId: string): string {
  if (!modelId || modelId.trim() === '') {
    throw new Error('Model ID is required and cannot be empty');
  }

  // Check if the model exists in our available models
  const isValidModel = availableModels.some(model => model.id === modelId);

  if (!isValidModel) {
    throw new Error(
      `Invalid model ID: "${modelId}". Model not found in availableModels. ` +
      `Use only models defined in lib/models.ts`
    );
  }

  return modelId;
}

/**
 * Validates all model IDs in a configuration object.
 * Throws error if any model ID is invalid.
 */
export function validateModelConfig(config: Record<string, string>): Record<string, string> {
  const validatedConfig: Record<string, string> = {};

  for (const [key, modelId] of Object.entries(config)) {
    validatedConfig[key] = validateModelId(modelId); // Will throw if invalid
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