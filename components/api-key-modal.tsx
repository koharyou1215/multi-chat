'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useAppStore } from '@/store/use-app-store'
import { Button } from './ui/button'
import { Key, ExternalLink } from 'lucide-react'
import { validateApiKey, cn } from '@/lib/utils'

interface ApiKeyModalProps {
  open: boolean
  onClose: () => void
}

export function ApiKeyModal({ open, onClose }: ApiKeyModalProps) {
  const { openRouterApiKey, setApiKey } = useAppStore()
  const [inputKey, setInputKey] = useState(openRouterApiKey)
  const [error, setError] = useState('')
  
  const handleSave = () => {
    if (!validateApiKey(inputKey)) {
      setError('APIキーはsk-で始まる必要があります')
      return
    }
    
    setApiKey(inputKey)
    setError('')
    onClose()
  }
  
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className={cn(
          "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
          "bg-card border rounded-lg shadow-lg w-full max-w-md z-50 p-6"
        )}>
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <Dialog.Title className="text-lg font-semibold text-foreground mb-2">
              OpenRouter APIキー設定
            </Dialog.Title>
            <p className="text-sm text-muted-foreground">
              アプリを使用するためにOpenRouterのAPIキーが必要です
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                APIキー
              </label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value)
                  setError('')
                }}
                placeholder="sk-or-..."
                className={cn(
                  "w-full p-3 text-sm bg-background border rounded-md",
                  "focus:outline-none focus:ring-2 focus:ring-ring",
                  error && "border-destructive"
                )}
              />
              {error && (
                <p className="text-xs text-destructive mt-1">{error}</p>
              )}
            </div>
            
            <div className="bg-muted/30 p-3 rounded-md">
              <div className="flex items-start gap-2">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    OpenRouterのAPIキーを取得する方法:
                  </p>
                  <ol className="text-xs space-y-1 list-decimal list-inside">
                    <li>OpenRouterにサインアップ</li>
                    <li>API Keysページで新しいキーを作成</li>
                    <li>上記のフィールドにペースト</li>
                  </ol>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto mt-2 text-xs"
                    onClick={() => window.open('https://openrouter.ai/keys', '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    OpenRouterでキーを取得
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              後で
            </Button>
            <Button onClick={handleSave} disabled={!inputKey.trim()}>
              保存
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}