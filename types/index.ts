export interface AIModel {
  id: string;
  name: string;
  group: string;
  description?: string;
  contextWindow?: number;
  costPer1K?: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  panelId: string;
  modelId?: string;
  attachments?: Attachment[];
  error?: string;
}

export interface Attachment {
  id: string;
  type: "file" | "image" | "screenshot";
  name: string;
  url: string;
  size: number;
  mimeType?: string;
}

export interface PromptVariable {
  name: string;
  description?: string;
  type: "text" | "number" | "boolean" | "select" | "date";
  defaultValue?: any;
  required?: boolean;
  options?: string[]; // For select type
  placeholder?: string;
}

// Consolidated Prompt interface (replaces both Prompt and CustomPrompt)
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  category: string;
  tags: string[];
  variables?: PromptVariable[];

  // Usage and favorites
  isFavorite: boolean;
  usageCount: number;
  lastUsed?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Optimization metadata
  isOptimized?: boolean;
  originalContent?: string;
}

// Deprecated: Use Prompt instead
// @deprecated Use Prompt interface
export type CustomPrompt = Prompt;

export interface ChatPanel {
  id: string;
  modelId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  customPrompt?: Prompt;  // Updated to use consolidated Prompt type
  error?: string;
  streamingMessage?: string;
}

export interface AppState {
  panels: ChatPanel[];
  customPrompts: Prompt[];  // Updated to use consolidated Prompt type
  openRouterApiKey?: string;
}

export interface PromptUsageHistoryItem {
  id: string;
  promptId: string;
  title: string;
  panelIds: string[];
  appliedAt: Date;
}

export interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  panels: ChatPanel[];
  modelIds: Record<string, string>;
}

// Additional types for chat-store compatibility
export type SendMode = "all" | "selected" | "group";

export interface ChatState {
  // Storage Version (for migration)
  version?: number;

  // Panel Management
  panels: ChatPanel[];
  activePanelIds: string[];
  selectedPanelId: string | null;
  selectedPanelIds: string[]; // Multi-send target panels
  multiSendMode: SendMode;

  // Prompts (consolidated from prompts + customPrompts)
  customPrompts: Prompt[];  // Single source of truth for prompts
  promptHistory: PromptUsageHistoryItem[];

  // UI State
  commandPaletteOpen: boolean;
  sidebarOpen: boolean;
  promptLibraryOpen: boolean;
  editingPromptId: string | null;

  // User Data
  favorites: ChatMessage[];  // User-saved messages
  chatHistories: ChatHistory[];  // Chat histories storage

  // Settings
  settings: AppSettings;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  panelCount: number;
  defaultModels: Record<string, string>;  // panelId -> modelId mapping
  apiKeys: Record<string, string>;  // service -> apiKey mapping (includes openRouterApiKey)
  commandHistory: string[];
  shortcuts: Record<string, string>;
}

export interface Command {
  id: string;
  trigger: string;
  description: string;
  category: string;
  action: (args?: string[]) => Promise<void>;
}

// Type Guards
export function isPrompt(obj: unknown): obj is Prompt {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'content' in obj &&
    'category' in obj
  );
}

// Utility Types
export type PanelId = string;
export type ModelId = string;
export type PromptId = string;
