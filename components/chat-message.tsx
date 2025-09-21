"use client";

import type { ChatMessage as ChatMessageType } from "@/types";
import { cn, formatTimestamp } from "@/lib/utils";
import { getModelName } from "@/lib/models";
import { Copy, User, Bot, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "group relative flex gap-3 p-3 rounded-lg",
        isUser ? "" : ""
      )}>
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
          isUser
            ? "gradient-primary text-white"
            : "gradient-secondary text-white"
        )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">
            {isUser ? "ユーザー" : getModelName(message.modelId || "unknown")}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(message.timestamp)}
          </span>
        </div>

        {/* Message Content */}
        <div className="text-sm whitespace-pre-wrap break-words">
          {isUser ? (
            <div className="max-w-xs px-4 py-3 gradient-primary rounded-2xl rounded-br-none text-white text-sm">
              {message.content}
            </div>
          ) : (
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 gradient-secondary rounded-full flex items-center justify-center">
                  <span className="text-xs">AI</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {getModelName(message.modelId || "unknown")}
                </span>
              </div>
              <div className="px-4 py-3 glass-card rounded-2xl rounded-bl-none text-sm text-foreground">
                {message.content}
              </div>
            </div>
          )}
          {isUser && message.content.length > 240 && (
            <>
              <button
                className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setExpanded(!expanded)}>
                <ChevronDown
                  className={
                    "w-3 h-3 transition-transform " +
                    (expanded ? "rotate-180" : "")
                  }
                />
                {expanded ? "短く表示" : "全文表示"}
              </button>
            </>
          )}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 px-2 py-1 bg-background border rounded text-xs">
                <span>{attachment.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={copyToClipboard}>
          <Copy className="w-3 h-3" />
        </Button>
      </div>

      {/* Copy feedback */}
      {copied && (
        <div className="absolute top-0 right-0 -mt-8 bg-foreground text-background px-2 py-1 rounded text-xs">
          コピーしました
        </div>
      )}
    </div>
  );
}
