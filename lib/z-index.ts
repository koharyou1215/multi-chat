/**
 * Z-Index Layer Architecture
 * Structured z-index system to prevent overlapping issues
 */

export const Z_INDEX = {
  // Base layers (lowest)
  BACKGROUND: 0,
  CONTENT: 1,

  // Navigation layers
  SIDEBAR: 40,
  SIDEBAR_OVERLAY: 35,

  // UI layers
  HEADER: 50,
  FOOTER: 50,

  // Interactive layers
  DROPDOWN: 100,
  TOOLTIP: 200,

  // Modal layers (highest)
  MODAL_BACKDROP: 1000,
  MODAL_CONTENT: 1100,
  PROMPT_LIBRARY: 1200,
  SETTINGS_MODAL: 1300,

  // System layers (topmost)
  DEBUG_PANEL: 9000,
  TOAST: 9999,
} as const;

export type ZIndexLevel = typeof Z_INDEX[keyof typeof Z_INDEX];

/**
 * Get z-index value for a specific layer
 */
export function getZIndex(layer: keyof typeof Z_INDEX): number {
  return Z_INDEX[layer];
}

/**
 * Generate CSS z-index string
 */
export function zIndex(layer: keyof typeof Z_INDEX): string {
  return `z-[${Z_INDEX[layer]}]`;
}