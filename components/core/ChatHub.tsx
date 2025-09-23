'use client'

import { useEffect, useCallback } from 'react'
import { useChatStore } from '@/store/chat-store'
import { PanelGrid } from './PanelGrid'
import { CommandBar } from '@/components/command/CommandBar'
import { CommandPalette } from '@/components/command/CommandPalette'
import { cn } from '@/lib/utils'
import { useAppHotkeys } from '@/hooks/useHotkeys'
import { generateId } from '@/lib/utils'
import type { ChatMessage, ChatPanel } from '@/types'

interface ChatHubProps {
  className?: string
}

export function ChatHub({ className }: ChatHubProps) {
  const {
    panels,
    activePanelIds,
    multiSendMode,
    selectedPanelId,
    groupedPanelIds,
    initializePanels,
    addMessage,
    setPanelLoading,
    setPanelError
  } = useChatStore()

  // Initialize panels on mount
  useEffect(() => {
    if (panels.length === 0) {
      initializePanels(2)
    }
  }, [panels.length, initializePanels])

  // Set up hotkeys
  useAppHotkeys()

  // Handle sending messages
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // Determine target panels based on send mode
    let targetPanelIds: string[] = []

    switch (multiSendMode) {
      case 'all':
        targetPanelIds = activePanelIds
        break
      case 'selected':
        targetPanelIds = selectedPanelId ? [selectedPanelId] : []
        break
      case 'group':
        targetPanelIds = groupedPanelIds
        break
    }

    if (targetPanelIds.length === 0) {
      // No panels selected for sending message
      return
    }

    // Add user message to all target panels
    const userMessage: Omit<ChatMessage, 'panelId'> = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
      modelId: 'user'
    }

    targetPanelIds.forEach(panelId => {
      addMessage(panelId, { ...userMessage, panelId })
      setPanelLoading(panelId, true)
    })

    // Simulate AI responses (will be replaced with actual API calls)
    targetPanelIds.forEach(panelId => {
      setTimeout(() => {
        const panel = panels.find((p: ChatPanel) => p.id === panelId)
        if (!panel) return

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: `This is a simulated response from ${panel.modelId} for panel ${panelId}. Your message was: "${content}"`,
          timestamp: new Date(),
          panelId,
          modelId: panel.modelId
        }

        addMessage(panelId, assistantMessage)
        setPanelLoading(panelId, false)
      }, 1000 + Math.random() * 1000) // Random delay 1-2s
    })
  }, [
    multiSendMode,
    activePanelIds,
    selectedPanelId,
    groupedPanelIds,
    panels,
    addMessage,
    setPanelLoading
  ])

  // Check if any panel is loading
  const isAnyPanelLoading = panels.some((p: ChatPanel) => p.isLoading)

  return (
    <div className={cn('flex flex-col h-screen bg-background', className)}>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">MultiChat AI</h1>
              <p className="text-xs text-muted-foreground">
                ChatHub-style multi-model comparison
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {panels.length} panels active
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <PanelGrid />
      </main>

      {/* Command Bar */}
      <footer className="flex-shrink-0">
        <CommandBar
          onSendMessage={handleSendMessage}
          disabled={isAnyPanelLoading}
        />
      </footer>

      {/* Command Palette (Hidden by default) */}
      <CommandPalette />
    </div>
  )
}