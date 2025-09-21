'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Command } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/use-app-store'
import { commandParser } from '@/lib/commands/parser'

interface CommandBarProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export function CommandBar({ onSendMessage, disabled = false }: CommandBarProps) {
  const [input, setInput] = useState('')
  const [isCommandMode, setIsCommandMode] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const {
    setCommandPaletteOpen,
    multiSendMode,
    selectedPanelId,
    groupedPanelIds,
    panels,
    activePanels
  } = useAppStore()

  // Check if input starts with /
  useEffect(() => {
    const isCmd = commandParser.isCommandStart(input)
    if (isCmd && !isCommandMode) {
      setIsCommandMode(true)
      setCommandPaletteOpen(true)
    } else if (!input.startsWith('/') && isCommandMode) {
      setIsCommandMode(false)
      setCommandPaletteOpen(false)
    }
  }, [input, isCommandMode, setCommandPaletteOpen])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }

    // Open command palette on /
    if (e.key === '/' && input === '') {
      setCommandPaletteOpen(true)
    }
  }

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return

    // Parse command if it starts with /
    const parsed = commandParser.parse(trimmed)

    if (parsed.isCommand) {
      // Handle command execution
      // This will be connected to command registry
      console.log('Executing command:', parsed)
      setInput('')
      setCommandPaletteOpen(false)
    } else {
      // Send as regular message
      onSendMessage(trimmed)
      setInput('')
    }
  }

  // Get send mode description
  const getSendModeText = () => {
    switch (multiSendMode) {
      case 'all':
        return `Send to all ${activePanels} panels`
      case 'selected':
        return `Send to ${selectedPanelId || 'panel'}`
      case 'group':
        return `Send to ${groupedPanelIds.length} panels`
      default:
        return 'Send message'
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  return (
    <div className="border-t bg-background">
      <div className="p-4">
        {/* Send mode indicator */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {getSendModeText()}
          </span>
          {isCommandMode && (
            <span className="text-xs text-primary flex items-center gap-1">
              <Command className="w-3 h-3" />
              Command Mode
            </span>
          )}
        </div>

        {/* Input area */}
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isCommandMode
                  ? 'Type a command...'
                  : 'Type / for commands, or enter your message...'
              }
              disabled={disabled}
              className={cn(
                'w-full min-h-[44px] max-h-[120px] p-3 pr-12',
                'bg-background border rounded-lg resize-none',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'placeholder:text-muted-foreground',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isCommandMode && 'border-primary'
              )}
              rows={1}
            />
            {input.length > 0 && (
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                {input.length}
              </div>
            )}
          </div>

          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className={cn(
              'p-3 rounded-lg transition-colors',
              'bg-primary text-primary-foreground',
              'hover:bg-primary/90',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isCommandMode && 'bg-purple-600 hover:bg-purple-700'
            )}
          >
            {isCommandMode ? (
              <Command className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Help text */}
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span>Enter to send</span>
          <span>Shift+Enter for new line</span>
          <span>/ for commands</span>
          <span>Cmd+K for palette</span>
        </div>
      </div>
    </div>
  )
}