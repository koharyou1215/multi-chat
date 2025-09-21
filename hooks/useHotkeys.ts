import { useEffect, useCallback } from 'react'
import { HOTKEYS } from '@/lib/utils/constants'

type HotkeyHandler = (event: KeyboardEvent) => void

interface HotkeyOptions {
  enabled?: boolean
  preventDefault?: boolean
}

/**
 * Parse hotkey string into key combinations
 * Example: "cmd+k,ctrl+k" -> [{ cmd: true, key: 'k' }, { ctrl: true, key: 'k' }]
 */
function parseHotkey(hotkey: string) {
  return hotkey.split(',').map(combo => {
    const parts = combo.trim().toLowerCase().split('+')
    const key = parts.pop() || ''
    const modifiers = {
      cmd: parts.includes('cmd'),
      ctrl: parts.includes('ctrl'),
      alt: parts.includes('alt'),
      shift: parts.includes('shift'),
      meta: parts.includes('cmd') || parts.includes('meta')
    }
    return { key, ...modifiers }
  })
}

/**
 * Check if keyboard event matches hotkey combination
 */
function matchesHotkey(event: KeyboardEvent, combo: ReturnType<typeof parseHotkey>[0]) {
  const keyMatches = event.key.toLowerCase() === combo.key
  const metaMatches = combo.meta ? event.metaKey || event.ctrlKey : true
  const ctrlMatches = combo.ctrl ? event.ctrlKey : !combo.ctrl ? !event.ctrlKey : true
  const altMatches = combo.alt ? event.altKey : !combo.alt ? !event.altKey : true
  const shiftMatches = combo.shift ? event.shiftKey : !combo.shift ? !event.shiftKey : true

  return keyMatches && metaMatches && ctrlMatches && altMatches && shiftMatches
}

/**
 * Hook for handling keyboard shortcuts
 */
export function useHotkey(
  hotkey: string,
  handler: HotkeyHandler,
  options: HotkeyOptions = {}
) {
  const { enabled = true, preventDefault = true } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    const combinations = parseHotkey(hotkey)
    const matches = combinations.some(combo => matchesHotkey(event, combo))

    if (matches) {
      if (preventDefault) {
        event.preventDefault()
      }
      handler(event)
    }
  }, [hotkey, handler, enabled, preventDefault])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Hook for handling multiple hotkeys
 */
export function useHotkeys(
  hotkeys: Record<string, HotkeyHandler>,
  options: HotkeyOptions = {}
) {
  const { enabled = true, preventDefault = true } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    for (const [hotkey, handler] of Object.entries(hotkeys)) {
      const combinations = parseHotkey(hotkey)
      const matches = combinations.some(combo => matchesHotkey(event, combo))

      if (matches) {
        if (preventDefault) {
          event.preventDefault()
        }
        handler(event)
        break // Only handle first matching hotkey
      }
    }
  }, [hotkeys, enabled, preventDefault])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Pre-configured hotkeys for common actions
 */
export function useAppHotkeys() {
  const { useChatStore } = require('@/store/chat-store')
  const { useAppStore } = require('@/store/use-app-store')
  const store = useChatStore()
  const appStore = useAppStore()

  // Build dynamic hotkeys for Ctrl+1-9
  const promptHotkeys: Record<string, HotkeyHandler> = {}
  for (let i = 1; i <= 9; i++) {
    promptHotkeys[`ctrl+${i},cmd+${i}`] = () => {
      const index = i - 1
      const customPrompts = appStore.customPrompts
      if (index < customPrompts.length) {
        const prompt = customPrompts[index]

        // Apply to all active panels
        appStore.panels.slice(0, appStore.activePanels).forEach((panel: any) => {
          appStore.updatePanel(panel.id, {
            customPrompt: prompt,
            systemPrompt: prompt.content
          })
        })
      }
    }
  }

  useHotkeys({
    [HOTKEYS.COMMAND_PALETTE]: () => {
      store.toggleCommandPalette()
    },
    [HOTKEYS.SEND_MESSAGE]: () => {
      // Will be connected to send message action
      console.log('Send message hotkey')
    },
    [HOTKEYS.CLEAR_CHAT]: () => {
      store.clearAllMessages()
    },
    [HOTKEYS.TOGGLE_THEME]: () => {
      const themes = ['light', 'dark', 'system'] as const
      const currentIndex = themes.indexOf(store.settings.theme)
      const nextTheme = themes[(currentIndex + 1) % themes.length]
      store.setTheme(nextTheme)
    },
    [HOTKEYS.NEW_PROMPT]: () => {
      // Will be connected to new prompt action
      console.log('New prompt hotkey')
    },
    [HOTKEYS.FOCUS_INPUT]: () => {
      // Focus the main input
      const input = document.querySelector('textarea[placeholder*="Type"]') as HTMLTextAreaElement
      input?.focus()
    },
    // Add dynamic prompt hotkeys
    ...promptHotkeys
  })
}