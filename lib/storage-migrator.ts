import { validateModelConfig } from './model-validator';

/**
 * Migrates localStorage data to fix invalid model IDs
 */
export function migrateStorageData() {
  if (typeof window === 'undefined') return;

  try {
    const storageKey = 'multi-chat-store';
    const stored = localStorage.getItem(storageKey);

    if (!stored) return;

    const data = JSON.parse(stored);

    // Check if there's a state object
    if (data.state) {
      let needsUpdate = false;

      // Fix defaultModels if they exist
      if (data.state.settings?.defaultModels) {
        const validatedModels = validateModelConfig(data.state.settings.defaultModels);

        // Check if any models were changed
        for (const [key, value] of Object.entries(data.state.settings.defaultModels)) {
          if (validatedModels[key] !== value) {
            needsUpdate = true;
            break;
          }
        }

        if (needsUpdate) {
          data.state.settings.defaultModels = validatedModels;
          // Migrated default models: ${JSON.stringify(validatedModels)}
        }
      }

      // Fix panel models if they exist
      if (data.state.panels) {
        for (const panel of data.state.panels) {
          if (panel.modelId) {
            const originalModelId = panel.modelId;
            // Import and use validateModelId inline to avoid circular dependencies
            const validatedModelId = validateModelId(panel.modelId);

            if (validatedModelId !== originalModelId) {
              panel.modelId = validatedModelId;
              needsUpdate = true;
              // Migrated panel ${panel.id} model from ${originalModelId} to ${validatedModelId}
            }
          }
        }
      }

      // Save back to localStorage if changes were made
      if (needsUpdate) {
        localStorage.setItem(storageKey, JSON.stringify(data));
        // Storage migration completed
      }
    }
  } catch (error) {
    // Failed to migrate storage data: ${error}
    // Don't fail silently, but also don't break the app
  }
}

/**
 * Validates and potentially corrects a model ID
 * This is a simplified version to avoid circular imports
 */
function validateModelId(modelId: string): string {
  if (!modelId || modelId.trim() === '') {
    return 'google/gemini-2.5-flash';
  }

  // Handle common invalid model IDs
  const modelMappings: Record<string, string> = {
    'google/gemini-1.5-flash-8b': 'google/gemini-2.5-flash',
    'google/gemini-1.5-flash': 'google/gemini-2.5-flash',
    'google/gemini-1.5-pro': 'google/gemini-2.5-pro',
  };

  if (modelMappings[modelId]) {
    return modelMappings[modelId];
  }

  // If it contains gemini-1.5, upgrade to 2.5
  if (modelId.includes('gemini-1.5')) {
    return modelId.includes('pro') ? 'google/gemini-2.5-pro' : 'google/gemini-2.5-flash';
  }

  return modelId;
}