// Compatibility wrapper for gradual migration to unified store
// This file maps the old useAppStore interface to the new useUnifiedStore

import { useChatStore } from "./chat-store";
import type {
  ChatPanel,
  CustomPrompt,
  ChatMessage,
  PromptUsageHistoryItem,
  SendMode,
  ChatHistory,
} from "@/types";

// Extend Window interface for prompt editing state
interface WindowWithPromptId extends Window {
  __editingPromptId?: string | null;
}

export interface AppStore {
  panels: ChatPanel[];
  activePanels: number;
  customPrompts: CustomPrompt[];
  openRouterApiKey: string;
  geminiApiKey: string;
  anthropicApiKey: string;
  apiKeys?: Record<string, string>;
  selectedPanelId: string | null;
  sidebarOpen: boolean;
  multiSendIds: string[];
  promptHistory: PromptUsageHistoryItem[];
  commandPaletteOpen: boolean;
  multiSendMode: SendMode;
  groupedPanelIds: string[];
  commandHistory: string[];

  // Initialize panels (compatibility)
  initializePanels: (count: number) => void;
  // Alias for backward compatibility
  setActivePanels: (count: number) => void;

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
  regenerateLastMessage: (panelId: string) => void;
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
  resetPrompts: () => void;

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
  getChatHistories: () => ChatHistory[];

  // Settings
  setApiKey: (provider: string, key: string) => void;
  // Compatibility helpers
  savePanelData: () => void;
  loadPanelData: () => void;
  resetPanels: () => void;
  resetStore: () => void;
  // Prompt library controls (compatibility)
  setPromptLibraryOpen: (open: boolean) => void;
  setEditingPromptId: (id: string | null) => void;
  // Backwards-compatible read fields
  promptLibraryOpen: boolean;
  editingPromptId: string | null;
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
      chatStore.openRouterApiKey ||
      chatStore.settings.apiKeys.openRouter ||
      chatStore.settings.apiKeys.openrouter ||
      "",
    // Compatibility: expose individual provider keys for older components
    geminiApiKey: chatStore.settings.apiKeys.gemini || "",
    anthropicApiKey: chatStore.settings.apiKeys.anthropic || "",
    apiKeys: chatStore.settings.apiKeys,
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
    regenerateLastMessage: chatStore.regenerateLastMessage,
    setSelectedPanel: chatStore.setSelectedPanel,
    toggleSidebar: chatStore.toggleSidebar,
    setSidebarOpen: chatStore.setSidebarOpen,
    toggleMultiSendPanel: chatStore.toggleMultiSendPanel,
    clearMultiSend: chatStore.clearMultiSend,
    addPromptHistory: chatStore.addPromptHistory,

    // Compatibility helpers for Settings UI
    savePanelData: () => {
      try {
        chatStore.saveCurrentChat();
        console.log('savePanelData: invoked saveCurrentChat');
      } catch (e) {
        console.error('savePanelData failed', e);
      }
    },
    loadPanelData: () => {
      try {
        // No direct loader available; rehydrate from storage is handled elsewhere.
        // Provide a safe no-op that logs for compatibility.
        console.log('loadPanelData: no-op (store rehydration handled at startup)');
      } catch (e) {
        console.error('loadPanelData failed', e);
      }
    },
    resetPanels: () => {
      try {
        chatStore.resetStore();
        console.log('resetPanels: store reset');
      } catch (e) {
        console.error('resetPanels failed', e);
      }
    },

    // Prompt management
    addCustomPrompt: chatStore.addCustomPrompt,
    updateCustomPrompt: chatStore.updateCustomPrompt,
    deleteCustomPrompt: chatStore.deleteCustomPrompt,
    applyPromptToPanel: chatStore.applyPromptToPanel,
    resetPrompts: chatStore.resetPrompts,

    // Compatibility fields for Prompt Library UI
    // Expose a boolean to indicate whether prompt library should be open (mapped to sidebar state)
    promptLibraryOpen: chatStore.sidebarOpen,
    // editingPromptId isn't tracked in chatStore; support via custom event or undefined
    editingPromptId: typeof window !== 'undefined' && (window as WindowWithPromptId).__editingPromptId ? (window as WindowWithPromptId).__editingPromptId : null,

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
    setApiKey: chatStore.setApiKey,
    resetStore: chatStore.resetStore,
  // Provide compatibility hooks for prompt library UI. map opening to sidebar toggle; editing id is a no-op fallback.
  setPromptLibraryOpen: (open: boolean) => chatStore.setSidebarOpen(open),
  setEditingPromptId: (id: string | null) => {
    // No dedicated editingPromptId in chatStore yet; keep as no-op for compatibility.
    if (typeof window !== "undefined") {
      // emit a custom event so UI can react if needed
      try {
        window.dispatchEvent(new CustomEvent('setEditingPromptId', { detail: { id } }));
      } catch (e) {
        // ignore
      }
    }
  },
  } as AppStore;
};
