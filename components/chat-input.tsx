'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { Button } from './ui/button'
import { Send, Paperclip, Image, FileText } from 'lucide-react'
import { cn, isImageFile } from '@/lib/utils'
import { useAppStore } from '@/store/use-app-store'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (message: string) => void
  disabled?: boolean
  panelId: string
}

export function ChatInput({ value, onChange, onSend, disabled, panelId }: ChatInputProps) {
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  const handleSend = () => {
    if (!value.trim() && attachments.length === 0) return
    
    onSend(value)
    setAttachments([])
  }
  
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }
  
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`
    }
  }
  
  return (
    <div className="space-y-2">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-md">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-2 py-1 bg-background border rounded text-xs"
            >
              {isImageFile(file.name) ? (
                <Image className="w-3 h-3" />
              ) : (
                <FileText className="w-3 h-3" />
              )}
              <span className="max-w-20 truncate">{file.name}</span>
              <button
                className="text-muted-foreground hover:text-destructive"
                onClick={() => removeAttachment(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* File Upload */}
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          onClick={handleFileSelect}
          disabled={disabled}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        
        {/* Text Input */}
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              adjustTextareaHeight()
            }}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力... (Shift+Enter で改行)"
            className={cn(
              "w-full min-h-10 max-h-32 p-3 text-sm",
              "bg-background border border-input rounded-md",
              "resize-none overflow-auto custom-scrollbar",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "placeholder:text-muted-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            disabled={disabled}
            rows={1}
          />
        </div>
        
        {/* Send Button */}
        <Button
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          onClick={handleSend}
          disabled={disabled || (!value.trim() && attachments.length === 0)}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.txt,.doc,.docx,.md"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}