// Application constants

export const APP_NAME = 'MultiChat AI'
export const APP_VERSION = '2.0.0'

export const DEFAULT_PANEL_COUNT = 2
export const MAX_PANEL_COUNT = 6
export const MIN_PANEL_COUNT = 1

export const API_ENDPOINTS = {
  GEMINI: 'https://generativelanguage.googleapis.com/v1beta/models',
  OPENROUTER: 'https://openrouter.ai/api/v1'
} as const

export const STORAGE_KEYS = {
  SETTINGS: 'multi-chat-settings',
  PROMPTS: 'multi-chat-prompts',
  API_KEYS: 'multi-chat-api-keys',
  COMMAND_HISTORY: 'multi-chat-command-history'
} as const

export const HOTKEYS = {
  COMMAND_PALETTE: 'cmd+k,ctrl+k',
  SEND_MESSAGE: 'cmd+enter,ctrl+enter',
  CLEAR_CHAT: 'cmd+shift+c,ctrl+shift+c',
  TOGGLE_THEME: 'cmd+shift+d,ctrl+shift+d',
  NEW_PROMPT: 'cmd+n,ctrl+n',
  FOCUS_INPUT: 'cmd+l,ctrl+l'
} as const

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const

export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
} as const

export const SEND_MODES = {
  ALL: 'all',
  SELECTED: 'selected',
  GROUP: 'group'
} as const