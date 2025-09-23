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

export interface CustomPrompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isOptimized?: boolean;
  originalContent?: string;
  variables?: PromptVariable[];
  category?: string;
  isFavorite?: boolean;
}

export interface ChatPanel {
  id: string;
  modelId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  customPrompt?: CustomPrompt;
  error?: string;
  streamingMessage?: string;
}

export interface AppState {
  panels: ChatPanel[];
  activePanels: number;
  customPrompts: CustomPrompt[];
  openRouterApiKey?: string;
}

export interface PromptUsageHistoryItem {
  id: string;
  promptId: string;
  title: string;
  panelIds: string[];
  appliedAt: Date;
}

// Additional types for chat-store compatibility
export type SendMode = "all" | "selected" | "group";

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isFavorite: boolean;
  usageCount: number;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  panels: ChatPanel[];
  activePanelIds: string[];
  commandPaletteOpen: boolean;
  multiSendMode: SendMode;
  selectedPanelId: string | null;
  groupedPanelIds: string[];
  prompts: Prompt[];
  settings: AppSettings;

  // Additional state from use-app-store
  activePanels: number; // Legacy compatibility
  customPrompts: CustomPrompt[];
  sidebarOpen: boolean;
  multiSendIds: string[]; // Legacy compatibility
  promptHistory: PromptUsageHistoryItem[];
  openRouterApiKey?: string; // Will be migrated to settings.apiKeys
  // Favorites (user-saved messages)
  favorites: ChatMessage[];
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  panelCount: number;
  defaultModels: Record<string, string>;
  apiKeys: Record<string, string>;
  commandHistory: string[];
  shortcuts: Record<string, string>;
  openRouterApiKey?: string; // Legacy field for migration
}

export interface Command {
  id: string;
  trigger: string;
  description: string;
  category: string;
  action: (args?: string[]) => Promise<void>;
}
