"use client";

import { cn } from "@/lib/utils";
import { getModelName } from "@/lib/models";
import type { ChatMessage } from "@/types";
import { User, Bot, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isError = message.error;

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      {!isUser && (
        <div className="avatar-ai flex-shrink-0">
          {isError ? (
            <AlertCircle className="w-3 h-3 text-white" />
          ) : (
            <span className="text-xs text-white font-bold">AI</span>
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          "flex-1 max-w-[80%]",
          isUser && "flex flex-col items-end"
        )}>
        {/* Model Name (for assistant messages) */}
        {!isUser && !isError && (
          <div className="text-xs text-muted-foreground mb-1">
            {getModelName(message.modelId || "")}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            isUser
              ? "speech-bubble-user text-white"
              : isError
              ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl rounded-bl-none p-3"
              : "speech-bubble-ai"
          )}>
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="text-sm prose prose-sm dark:prose-invert max-w-none text-white">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom renderers for markdown elements
                  p: ({ children }: { children?: React.ReactNode }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                  code: ({
                    className,
                    children,
                    ...props
                  }: {
                    className?: string;
                    children?: React.ReactNode;
                    [key: string]: any;
                  }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    return match ? (
                      <pre className="bg-black/10 dark:bg-white/10 rounded p-2 overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code
                        className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs"
                        {...props}>
                        {children}
                      </code>
                    );
                  },
                  ul: ({ children }: { children?: React.ReactNode }) => (
                    <ul className="list-disc pl-4 mb-2">{children}</ul>
                  ),
                  ol: ({ children }: { children?: React.ReactNode }) => (
                    <ol className="list-decimal pl-4 mb-2">{children}</ol>
                  ),
                  li: ({ children }: { children?: React.ReactNode }) => (
                    <li className="mb-1">{children}</li>
                  ),
                  blockquote: ({
                    children,
                  }: {
                    children?: React.ReactNode;
                  }) => (
                    <blockquote className="border-l-4 border-muted-foreground/30 pl-4 italic">
                      {children}
                    </blockquote>
                  ),
                }}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
