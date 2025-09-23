'use client'

import { useChatStore } from '@/store/chat-store'
import { OptimizedChatPanel as ChatPanel } from '../OptimizedChatPanel'
import { cn } from '@/lib/utils'

export function PanelGrid() {
  const { panels, activePanelIds, settings } = useChatStore()

  // Get active panels
  const activePanels = panels.filter(panel =>
    activePanelIds.includes(panel.id)
  ).slice(0, settings.panelCount)

  // Determine grid layout based on panel count
  const getGridClassName = (count: number) => {
    switch (count) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-1 md:grid-cols-2'
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      case 5:
      case 6:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'
      default:
        return 'grid-cols-1 md:grid-cols-2'
    }
  }

  // Special layout for 5 or 6 panels (2x3 grid)
  const isSpecialLayout = activePanels.length === 5 || activePanels.length === 6
  const specialGridClass = activePanels.length === 5
    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 [&>*:last-child]:md:col-span-2 [&>*:last-child]:lg:col-span-1'
    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

  return (
    <div className="h-full p-2 overflow-auto bg-muted/30">
      {activePanels.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">💬</div>
            <h2 className="text-lg font-semibold mb-2">No Active Panels</h2>
            <p className="text-sm text-muted-foreground">
              Panels will appear here when initialized
            </p>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            'grid gap-2 h-full auto-rows-fr',
            isSpecialLayout ? specialGridClass : getGridClassName(activePanels.length)
          )}
        >
          {activePanels.map(panel => (
            <ChatPanel
              key={panel.id}
              panel={panel}
            />
          ))}
        </div>
      )}
    </div>
  )
}