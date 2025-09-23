'use client'

import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import {
  Search,
  FileText,
  Settings,
  Palette,
  Trash2,
  Download,
  Upload,
  Sun,
  Moon,
  Monitor,
  Grid3x3,
  Bot,
  History,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/use-app-store'
import { commandRegistry } from '@/lib/commands/registry'

const iconMap: Record<string, any> = {
  clear: Trash2,
  reset: Trash2,
  help: Settings,
  save: FileText,
  load: Upload,
  prompts: FileText,
  theme: Palette,
  panels: Grid3x3,
  model: Bot,
  export: Download,
  history: History,
  favorites: Star,
}

export function CommandPalette() {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    addCommandToHistory,
    commandHistory,
    customPrompts,
    clearAllMessages,
    setPanelCount,
  } = useAppStore()

  const [search, setSearch] = useState('')

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }

      // Escape to close
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  const handleSelect = (value: string) => {
    // Add to history
    addCommandToHistory(value)

    // Execute command
    const [trigger, ...args] = value.split(' ')

    // Handle built-in commands
    switch (trigger) {
      case 'clear':
        clearAllMessages()
        break
      case 'theme':
        // Theme switching handled by UI components
        break
      case 'panels':
        const count = parseInt(args[0]) || 2
        setPanelCount(Math.min(Math.max(count, 1), 6))
        break
      default:
        // Try to execute from registry
        commandRegistry.execute(trigger, args).catch(error => {
          // Command execution error: ${error}
        })
    }

    // Close palette
    setCommandPaletteOpen(false)
    setSearch('')
  }

  return (
    <Command.Dialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
      label="Command Palette"
    >
      {commandPaletteOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setCommandPaletteOpen(false)}
          />
          <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 bg-popover rounded-lg shadow-2xl border overflow-hidden">
            <Command.Input
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className={cn(
                'w-full px-4 py-3 text-sm bg-transparent',
                'border-b outline-none placeholder:text-muted-foreground'
              )}
            />

            <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {/* Recent Commands */}
            {commandHistory.length > 0 && (
              <Command.Group heading="Recent" className="mb-2">
                {commandHistory.slice(0, 3).map((cmd) => {
                  const Icon = iconMap[cmd.split(' ')[0]] || Settings
                  return (
                    <Command.Item
                      key={`recent-${cmd}`}
                      value={cmd}
                      onSelect={handleSelect}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md',
                        'cursor-pointer text-sm',
                        'hover:bg-accent hover:text-accent-foreground',
                        'data-[selected]:bg-accent data-[selected]:text-accent-foreground'
                      )}
                    >
                      <History className="w-4 h-4 opacity-50" />
                      <span>/{cmd}</span>
                    </Command.Item>
                  )
                })}
              </Command.Group>
            )}

            {/* System Commands */}
            <Command.Group heading="System" className="mb-2">
              {commandRegistry.getByCategory('system').map((cmd) => {
                const Icon = iconMap[cmd.trigger] || Settings
                return (
                  <Command.Item
                    key={cmd.id}
                    value={cmd.trigger}
                    onSelect={handleSelect}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md',
                      'cursor-pointer text-sm',
                      'hover:bg-accent hover:text-accent-foreground',
                      'data-[selected]:bg-accent data-[selected]:text-accent-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium">/{cmd.trigger}</div>
                      <div className="text-xs text-muted-foreground">
                        {cmd.description}
                      </div>
                    </div>
                  </Command.Item>
                )
              })}
            </Command.Group>

            {/* Prompt Commands */}
            <Command.Group heading="Prompts" className="mb-2">
              {commandRegistry.getByCategory('prompt').map((cmd) => {
                const Icon = iconMap[cmd.trigger] || FileText
                return (
                  <Command.Item
                    key={cmd.id}
                    value={cmd.trigger}
                    onSelect={handleSelect}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md',
                      'cursor-pointer text-sm',
                      'hover:bg-accent hover:text-accent-foreground',
                      'data-[selected]:bg-accent data-[selected]:text-accent-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium">/{cmd.trigger}</div>
                      <div className="text-xs text-muted-foreground">
                        {cmd.description}
                      </div>
                    </div>
                  </Command.Item>
                )
              })}

              {/* Saved Prompts */}
              {customPrompts.length > 0 && (
                <Command.Separator className="my-2" />
              )}
              {customPrompts
                .slice(0, 5)
                .map((prompt) => (
                  <Command.Item
                    key={prompt.id}
                    value={`load ${prompt.id}`}
                    onSelect={handleSelect}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md',
                      'cursor-pointer text-sm',
                      'hover:bg-accent hover:text-accent-foreground',
                      'data-[selected]:bg-accent data-[selected]:text-accent-foreground'
                    )}
                  >
                    <Star className="w-4 h-4 text-yellow-500" />
                    <div className="flex-1">
                      <div className="font-medium">{prompt.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {prompt.tags?.join(', ') || ''}
                      </div>
                    </div>
                  </Command.Item>
                ))}
            </Command.Group>

            {/* Utility Commands */}
            <Command.Group heading="Utilities" className="mb-2">
              {commandRegistry.getByCategory('utility').map((cmd) => {
                const Icon = iconMap[cmd.trigger] || Settings
                return (
                  <Command.Item
                    key={cmd.id}
                    value={cmd.trigger}
                    onSelect={handleSelect}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md',
                      'cursor-pointer text-sm',
                      'hover:bg-accent hover:text-accent-foreground',
                      'data-[selected]:bg-accent data-[selected]:text-accent-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium">/{cmd.trigger}</div>
                      <div className="text-xs text-muted-foreground">
                        {cmd.description}
                      </div>
                    </div>
                  </Command.Item>
                )
              })}
            </Command.Group>
            </Command.List>

            <div className="border-t p-2">
              <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded">Enter</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd>
                  <span>Close</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Command.Dialog>
  )
}