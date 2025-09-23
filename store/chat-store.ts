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
import { validateModelId, validateModelConfig } from "@/lib/model-validator";

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
  clearPanelMessages: (panelId: string) => void;
  clearAllMessages: () => void;

  // Loading States
  setPanelLoading: (panelId: string, loading: boolean) => void;
  setPanelError: (panelId: string, error?: string) => void;

  // Send Modes
  setSendMode: (mode: SendMode) => void;
  setMultiSendMode: (mode: SendMode) => void; // Alias for compatibility
  toggleGroupPanel: (panelId: string) => void;
  toggleMultiSendPanel: (panelId: string) => void; // For multiSendIds compatibility
  clearGroupedPanels: () => void;
  clearMultiSend: () => void;
  setGroupedPanelIds: (ids: string[]) => void;

  // UI State Management (from use-app-store)
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

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

  // Utilities
  generatePanelId: () => string;
  generateMessageId: () => string;
}

type ChatStore = ChatState & ChatActions;

const createInitialPanels = (count: number): ChatPanel[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `panel-${i + 1}`,
    modelId: validateModelId(
      i === 0 ? "google/gemini-2.5-flash" : "anthropic/claude-sonnet-4"
    ),
    messages: [],
    isLoading: false,
  }));
};

const initialState: ChatState = {
  panels: createInitialPanels(2),
  activePanelIds: ["panel-1", "panel-2"],
  selectedPanelId: "panel-1",
  prompts: [],
  settings: {
    theme: "system",
    panelCount: 2,
    defaultModels: validateModelConfig({
      "panel-1": "google/gemini-2.5-flash",
      "panel-2": "anthropic/claude-sonnet-4",
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
  groupedPanelIds: [],

  // Additional state from use-app-store
  activePanels: 2,
  customPrompts: [],
  sidebarOpen: true,
  multiSendIds: ["panel-1", "panel-2"], // デフォルトで全パネルをONに
  promptHistory: [],
  openRouterApiKey: "",
  chatHistories: [] as ChatHistory[],
  favorites: [],
};

export const useChatStore = create<ChatStore>()(
  persist(
    immer((set, get) => {
      // 復元されたかどうかをチェック
      const hasHydrated =
        typeof window !== "undefined" &&
        localStorage.getItem("multi-chat-store");
      if (hasHydrated) {
        console.log("🔄 Store hydrating from localStorage");
      } else {
        console.log("🆕 Store initializing with default state");
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
            console.log(`🔢 Setting panel count: ${currentCount} → ${count}`);

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
                  console.log(
                    `➕ Adding new panel: ${panelId} with model ${newPanel.modelId}`
                  );
                  state.panels.push(newPanel);
                } else {
                  console.log(
                    `🔄 Panel ${panelId} already exists, keeping current settings`
                  );
                }

                if (!state.activePanelIds.includes(panelId)) {
                  state.activePanelIds.push(panelId);
                }
                // 新しいパネルもデフォルトでONにする
                if (!state.multiSendIds.includes(panelId)) {
                  state.multiSendIds.push(panelId);
                }
              }
            } else if (count < currentCount) {
              // Remove excess panels
              console.log(`➖ Removing panels: keeping first ${count}`);
              state.panels = state.panels.slice(0, count);
              state.activePanelIds = state.activePanelIds.slice(0, count);
              // multiSendIdsからも削除
              const validPanelIds = state.panels.map((p) => p.id);
              state.multiSendIds = state.multiSendIds.filter((id) =>
                validPanelIds.includes(id)
              );
            }

            state.settings.panelCount = count;
            state.activePanels = count; // Keep legacy field in sync

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
              console.log(
                `🔄 Setting model for ${panelId}: ${panel.modelId} → ${validatedModelId}`
              );
              panel.modelId = validatedModelId;
              state.settings.defaultModels[panelId] = validatedModelId;
            } else {
              console.log(`❌ Panel ${panelId} not found for model change`);
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
              state.groupedPanelIds = [];
            }
          }),

        toggleGroupPanel: (panelId) =>
          set((state) => {
            const index = state.groupedPanelIds.indexOf(panelId);
            if (index >= 0) {
              state.groupedPanelIds.splice(index, 1);
            } else {
              state.groupedPanelIds.push(panelId);
            }
          }),

        clearGroupedPanels: () =>
          set((state) => {
            state.groupedPanelIds = [];
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

        // Prompt Management
        addPrompt: (prompt) =>
          set((state) => {
            state.prompts.push(prompt);
          }),

        updatePrompt: (promptId, updates) =>
          set((state) => {
            const prompt = state.prompts.find((p: Prompt) => p.id === promptId);
            if (prompt) {
              Object.assign(prompt, updates, { updatedAt: new Date() });
            }
          }),

        deletePrompt: (promptId) =>
          set((state) => {
            state.prompts = state.prompts.filter(
              (p: Prompt) => p.id !== promptId
            );
          }),

        incrementPromptUsage: (promptId) =>
          set((state) => {
            const prompt = state.prompts.find((p: Prompt) => p.id === promptId);
            if (prompt) {
              prompt.usageCount++;
              prompt.lastUsed = new Date();
            }
          }),

        togglePromptFavorite: (promptId) =>
          set((state) => {
            const prompt = state.prompts.find((p: Prompt) => p.id === promptId);
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

        // UI State Management (from use-app-store)
        toggleSidebar: () =>
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          }),

        setSidebarOpen: (open) =>
          set((state) => {
            state.sidebarOpen = open;
          }),

        // Multi-Send compatibility
        setMultiSendMode: (mode) =>
          set((state) => {
            state.multiSendMode = mode;
          }),

        toggleMultiSendPanel: (panelId) =>
          set((state) => {
            const exists = state.multiSendIds.includes(panelId);
            if (exists) {
              state.multiSendIds = state.multiSendIds.filter(
                (id: string) => id !== panelId
              );
            } else {
              state.multiSendIds.push(panelId);
            }
            // Sync with groupedPanelIds for compatibility
            state.groupedPanelIds = [...state.multiSendIds];
          }),

        clearMultiSend: () =>
          set((state) => {
            state.multiSendIds = [];
            state.groupedPanelIds = [];
          }),

        setGroupedPanelIds: (ids) =>
          set((state) => {
            state.groupedPanelIds = ids;
            state.multiSendIds = [...ids]; // Keep in sync
          }),

        // Custom Prompt Management (from use-app-store)
        addCustomPrompt: (prompt) =>
          set((state) => {
            state.customPrompts.push(prompt);
          }),

        // Favorites management
        addFavorite: (message) =>
          set((state) => {
            // Prevent duplicates
            if (!state.favorites.find((f) => f.id === message.id)) {
              state.favorites.push(message);
              console.log("⭐ Added favorite:", message.id);
            } else {
              console.log("⭐ Favorite already exists:", message.id);
            }
          }),

        removeFavorite: (messageId) =>
          set((state) => {
            state.favorites = state.favorites.filter((m) => m.id !== messageId);
            console.log("🗑️ Removed favorite:", messageId);
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
      storage: createJSONStorage(() => localStorage),

      // すべての状態を永続化（一時的なテスト）
      partialize: (state) => {
        // Loading状態など一時的なものを除外
        const { commandPaletteOpen, ...persistedState } = state;

        // パネルのloading状態をリセット
        const cleanedState = {
          ...persistedState,
          panels: persistedState.panels.map((panel) => ({
            ...panel,
            isLoading: false,
            error: undefined,
          })),
        };

        console.log("💾 Persisting state:", {
          panelCount: cleanedState.panels.length,
          panelModels: cleanedState.panels.map((p) => ({
            id: p.id,
            modelId: p.modelId,
          })),
          multiSendIds: cleanedState.multiSendIds,
        });

        return cleanedState;
      },

      // 復元時の処理
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("🔄 Store rehydrated from localStorage:", {
            panelCount: state.panels.length,
            panelModels: state.panels.map((p) => ({
              id: p.id,
              modelId: p.modelId,
            })),
            multiSendIds: state.multiSendIds,
          });

          // 復元後の整合性チェック
          if (state.panels.length !== state.activePanels) {
            console.log(
              `🔧 Fixing activePanels: ${state.activePanels} → ${state.panels.length}`
            );
            state.activePanels = state.panels.length;
          }

          // activePanelIdsとpanelsの整合性チェック
          const expectedIds = state.panels.map((p) => p.id);
          if (
            JSON.stringify(state.activePanelIds.sort()) !==
            JSON.stringify(expectedIds.sort())
          ) {
            console.log(
              `🔧 Fixing activePanelIds:`,
              state.activePanelIds,
              "→",
              expectedIds
            );
            state.activePanelIds = expectedIds;
          }
        }
      },
    }
  )
);
