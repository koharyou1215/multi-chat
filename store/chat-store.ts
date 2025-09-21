import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { ChatState, ChatPanel, ChatMessage, Prompt, CustomPrompt, SendMode, AppSettings, PromptUsageHistoryItem } from '@/types'
import { generateId } from '@/lib/utils'
import { validateModelId, validateModelConfig } from '@/lib/model-validator'

interface ChatActions {
  // Panel Management
  initializePanels: (count: number) => void
  setPanelCount: (count: number) => void
  selectPanel: (panelId: string) => void
  setSelectedPanel: (panelId: string) => void // Alias for compatibility
  setModelForPanel: (panelId: string, modelId: string) => void
  updatePanel: (panelId: string, updates: Partial<ChatPanel>) => void

  // Message Management
  addMessage: (panelId: string, message: ChatMessage) => void
  updateStreamingMessage: (panelId: string, chunk: string) => void
  finalizeStreamingMessage: (panelId: string) => void
  clearPanelMessages: (panelId: string) => void
  clearAllMessages: () => void

  // Loading States
  setPanelLoading: (panelId: string, loading: boolean) => void
  setPanelError: (panelId: string, error?: string) => void

  // Send Modes
  setSendMode: (mode: SendMode) => void
  setMultiSendMode: (mode: SendMode) => void // Alias for compatibility
  toggleGroupPanel: (panelId: string) => void
  toggleMultiSendPanel: (panelId: string) => void // For multiSendIds compatibility
  clearGroupedPanels: () => void
  clearMultiSend: () => void
  setGroupedPanelIds: (ids: string[]) => void

  // UI State Management (from use-app-store)
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Command Palette
  toggleCommandPalette: () => void
  setCommandPaletteOpen: (open: boolean) => void
  addCommandToHistory: (command: string) => void

  // Prompt Management
  addPrompt: (prompt: Prompt) => void
  updatePrompt: (promptId: string, updates: Partial<Prompt>) => void
  deletePrompt: (promptId: string) => void
  incrementPromptUsage: (promptId: string) => void
  togglePromptFavorite: (promptId: string) => void

  // Custom Prompt Management (from use-app-store)
  addCustomPrompt: (prompt: CustomPrompt) => void
  updateCustomPrompt: (id: string, updates: Partial<CustomPrompt>) => void
  deleteCustomPrompt: (id: string) => void
  applyPromptToPanel: (panelId: string, promptId: string) => void

  // Prompt History (from use-app-store)
  addPromptHistory: (item: PromptUsageHistoryItem) => void

  // Settings
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setApiKey: (provider: 'gemini' | 'openRouter' | string, key: string) => void
  setDefaultModel: (panelId: string, modelId: string) => void
  resetStore: () => void

  // Utilities
  generatePanelId: () => string
  generateMessageId: () => string
}

type ChatStore = ChatState & ChatActions

const createInitialPanels = (count: number): ChatPanel[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `panel-${i + 1}`,
    modelId: validateModelId(i === 0 ? 'google/gemini-2.5-flash' : 'anthropic/claude-sonnet-4'),
    messages: [],
    isLoading: false,
  }))
}

const initialState: ChatState = {
  panels: createInitialPanels(2),
  activePanelIds: ['panel-1', 'panel-2'],
  selectedPanelId: 'panel-1',
  prompts: [],
  settings: {
    theme: 'system',
    panelCount: 2,
    defaultModels: validateModelConfig({
      'panel-1': 'google/gemini-2.5-flash',
      'panel-2': 'anthropic/claude-sonnet-4',
    }),
    apiKeys: {},
    commandHistory: [],
    shortcuts: {
      'cmd+k': 'openCommandPalette',
      'cmd+enter': 'sendMessage',
      'cmd+/': 'togglePromptLibrary',
    },
  },
  commandPaletteOpen: false,
  multiSendMode: 'all',
  groupedPanelIds: [],

  // Additional state from use-app-store
  activePanels: 2,
  customPrompts: [],
  sidebarOpen: true,
  multiSendIds: [],
  promptHistory: [],
  openRouterApiKey: '',
}

export const useChatStore = create<ChatStore>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Panel Management
      initializePanels: (count) => set((state) => {
        state.panels = createInitialPanels(count)
        state.activePanelIds = state.panels.map((p: ChatPanel) => p.id)
        state.settings.panelCount = count
        state.selectedPanelId = state.panels[0]?.id
      }),

      setPanelCount: (count) => set((state) => {
        const currentCount = state.panels.length

        if (count > currentCount) {
          // Add new panels
          for (let i = currentCount; i < count; i++) {
            const panelId = `panel-${i + 1}`
            state.panels.push({
              id: panelId,
              modelId: validateModelId(state.settings.defaultModels[panelId] || 'google/gemini-2.5-flash'),
              messages: [],
              isLoading: false,
            })
            state.activePanelIds.push(panelId)
          }
        } else if (count < currentCount) {
          // Remove excess panels
          state.panels = state.panels.slice(0, count)
          state.activePanelIds = state.activePanelIds.slice(0, count)
        }

        state.settings.panelCount = count
        state.activePanels = count  // Keep legacy field in sync

        // Ensure selected panel is still valid
        if (!state.activePanelIds.includes(state.selectedPanelId || '')) {
          state.selectedPanelId = state.activePanelIds[0]
        }
      }),

      selectPanel: (panelId) => set((state) => {
        if (state.activePanelIds.includes(panelId)) {
          state.selectedPanelId = panelId
        }
      }),

      setSelectedPanel: (panelId) => set((state) => {
        state.selectedPanelId = panelId
      }),

      updatePanel: (panelId, updates) => set((state) => {
        const panel = state.panels.find((p: ChatPanel) => p.id === panelId)
        if (panel) {
          Object.assign(panel, updates)
        }
      }),

      setModelForPanel: (panelId, modelId) => set((state) => {
        const panel = state.panels.find((p: ChatPanel) => p.id === panelId)
        if (panel) {
          const validatedModelId = validateModelId(modelId)
          panel.modelId = validatedModelId
          state.settings.defaultModels[panelId] = validatedModelId
        }
      }),

      // Message Management
      addMessage: (panelId, message) => set((state) => {
        const panel = state.panels.find((p: ChatPanel) => p.id === panelId)
        if (panel) {
          panel.messages.push(message)
        }
      }),

      updateStreamingMessage: (panelId, chunk) => set((state) => {
        const panel = state.panels.find((p: ChatPanel) => p.id === panelId)
        if (panel) {
          panel.streamingMessage = (panel.streamingMessage || '') + chunk
        }
      }),

      finalizeStreamingMessage: (panelId) => set((state) => {
        const panel = state.panels.find((p: ChatPanel) => p.id === panelId)
        if (panel && panel.streamingMessage) {
          panel.messages.push({
            id: get().generateMessageId(),
            role: 'assistant',
            content: panel.streamingMessage,
            timestamp: new Date(),
            panelId,
            modelId: panel.modelId,
          })
          panel.streamingMessage = undefined
          panel.isLoading = false
        }
      }),

      clearPanelMessages: (panelId) => set((state) => {
        const panel = state.panels.find((p: ChatPanel) => p.id === panelId)
        if (panel) {
          panel.messages = []
          panel.streamingMessage = undefined
        }
      }),

      clearAllMessages: () => set((state) => {
        state.panels.forEach((panel: ChatPanel) => {
          panel.messages = []
          panel.streamingMessage = undefined
        })
      }),

      // Loading States
      setPanelLoading: (panelId, loading) => set((state) => {
        const panel = state.panels.find((p: ChatPanel) => p.id === panelId)
        if (panel) {
          panel.isLoading = loading
        }
      }),

      setPanelError: (panelId, error) => set((state) => {
        const panel = state.panels.find((p: ChatPanel) => p.id === panelId)
        if (panel) {
          panel.error = error
          panel.isLoading = false
        }
      }),

      // Send Modes
      setSendMode: (mode) => set((state) => {
        state.multiSendMode = mode
        if (mode !== 'group') {
          state.groupedPanelIds = []
        }
      }),

      toggleGroupPanel: (panelId) => set((state) => {
        const index = state.groupedPanelIds.indexOf(panelId)
        if (index >= 0) {
          state.groupedPanelIds.splice(index, 1)
        } else {
          state.groupedPanelIds.push(panelId)
        }
      }),

      clearGroupedPanels: () => set((state) => {
        state.groupedPanelIds = []
      }),

      // Command Palette
      toggleCommandPalette: () => set((state) => {
        state.commandPaletteOpen = !state.commandPaletteOpen
      }),

      setCommandPaletteOpen: (open) => set((state) => {
        state.commandPaletteOpen = open
      }),

      addCommandToHistory: (command) => set((state) => {
        state.settings.commandHistory = [
          command,
          ...state.settings.commandHistory.filter((c: string) => c !== command)
        ].slice(0, 50) // Keep last 50 commands
      }),

      // Prompt Management
      addPrompt: (prompt) => set((state) => {
        state.prompts.push(prompt)
      }),

      updatePrompt: (promptId, updates) => set((state) => {
        const prompt = state.prompts.find((p: Prompt) => p.id === promptId)
        if (prompt) {
          Object.assign(prompt, updates, { updatedAt: new Date() })
        }
      }),

      deletePrompt: (promptId) => set((state) => {
        state.prompts = state.prompts.filter((p: Prompt) => p.id !== promptId)
      }),

      incrementPromptUsage: (promptId) => set((state) => {
        const prompt = state.prompts.find((p: Prompt) => p.id === promptId)
        if (prompt) {
          prompt.usageCount++
          prompt.lastUsed = new Date()
        }
      }),

      togglePromptFavorite: (promptId) => set((state) => {
        const prompt = state.prompts.find((p: Prompt) => p.id === promptId)
        if (prompt) {
          prompt.isFavorite = !prompt.isFavorite
        }
      }),

      // Settings
      setTheme: (theme) => set((state) => {
        state.settings.theme = theme
      }),

      setApiKey: (provider, key) => set((state) => {
        state.settings.apiKeys[provider] = key
      }),

      setDefaultModel: (panelId, modelId) => set((state) => {
        state.settings.defaultModels[panelId] = validateModelId(modelId)
      }),

      // UI State Management (from use-app-store)
      toggleSidebar: () => set((state) => {
        state.sidebarOpen = !state.sidebarOpen
      }),

      setSidebarOpen: (open) => set((state) => {
        state.sidebarOpen = open
      }),

      // Multi-Send compatibility
      setMultiSendMode: (mode) => set((state) => {
        state.multiSendMode = mode
      }),

      toggleMultiSendPanel: (panelId) => set((state) => {
        const exists = state.multiSendIds.includes(panelId)
        if (exists) {
          state.multiSendIds = state.multiSendIds.filter((id: string) => id !== panelId)
        } else {
          state.multiSendIds.push(panelId)
        }
        // Sync with groupedPanelIds for compatibility
        state.groupedPanelIds = [...state.multiSendIds]
      }),

      clearMultiSend: () => set((state) => {
        state.multiSendIds = []
        state.groupedPanelIds = []
      }),

      setGroupedPanelIds: (ids) => set((state) => {
        state.groupedPanelIds = ids
        state.multiSendIds = [...ids]  // Keep in sync
      }),

      // Custom Prompt Management (from use-app-store)
      addCustomPrompt: (prompt) => set((state) => {
        state.customPrompts.push(prompt)
      }),

      updateCustomPrompt: (id, updates) => set((state) => {
        const prompt = state.customPrompts.find((p: CustomPrompt) => p.id === id)
        if (prompt) {
          Object.assign(prompt, { ...updates, updatedAt: new Date() })
        }
      }),

      deleteCustomPrompt: (id) => set((state) => {
        state.customPrompts = state.customPrompts.filter((p: CustomPrompt) => p.id !== id)
      }),

      applyPromptToPanel: (panelId, promptId) => set((state) => {
        const prompt = state.customPrompts.find((p: CustomPrompt) => p.id === promptId)
        const panel = state.panels.find((p: ChatPanel) => p.id === panelId)
        if (prompt && panel) {
          panel.customPrompt = prompt
        }
      }),

      // Prompt History (from use-app-store)
      addPromptHistory: (item) => set((state) => {
        state.promptHistory = [item, ...state.promptHistory].slice(0, 100)
      }),

      // Store reset
      resetStore: () => set(() => initialState),

      // Utilities
      generatePanelId: () => generateId('panel'),
      generateMessageId: () => generateId('msg'),
    })),
    {
      name: 'multi-chat-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        prompts: state.prompts,
        customPrompts: state.customPrompts,
        settings: state.settings,
        promptHistory: state.promptHistory,
        sidebarOpen: state.sidebarOpen,
        openRouterApiKey: state.openRouterApiKey,
        // Don't persist panels, messages, or temporary UI states
      }),
    }
  )
)