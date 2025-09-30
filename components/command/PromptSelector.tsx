'use client'

import { useState } from 'react'
import { FileText, Star, Clock, Tag, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/store/chat-store'
import type { Prompt } from '@/types'

interface PromptSelectorProps {
  onSelectPrompt: (prompt: Prompt) => void
  className?: string
}

export function PromptSelector({ onSelectPrompt, className }: PromptSelectorProps) {
  const { prompts, incrementPromptUsage } = useChatStore()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Get unique categories
  const categories = Array.from(
    new Set(prompts.flatMap((p: Prompt) => p.category || 'Uncategorized'))
  )

  // Filter prompts
  const filteredPrompts = prompts.filter((prompt: Prompt) => {
    const matchesSearch = !search ||
      prompt.title.toLowerCase().includes(search.toLowerCase()) ||
      prompt.content.toLowerCase().includes(search.toLowerCase()) ||
      prompt.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))

    const matchesCategory = !selectedCategory ||
      prompt.category === selectedCategory

    const matchesFavorites = !showFavoritesOnly || prompt.isFavorite

    return matchesSearch && matchesCategory && matchesFavorites
  })

  // Sort by usage and recency
  const sortedPrompts = [...filteredPrompts].sort((a, b) => {
    // Favorites first
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1

    // Then by usage count
    if (a.usageCount !== b.usageCount) {
      return b.usageCount - a.usageCount
    }

    // Then by last used
    if (a.lastUsed && b.lastUsed) {
      return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
    }

    // Finally by creation date
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const handleSelectPrompt = (prompt: Prompt) => {
    incrementPromptUsage(prompt.id)
    onSelectPrompt(prompt)
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Search and Filters */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className={cn(
              'w-full pl-10 pr-4 py-2 text-sm',
              'bg-background border rounded-md',
              'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Favorites Toggle */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={cn(
              'px-3 py-1 text-xs rounded-full border',
              'transition-colors',
              showFavoritesOnly
                ? 'bg-yellow-500 text-white border-yellow-500'
                : 'bg-background hover:bg-accent'
            )}
          >
            <Star className="w-3 h-3 inline mr-1" />
            Favorites
          </button>

          {/* Category Filter */}
          {categories.map((category: string) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(
                selectedCategory === category ? null : category
              )}
              className={cn(
                'px-3 py-1 text-xs rounded-full border',
                'transition-colors',
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-accent'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Prompts List */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedPrompts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {search || selectedCategory || showFavoritesOnly
                ? 'No prompts match your filters'
                : 'No saved prompts yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedPrompts.map(prompt => (
              <button
                key={prompt.id}
                onClick={() => handleSelectPrompt(prompt)}
                className={cn(
                  'w-full text-left p-3 rounded-lg border',
                  'hover:bg-accent transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {prompt.title}
                      </h4>
                      {prompt.isFavorite && (
                        <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {prompt.content}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {/* Tags */}
                      {prompt.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          <span>{prompt.tags.slice(0, 2).join(', ')}</span>
                          {prompt.tags.length > 2 && (
                            <span>+{prompt.tags.length - 2}</span>
                          )}
                        </div>
                      )}

                      {/* Usage Count */}
                      {prompt.usageCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Used {prompt.usageCount}x</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}