import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  ChatState,
  ChatPanel,
  ChatMessage,
  Prompt,
  CustomPrompt,
  SendMode,
  AppSettings,
  PromptUsageHistoryItem,
} from "@/types";

// Chat History types
interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  panels: ChatPanel[];
  modelIds: Record<string, string>;
}
import { generateId } from "@/lib/utils";
import { DEFAULT_PROMPTS } from "@/lib/default-prompts";
import { validateModelId, validateModelConfig } from "@/lib/model-validator";
import { logger } from "@/lib/utils/logger";

// Storage Version for migration management
// Increment this when making breaking changes to the store schema
const STORAGE_VERSION = 2;

interface ChatActions {
  // Panel Management
  initializePanels: (count: number) => void;
  setPanelCount: (count: number) => void;
  selectPanel: (panelId: string) => void;
  setSelectedPanel: (panelId: string) => void; // Alias for compatibility
  setModelForPanel: (panelId: string, modelId: string) => void;
  updatePanel: (panelId: string, updates: Partial<ChatPanel>) => void;

  // Message Management
  addMessage: (panelId: string, message: ChatMessage) => void;
  updateStreamingMessage: (panelId: string, chunk: string) => void;
  finalizeStreamingMessage: (panelId: string) => void;
  regenerateLastMessage: (panelId: string) => void;
  clearPanelMessages: (panelId: string) => void;
  clearAllMessages: () => void;

  // Loading States
  setPanelLoading: (panelId: string, loading: boolean) => void;
  setPanelError: (panelId: string, error?: string) => void;

  // Send Modes
  setSendMode: (mode: SendMode) => void;
  togglePanelSelection: (panelId: string) => void;
  clearPanelSelection: () => void;
  setSelectedPanelIds: (ids: string[]) => void;

  // UI State Management (from use-app-store)
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setPromptLibraryOpen: (open: boolean) => void;
  setEditingPromptId: (id: string | null) => void;

  // Command Palette
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  addCommandToHistory: (command: string) => void;

  // Prompt Management
  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (promptId: string, updates: Partial<Prompt>) => void;
  deletePrompt: (promptId: string) => void;
  incrementPromptUsage: (promptId: string) => void;
  togglePromptFavorite: (promptId: string) => void;

  // Custom Prompt Management (from use-app-store)
  addCustomPrompt: (prompt: CustomPrompt) => void;
  updateCustomPrompt: (id: string, updates: Partial<CustomPrompt>) => void;
  deleteCustomPrompt: (id: string) => void;
  applyPromptToPanel: (panelId: string, promptId: string) => void;
  // Reset custom prompts to defaults
  resetPrompts: () => void;

  // Favorites (user-saved messages)
  addFavorite: (message: ChatMessage) => void;
  removeFavorite: (messageId: string) => void;

  // Prompt History (from use-app-store)
  addPromptHistory: (item: PromptUsageHistoryItem) => void;

  // Chat History Management
  saveCurrentChat: (title?: string) => void;
  loadChatHistory: (historyId: string) => void;
  deleteChatHistory: (historyId: string) => void;
  getChatHistories: () => ChatHistory[];

  // Settings
  setTheme: (theme: "light" | "dark" | "system") => void;
  setApiKey: (provider: "gemini" | "openRouter" | string, key: string) => void;
  setDefaultModel: (panelId: string, modelId: string) => void;
  resetStore: () => void;
  savePanelData: () => void;
  loadPanelData: () => void;
  resetPanels: () => void;

  // Utilities
  generatePanelId: () => string;
  generateMessageId: () => string;
}

type ChatStore = ChatState & ChatActions;

const createInitialPanels = (count: number): ChatPanel[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `panel-${i + 1}`,
    modelId: validateModelId(
      i === 0 ? "google/gemini-2.5-flash-preview-09-2025" : "anthropic/claude-sonnet-4.5"
    ),
    messages: [],
    isLoading: false,
  }));
};

const initialState: ChatState = {
  version: STORAGE_VERSION,
  panels: createInitialPanels(2),
  activePanelIds: ["panel-1", "panel-2"],
  selectedPanelId: "panel-1",
  settings: {
    theme: "system",
    panelCount: 2,
    defaultModels: validateModelConfig({
      "panel-1": "google/gemini-2.5-flash-preview-09-2025",
      "panel-2": "anthropic/claude-sonnet-4.5",
    }),
    apiKeys: {},
    commandHistory: [],
    shortcuts: {
      "cmd+k": "openCommandPalette",
      "cmd+enter": "sendMessage",
      "cmd+/": "togglePromptLibrary",
    },
  },
  commandPaletteOpen: false,
  multiSendMode: "all",
  selectedPanelIds: ["panel-1", "panel-2"], // デフォルトで全パネルをONに

  // Additional state from use-app-store
  customPrompts: [],
  sidebarOpen: true,
  promptHistory: [],
  chatHistories: [] as ChatHistory[],
  favorites: [],

  // UI state for prompt library
  promptLibraryOpen: false,
  editingPromptId: null as string | null,
};

// Export as useAppStore for backward compatibility
export const useChatStore = create<ChatStore>()(
  persist(
    immer((set, get) => {
      // 復元されたかどうかをチェック
      const hasHydrated =
        typeof window !== "undefined" &&
        localStorage.getItem("multi-chat-store");
      if (hasHydrated) {
        logger.store("Store hydrating from localStorage");
      } else {
        logger.store("Store initializing with default state");
      }

      return {
        ...initialState,

        // Panel Management
        initializePanels: (count) =>
          set((state) => {
            state.panels = createInitialPanels(count);
            state.activePanelIds = state.panels.map((p: ChatPanel) => p.id);
            state.settings.panelCount = count;
            state.selectedPanelId = state.panels[0]?.id;
          }),

        setPanelCount: (count) =>
          set((state) => {
            const currentCount = state.panels.length;
            logger.store(`Setting panel count: ${currentCount} → ${count}`);

            if (count > currentCount) {
              // Add new panels - 既存のパネルはそのまま保持
              for (let i = currentCount; i < count; i++) {
                const panelId = `panel-${i + 1}`;
                // 既存のパネルがあるかチェック
                const existingPanel = state.panels.find(
                  (p) => p.id === panelId
                );
                if (!existingPanel) {
                  const newPanel = {
                    id: panelId,
                    modelId: validateModelId(
                      state.settings.defaultModels[panelId] ||
                        "google/gemini-2.5-flash"
                    ),
                    messages: [],
                    isLoading: false,
                  };
                  logger.panel(panelId, "Adding new panel", { modelId: newPanel.modelId });
                  state.panels.push(newPanel);
                } else {
                  logger.panel(panelId, "Panel already exists, keeping current settings");
                }

                if (!state.activePanelIds.includes(panelId)) {
                  state.activePanelIds.push(panelId);
                }
                // 新しいパネルもデフォルトでONにする
                if (!state.selectedPanelIds.includes(panelId)) {
                  state.selectedPanelIds.push(panelId);
                }
              }
            } else if (count < currentCount) {
              // Remove excess panels
              logger.store(`Removing panels: keeping first ${count}`);
              state.panels = state.panels.slice(0, count);
              state.activePanelIds = state.activePanelIds.slice(0, count);
              // selectedPanelIdsからも削除
              const validPanelIds = state.panels.map((p) => p.id);
              state.selectedPanelIds = state.selectedPanelIds.filter((id) =>
                validPanelIds.includes(id)
              );
            }

            state.settings.panelCount = count;

            // Ensure selected panel is still valid
            if (!state.activePanelIds.includes(state.selectedPanelId || "")) {
              state.selectedPanelId = state.activePanelIds[0];
            }
          }),

        selectPanel: (panelId) =>
          set((state) => {
            if (state.activePanelIds.includes(panelId)) {
              state.selectedPanelId = panelId;
            }
          }),

        setSelectedPanel: (panelId) =>
          set((state) => {
            state.selectedPanelId = panelId;
          }),

        updatePanel: (panelId, updates) =>
          set((state) => {
            const panel = state.panels.find((p: ChatPanel) => p.id === panelId);
            if (panel) {
              Object.assign(panel, updates);
            }
          }),

        setModelForPanel: (panelId, modelId) =>
          set((state) => {
            const panel = state.panels.find((p: ChatPanel) => p.id === panelId);
            if (panel) {
              const validatedModelId = validateModelId(modelId);
              logger.panel(
                panelId,
                "Setting model",
                { from: panel.modelId, to: validatedModelId }
              );
              panel.modelId = validatedModelId;
              state.settings.defaultModels[panelId] = validatedModelId;
            } else {
              logger.error(`Panel ${panelId} not found for model change`);
            }
          }),

        // Message Management
        addMessage: (panelId, message) =>
          set((state) => {
            const panel = state.panels.find((p: ChatPanel) => p.id === panelId);
            if (panel) {
              panel.messages.push(message);
            }
          }),

        updateStreamingMessage: (panelId, chunk) =>
          set((state) => {
            const panel = state.panels.find((p: ChatPanel) => p.id === panelId);
            if (panel) {
              panel.streamingMessage = (panel.streamingMessage || "") + chunk;
            }
          }),

        finalizeStreamingMessage: (panelId) =>
          set((state) => {
            const panel = state.panels.find((p: ChatPanel) => p.id === panelId);
            if (panel && panel.streamingMessage) {
              panel.messages.push({
                id: get().generateMessageId(),
                role: "assistant",
                content: panel.streamingMessage,
                timestamp: new Date(),
                panelId,
                modelId: panel.modelId,
              });
              panel.streamingMessage = undefined;
              panel.isLoading = false;
            }
          }),

        regenerateLastMessage: (panelId) =>
          set((state) => {
            const panel = state.panels.find((p: ChatPanel) => p.id === panelId);
            if (panel && panel.messages.length > 0) {
              // Find last assistant message index
              let lastAssistantIndex = -1;
              for (let i = panel.messages.length - 1; i >= 0; i--) {
                if (panel.messages[i].role === "assistant") {
                  lastAssistantIndex = i;
                  break;
                }
              }

              if (lastAssistantIndex !== -1) {
                // Keep messages up to (but not including) the last assistant message
                panel.messages = panel.messages.slice(0, lastAssistantIndex);
                panel.streamingMessage = undefined;
              }
            }
          }),

        clearPanelMessages: (panelId) =>
          set((state) => {
            const panel = state.panels.find((p: ChatPanel) => p.id === panelId);
            if (panel) {
              panel.messages = [];
              panel.streamingMessage = undefined;
            }
          }),

        clearAllMessages: () =>
          set((state) => {
            state.panels.forEach((panel: ChatPanel) => {
              panel.messages = [];
              panel.streamingMessage = undefined;
            });
          }),

        // Loading States
        setPanelLoading: (panelId, loading) =>
          set((state) => {
            const panel = state.panels.find((p: ChatPanel) => p.id === panelId);
            if (panel) {
              panel.isLoading = loading;
            }
          }),

        setPanelError: (panelId, error) =>
          set((state) => {
            const panel = state.panels.find((p: ChatPanel) => p.id === panelId);
            if (panel) {
              panel.error = error;
              panel.isLoading = false;
            }
          }),

        // Send Modes
        setSendMode: (mode) =>
          set((state) => {
            state.multiSendMode = mode;
            if (mode !== "group") {
              state.selectedPanelIds = [];
            }
          }),

        togglePanelSelection: (panelId) =>
          set((state) => {
            const index = state.selectedPanelIds.indexOf(panelId);
            if (index >= 0) {
              state.selectedPanelIds.splice(index, 1);
            } else {
              state.selectedPanelIds.push(panelId);
            }
          }),

        clearPanelSelection: () =>
          set((state) => {
            state.selectedPanelIds = [];
          }),

        // UI State (Prompt Library)
        setPromptLibraryOpen: (open) =>
          set((state) => {
            state.promptLibraryOpen = open;
          }),

        setEditingPromptId: (id) =>
          set((state) => {
            state.editingPromptId = id;
          }),

        // Command Palette
        toggleCommandPalette: () =>
          set((state) => {
            state.commandPaletteOpen = !state.commandPaletteOpen;
          }),

        setCommandPaletteOpen: (open) =>
          set((state) => {
            state.commandPaletteOpen = open;
          }),

        addCommandToHistory: (command) =>
          set((state) => {
            state.settings.commandHistory = [
              command,
              ...state.settings.commandHistory.filter(
                (c: string) => c !== command
              ),
            ].slice(0, 50); // Keep last 50 commands
          }),

        // Prompt Management (using customPrompts)
        addPrompt: (prompt) =>
          set((state) => {
            state.customPrompts.push(prompt);
          }),

        updatePrompt: (promptId, updates) =>
          set((state) => {
            const prompt = state.customPrompts.find((p: Prompt) => p.id === promptId);
            if (prompt) {
              Object.assign(prompt, updates, { updatedAt: new Date() });
            }
          }),

        deletePrompt: (promptId) =>
          set((state) => {
            state.customPrompts = state.customPrompts.filter(
              (p: Prompt) => p.id !== promptId
            );
          }),

        incrementPromptUsage: (promptId) =>
          set((state) => {
            const prompt = state.customPrompts.find((p: Prompt) => p.id === promptId);
            if (prompt) {
              prompt.usageCount++;
              prompt.lastUsed = new Date();
            }
          }),

        togglePromptFavorite: (promptId) =>
          set((state) => {
            const prompt = state.customPrompts.find((p: Prompt) => p.id === promptId);
            if (prompt) {
              prompt.isFavorite = !prompt.isFavorite;
            }
          }),

        // Settings
        setTheme: (theme) =>
          set((state) => {
            state.settings.theme = theme;
          }),

        setApiKey: (provider, key) =>
          set((state) => {
            state.settings.apiKeys[provider] = key;
          }),

        setDefaultModel: (panelId, modelId) =>
          set((state) => {
            state.settings.defaultModels[panelId] = validateModelId(modelId);
          }),

        savePanelData: () => {
          // Data is auto-persisted by zustand persist middleware
          logger.store("Panel data saved automatically");
        },

        loadPanelData: () => {
          // Data is auto-loaded by zustand persist middleware
          logger.store("Panel data loaded automatically");
        },

        resetPanels: () =>
          set((state) => {
            const panelCount = state.activePanelIds.length || 2;
            state.panels = createInitialPanels(panelCount);
            state.customPrompts = DEFAULT_PROMPTS;
          }),

        // UI State Management (from use-app-store)
        toggleSidebar: () =>
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          }),

        setSidebarOpen: (open) =>
          set((state) => {
            state.sidebarOpen = open;
          }),

        setSelectedPanelIds: (ids) =>
          set((state) => {
            state.selectedPanelIds = ids;
          }),

        // Custom Prompt Management (from use-app-store)
        addCustomPrompt: (prompt) =>
          set((state) => {
            state.customPrompts.push(prompt);
          }),

        resetPrompts: () =>
          set((state) => {
            state.customPrompts = JSON.parse(JSON.stringify(DEFAULT_PROMPTS));
            logger.store("Prompts reset to defaults", { count: state.customPrompts.length });
          }),

        // Favorites management
        addFavorite: (message: ChatMessage) =>
          set((state) => {
            // Prevent duplicates
            if (!state.favorites.find((f) => f.id === message.id)) {
              state.favorites.push(message);
              logger.debug("Added favorite:", message.id);
            } else {
              logger.debug("Favorite already exists:", message.id);
            }
          }),

        removeFavorite: (messageId: string) =>
          set((state) => {
            state.favorites = state.favorites.filter((m) => m.id !== messageId);
            logger.debug("Removed favorite:", messageId);
          }),

        updateCustomPrompt: (id, updates) =>
          set((state) => {
            const prompt = state.customPrompts.find(
              (p: CustomPrompt) => p.id === id
            );
            if (prompt) {
              Object.assign(prompt, { ...updates, updatedAt: new Date() });
            }
          }),

        deleteCustomPrompt: (id) =>
          set((state) => {
            state.customPrompts = state.customPrompts.filter(
              (p: CustomPrompt) => p.id !== id
            );
          }),

        applyPromptToPanel: (panelId, promptId) =>
          set((state) => {
            const prompt = state.customPrompts.find(
              (p: CustomPrompt) => p.id === promptId
            );
            const panel = state.panels.find((p: ChatPanel) => p.id === panelId);
            if (prompt && panel) {
              panel.customPrompt = prompt;
            }
          }),

        // Prompt History (from use-app-store)
        addPromptHistory: (item) =>
          set((state) => {
            state.promptHistory = [item, ...state.promptHistory].slice(0, 100);
          }),

        // Chat History Management
        saveCurrentChat: (title) =>
          set((state) => {
            // タイトルが指定されなければ、最初のメッセージから生成
            const autoTitle =
              title ||
              (() => {
                for (const panel of state.panels) {
                  if (panel.messages.length > 0) {
                    const firstUserMessage = panel.messages.find(
                      (m) => m.role === "user"
                    );
                    if (firstUserMessage) {
                      return firstUserMessage.content.slice(0, 20) + "...";
                    }
                  }
                }
                return `チャット ${new Date().toLocaleDateString()}`;
              })();

            const history: ChatHistory = {
              id: generateId(),
              title: autoTitle,
              timestamp: new Date(),
              panels: JSON.parse(JSON.stringify(state.panels)), // Deep copy
              modelIds: state.panels.reduce((acc, panel) => {
                acc[panel.id] = panel.modelId;
                return acc;
              }, {} as Record<string, string>),
            };

            state.chatHistories = [history, ...state.chatHistories].slice(
              0,
              50
            ); // 最大50個保存
          }),

        loadChatHistory: (historyId) =>
          set((state) => {
            const history = state.chatHistories.find((h) => h.id === historyId);
            if (history) {
              state.panels = JSON.parse(JSON.stringify(history.panels)); // Deep copy
              // Loading states をリセット
              state.panels.forEach((panel) => {
                panel.isLoading = false;
                panel.error = undefined;
              });
            }
          }),

        deleteChatHistory: (historyId) =>
          set((state) => {
            state.chatHistories = state.chatHistories.filter(
              (h) => h.id !== historyId
            );
          }),

        getChatHistories: () => get().chatHistories,

        // Store reset
        resetStore: () => set(() => initialState),

        // Utilities
        generatePanelId: () => generateId("panel"),
        generateMessageId: () => generateId("msg"),
      };
    }),
    {
      name: "multi-chat-store",
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),

      // Migration function - runs when version changes
      migrate: (persistedState: any, version: number) => {
        logger.store("Running migration", { from: version, to: STORAGE_VERSION });

        // Migration from version 0/1 to version 2
        if (version < 2) {
          logger.store("Migrating to v2: clearing old prompts and data");

          // Clear old prompts and reset to empty state
          return {
            ...persistedState,
            version: STORAGE_VERSION,
            customPrompts: [],  // Clear old default prompts
            promptHistory: [],  // Clear prompt history
          };
        }

        return persistedState;
      },

      // すべての状態を永続化（一時的なテスト）
      partialize: (state) => {
        // Loading状態など一時的なものを除外
        const { commandPaletteOpen, ...persistedState } = state;

        // パネルのloading状態をリセット
        const cleanedState = {
          ...persistedState,
          version: STORAGE_VERSION,  // Always persist current version
          panels: persistedState.panels.map((panel) => ({
            ...panel,
            isLoading: false,
            error: undefined,
          })),
        };

        logger.store("Persisting state", {
          version: STORAGE_VERSION,
          panelCount: cleanedState.panels.length,
          panelModels: cleanedState.panels.map((p) => ({
            id: p.id,
            modelId: p.modelId,
          })),
          selectedPanelIds: cleanedState.selectedPanelIds,
        });

        return cleanedState;
      },

      // 復元時の処理
      onRehydrateStorage: () => (state) => {
        if (state) {
          logger.store("Store rehydrated from localStorage", {
            version: state.version,
            panelCount: state.panels.length,
            panelModels: state.panels.map((p) => ({
              id: p.id,
              modelId: p.modelId,
            })),
            selectedPanelIds: state.selectedPanelIds,
          });

          // activePanelIdsとpanelsの整合性チェック
          const expectedIds = state.panels.map((p) => p.id);
          if (
            JSON.stringify(state.activePanelIds.sort()) !==
            JSON.stringify(expectedIds.sort())
          ) {
            logger.store(
              "Fixing activePanelIds",
              { from: state.activePanelIds, to: expectedIds }
            );
            state.activePanelIds = expectedIds;
          }
        }
      },
    }
  )
);

// Backward compatibility export
export const useAppStore = useChatStore;
