/**
 * Application-wide constants
 */

// Timing constants (in milliseconds)
export const TIMING = {
  // DOM manipulation delays
  STYLE_FORCE_DELAY: 100,
  STYLE_RETRY_SHORT: 500,
  STYLE_RETRY_MEDIUM: 1000,
  STYLE_RETRY_LONG: 2000,
  STYLE_RETRY_EXTRA: 3000,

  // UI update delays
  REGENERATE_DELAY: 100,
  SCROLL_THRESHOLD: 100,

  // Virtual scrolling
  ITEM_HEIGHT: 80,
  MAX_TEXTAREA_HEIGHT: 120,
  MIN_TEXTAREA_HEIGHT: 20,
  DEFAULT_INPUT_HEIGHT: 48,
} as const;

// Color gradients for panels
export const PANEL_GRADIENTS = {
  '1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  '2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  '3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  '4': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  // Default fallback
  DEFAULT: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
} as const;

// Button gradients
export const BUTTON_GRADIENTS = {
  PRIMARY: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
  FAVORITE: 'linear-gradient(135deg, #ff9a9e, #fad0c4)',
  SEND: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  SUCCESS: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
} as const;

// Colors
export const COLORS = {
  TEXT_DARK: '#2c3e50',
  TEXT_LIGHT: '#ffffff',
  TEXT_MUTED: '#6b7280',
  BORDER_LIGHT: 'rgba(255, 255, 255, 0.5)',
  BORDER_EXTRA_LIGHT: 'rgba(255, 255, 255, 0.3)',
  SHADOW_LIGHT: 'rgba(255, 255, 255, 0.2)',
} as const;

// Size constants
export const SIZES = {
  BUTTON_PADDING: '8px 16px',
  BUTTON_MARGIN: '4px',
  BUTTON_GAP: '8px',
  BORDER_RADIUS: '20px',
  BORDER_RADIUS_SMALL: '12px',
  BORDER_WIDTH: '1px',
  ICON_SMALL: 'w-3.5 h-3.5',
  ICON_MEDIUM: 'w-4 h-4',
  ICON_LARGE: 'w-5 h-5',
} as const;

// Animation durations
export const ANIMATIONS = {
  FAST: '0.2s',
  MEDIUM: '0.3s',
  SLOW: '0.5s',
  BOUNCE_DELAY_SHORT: '0ms',
  BOUNCE_DELAY_MEDIUM: '150ms',
  BOUNCE_DELAY_LONG: '300ms',
} as const;

// Panel configurations
export const PANEL_CONFIG = {
  MAX_PANELS: 4,
  DEFAULT_ACTIVE_PANELS: 1,
  MIN_PANELS: 1,
} as const;

// Message configurations
export const MESSAGE_CONFIG = {
  MAX_MESSAGE_LENGTH: 10000,
  TYPING_INDICATOR_DOTS: 3,
} as const;

// Style configurations
export const STYLES = {
  GLASS_BLUR: 'backdrop-blur-xl',
  GLASS_BLUR_STRONG: 'backdrop-blur-3xl',
  GLASS_BLUR_MEDIUM: 'backdrop-blur-2xl',
  TRANSITION_ALL: 'transition-all duration-200',
  HOVER_SCALE: 'hover:scale-105',
  ACTIVE_SCALE: 'active:scale-95',
} as const;

// Box shadow styles
export const SHADOWS = {
  DEFAULT: '0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 5px rgba(255, 255, 255, 0.2)',
  ELEVATED: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LARGE: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
} as const;

// Z-index levels
export const Z_INDEX = {
  DROPDOWN: 10,
  MODAL: 100,
  TOOLTIP: 1000,
  NOTIFICATION: 10000,
} as const;