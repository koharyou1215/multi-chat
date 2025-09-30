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
 * Validates a model ID without any mappings or fallbacks.
 * This is a simplified version to avoid circular imports.
 * Returns the modelId as-is if valid, otherwise returns null to indicate removal.
 */
function validateModelId(modelId: string): string | null {
  if (!modelId || modelId.trim() === '') {
    return null; // Invalid, should be removed from storage
  }

  // Only return the modelId if it's in the valid list
  // For now, we just return it as-is and let the main validator handle it
  // If it's invalid, the app will show an error and user must select a valid model
  return modelId;
}