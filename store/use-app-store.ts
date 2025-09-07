import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  ChatPanel,
  CustomPrompt,
  ChatMessage,
  AIModel,
  PromptUsageHistoryItem,
} from "@/types";
import { availableModels } from "@/lib/models";

interface AppStore {
  panels: ChatPanel[];
  activePanels: number;
  customPrompts: CustomPrompt[];
  openRouterApiKey: string;
  selectedPanelId: string | null;
  sidebarOpen: boolean;
  multiSendIds: string[];
  promptHistory: PromptUsageHistoryItem[];

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

  // Settings
  setApiKey: (key: string) => void;
  resetStore: () => void;
}

const createDefaultPanel = (id: string): ChatPanel => ({
  id,
  modelId: "anthropic/claude-sonnet-4",
  messages: [],
  isLoading: false,
});

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      panels: [createDefaultPanel("panel-1")],
      activePanels: 1,
      customPrompts: [],
      openRouterApiKey: "",
      selectedPanelId: "panel-1",
      sidebarOpen: true,
      multiSendIds: [],
      promptHistory: [],

      setPanelCount: (count: number) => {
        const { panels } = get();
        const newPanels = [...panels];

        if (count > panels.length) {
          for (let i = panels.length; i < count; i++) {
            newPanels.push(createDefaultPanel(`panel-${i + 1}`));
          }
        } else if (count < panels.length) {
          newPanels.splice(count);
        }

        // ensure selected panel is within range
        const currentSelected = get().selectedPanelId;
        const validSelected =
          currentSelected && Number(currentSelected.split("-")[1]) <= count
            ? currentSelected
            : "panel-1";

        set({
          panels: newPanels,
          activePanels: count,
          selectedPanelId: validSelected,
        });
      },

      updatePanel: (panelId: string, updates: Partial<ChatPanel>) => {
        set((state) => ({
          panels: state.panels.map((panel) =>
            panel.id === panelId ? { ...panel, ...updates } : panel
          ),
        }));
      },

      addMessage: (panelId: string, message: ChatMessage) => {
        set((state) => ({
          panels: state.panels.map((panel) =>
            panel.id === panelId
              ? { ...panel, messages: [...panel.messages, message] }
              : panel
          ),
        }));
      },

      setModelForPanel: (panelId: string, modelId: string) => {
        set((state) => ({
          panels: state.panels.map((panel) =>
            panel.id === panelId ? { ...panel, modelId } : panel
          ),
        }));
      },

      clearPanelMessages: (panelId: string) => {
        set((state) => ({
          panels: state.panels.map((panel) =>
            panel.id === panelId ? { ...panel, messages: [] } : panel
          ),
        }));
      },

      setSelectedPanel: (panelId: string) => {
        set({ selectedPanelId: panelId });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      toggleMultiSendPanel: (panelId: string) => {
        set((state) => {
          const exists = state.multiSendIds.includes(panelId);
          const next = exists
            ? state.multiSendIds.filter((id) => id !== panelId)
            : [...state.multiSendIds, panelId];
          return { multiSendIds: next };
        });
      },

      clearMultiSend: () => set({ multiSendIds: [] }),

      addPromptHistory: (item: PromptUsageHistoryItem) => {
        set((state) => ({
          promptHistory: [item, ...state.promptHistory].slice(0, 100),
        }));
      },

      addCustomPrompt: (prompt: CustomPrompt) => {
        set((state) => ({
          customPrompts: [...state.customPrompts, prompt],
        }));
      },

      updateCustomPrompt: (id: string, updates: Partial<CustomPrompt>) => {
        set((state) => ({
          customPrompts: state.customPrompts.map((prompt) =>
            prompt.id === id
              ? { ...prompt, ...updates, updatedAt: new Date() }
              : prompt
          ),
        }));
      },

      deleteCustomPrompt: (id: string) => {
        set((state) => ({
          customPrompts: state.customPrompts.filter(
            (prompt) => prompt.id !== id
          ),
        }));
      },

      applyPromptToPanel: (panelId: string, promptId: string) => {
        const { customPrompts } = get();
        const prompt = customPrompts.find((p) => p.id === promptId);
        if (prompt) {
          set((state) => ({
            panels: state.panels.map((panel) =>
              panel.id === panelId ? { ...panel, customPrompt: prompt } : panel
            ),
          }));
        }
      },

      setApiKey: (key: string) => {
        set({ openRouterApiKey: key });
      },

      resetStore: () => {
        set({
          panels: [createDefaultPanel("panel-1")],
          activePanels: 1,
          customPrompts: [],
          openRouterApiKey: "",
          selectedPanelId: "panel-1",
          sidebarOpen: true,
          multiSendIds: [],
          promptHistory: [],
        });
      },
    }),
    {
      name: "multi-chat-storage",
      partialize: (state) => ({
        customPrompts: state.customPrompts,
        openRouterApiKey: state.openRouterApiKey,
        activePanels: state.activePanels,
        selectedPanelId: state.selectedPanelId,
        sidebarOpen: state.sidebarOpen,
        multiSendIds: state.multiSendIds,
        promptHistory: state.promptHistory,
      }),
    }
  )
);
