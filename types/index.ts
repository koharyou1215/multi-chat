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
}

export interface Attachment {
  id: string;
  type: "file" | "image" | "screenshot";
  name: string;
  url: string;
  size: number;
  mimeType?: string;
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
}

export interface ChatPanel {
  id: string;
  modelId: string;
  messages: ChatMessage[];
  isLoading: boolean;
  customPrompt?: CustomPrompt;
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
