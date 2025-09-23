// Compatibility wrapper for gradual migration to unified store
// This file maps the old useAppStore interface to the new useUnifiedStore

import { useUnifiedStore } from "./unified-store";
import { useChatStore } from "./chat-store";
import type {
  ChatPanel,
  CustomPrompt,
  ChatMessage,
  PromptUsageHistoryItem,
  SendMode,
} from "@/types";

export interface AppStore {
  panels: ChatPanel[];
  activePanels: number;
  customPrompts: CustomPrompt[];
  openRouterApiKey: string;
  selectedPanelId: string | null;
  sidebarOpen: boolean;
  multiSendIds: string[];
  promptHistory: PromptUsageHistoryItem[];
  commandPaletteOpen: boolean;
  multiSendMode: SendMode;
  groupedPanelIds: string[];
  commandHistory: string[];

  // Favorites (persisted)
  favorites: ChatMessage[];

  // Favorites actions
  addFavorite: (message: ChatMessage) => void;
  removeFavorite: (messageId: string) => void;

  // Panel management
  setPanelCount: (count: number) => void;
  updatePanel: (panelId: string, updates: Partial<ChatPanel>) => void;
  addMessage: (panelId: string, message: ChatMessage) => void;
  setModelForPanel: (panelId: string, modelId: string) => void;
  clearPanelMessages: (panelId: string) => void;
  setSelectedPanel: (panelId: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMultiSendPanel: (panelId: string) => void;
  clearMultiSend: () => void;
  addPromptHistory: (item: PromptUsageHistoryItem) => void;

  // Prompt management
  addCustomPrompt: (prompt: CustomPrompt) => void;
  updateCustomPrompt: (id: string, updates: Partial<CustomPrompt>) => void;
  deleteCustomPrompt: (id: string) => void;
  applyPromptToPanel: (panelId: string, promptId: string) => void;

  // Command palette features
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setMultiSendMode: (mode: SendMode) => void;
  setGroupedPanelIds: (ids: string[]) => void;
  addCommandToHistory: (command: string) => void;
  clearAllMessages: () => void;

  // Chat History Management
  saveCurrentChat: (title?: string) => void;
  loadChatHistory: (historyId: string) => void;
  deleteChatHistory: (historyId: string) => void;
  getChatHistories: () => any[];

  // Settings
  setApiKey: (key: string) => void;
  resetStore: () => void;
}

// For now, still use chat-store for compatibility
// Will switch to unified store after testing
export const useAppStore = () => {
  const chatStore = useChatStore();

  return {
    // State mappings
    panels: chatStore.panels,
    activePanels: chatStore.activePanels,
    customPrompts: chatStore.customPrompts,
    openRouterApiKey:
      chatStore.openRouterApiKey || chatStore.settings.apiKeys.openRouter || "",
    selectedPanelId: chatStore.selectedPanelId,
    sidebarOpen: chatStore.sidebarOpen,
    multiSendIds: chatStore.multiSendIds,
    promptHistory: chatStore.promptHistory,
    commandPaletteOpen: chatStore.commandPaletteOpen,
    multiSendMode: chatStore.multiSendMode,
    groupedPanelIds: chatStore.groupedPanelIds,
    commandHistory: chatStore.settings.commandHistory,

    // Action mappings
    initializePanels: chatStore.initializePanels,
    setPanelCount: chatStore.setPanelCount,
    setActivePanels: chatStore.setPanelCount, // Alias for backward compatibility
    updatePanel: chatStore.updatePanel,
    addMessage: chatStore.addMessage,
    setModelForPanel: chatStore.setModelForPanel,
    clearPanelMessages: chatStore.clearPanelMessages,
    setSelectedPanel: chatStore.setSelectedPanel,
    toggleSidebar: chatStore.toggleSidebar,
    setSidebarOpen: chatStore.setSidebarOpen,
    toggleMultiSendPanel: chatStore.toggleMultiSendPanel,
    clearMultiSend: chatStore.clearMultiSend,
    addPromptHistory: chatStore.addPromptHistory,

    // Prompt management
    addCustomPrompt: chatStore.addCustomPrompt,
    updateCustomPrompt: chatStore.updateCustomPrompt,
    deleteCustomPrompt: chatStore.deleteCustomPrompt,
    applyPromptToPanel: chatStore.applyPromptToPanel,

    // Command palette
    setCommandPaletteOpen: chatStore.setCommandPaletteOpen,
    toggleCommandPalette: chatStore.toggleCommandPalette,
    setMultiSendMode: chatStore.setMultiSendMode,
    setGroupedPanelIds: chatStore.setGroupedPanelIds,
    addCommandToHistory: chatStore.addCommandToHistory,
    clearAllMessages: chatStore.clearAllMessages,

    // Chat History Management
    saveCurrentChat: chatStore.saveCurrentChat,
    loadChatHistory: chatStore.loadChatHistory,
    deleteChatHistory: chatStore.deleteChatHistory,
    getChatHistories: chatStore.getChatHistories,
    // Favorites
    favorites: chatStore.favorites,
    addFavorite: chatStore.addFavorite,
    removeFavorite: chatStore.removeFavorite,

    // Settings
    setApiKey: (key: string) => chatStore.setApiKey("openrouter", key),
    resetStore: chatStore.resetStore,
  } as AppStore;
};
