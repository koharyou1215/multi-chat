"use client";

import type { ChatMessage as ChatMessageType } from "@/types";
import { cn, formatTimestamp } from "@/lib/utils";
import { getModelName } from "@/lib/models";
import { Copy, User, Bot, Edit2, RefreshCw, Star } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { MessageRenderer } from "./message-renderer";

interface ChatMessageProps {
  message: ChatMessageType;
  panelColor?: string;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRegenerateMessage?: (messageId: string) => void;
}

export function ChatMessage({
  message,
  panelColor = "from-blue-600 via-purple-600 to-indigo-600",
  onEditMessage,
  onRegenerateMessage,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const store = useAppStore();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === "user";
  const [showTyping, setShowTyping] = useState(false);

  // Show typing animation for new AI messages
  useEffect(() => {
    if (!isUser && message.content) {
      setShowTyping(true);
      const timer = setTimeout(() => setShowTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [message.content, isUser]);

  const handleEdit = () => {
    if (isEditing && onEditMessage) {
      onEditMessage(message.id, editContent);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleRegenerate = () => {
    if (onRegenerateMessage) {
      // Clear conversation history and regenerate as new conversation
      onRegenerateMessage(message.id);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex",
        isUser ? "justify-end" : "justify-start",
        "mb-4"
      )}>
      <div className={cn("max-w-[70%]", "relative")}>
        {/* Message Content */}
        {isUser ? (
          // User Message with colored bubble
          <div className="relative">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 rounded-xl bg-gray-800 text-white resize-none"
                rows={3}
              />
            ) : (
              <div className="relative">
                {/* Speech bubble with CSS class */}
                <div className="speech-bubble-user">
                  <MessageRenderer content={message.content} isUser={true} />
                </div>
                {/* User message icons - no white backgrounds */}
                <div className="absolute -bottom-8 right-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    onClick={copyToClipboard}
                    className="message-action-btn"
                    title="コピー">
                    <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  </button>
                  <button
                    onClick={() => store.addFavorite?.(message)}
                    className="message-action-btn"
                    title="お気に入りに追加">
                    <Star className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  </button>
                  <button
                    onClick={handleEdit}
                    className="message-action-btn"
                    title={isEditing ? "確定" : "編集"}>
                    <Edit2 className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // AI Message with glass morphism bubble
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="avatar-ai">
                <span className="text-xs text-white font-bold">AI</span>
              </div>
              <span className="text-xs text-gray-400">
                {getModelName(message.modelId || "unknown")}
              </span>
            </div>
            {showTyping && !message.content ? (
              <div className="bg-gray-800/60 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Speech bubble with CSS class */}
                <div className="speech-bubble-ai">
                  <MessageRenderer content={message.content} isUser={false} />
                </div>
              </div>
            )}
            {/* AI message actions - no white backgrounds */}
            <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={copyToClipboard}
                className="message-action-btn"
                title={copied ? "コピーしました" : "コピー"}>
                <Copy className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
              </button>
              <button
                onClick={() => store.addFavorite?.(message)}
                className="message-action-btn"
                title="お気に入りに追加">
                <Star className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
              </button>
              {onRegenerateMessage && (
                <button
                  onClick={handleRegenerate}
                  className="message-action-btn"
                  title="再生成">
                  <RefreshCw className="w-4 h-4 text-gray-400 hover:text-white transition-colors" />
                </button>
              )}
            </div>
          </div>
        )}
        <div className="text-xs text-gray-400 mt-1">
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
