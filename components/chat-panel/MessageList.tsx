"use client";

import { memo, useRef, useEffect, useCallback, useState } from "react";
import { ChatMessage as ChatMessageComponent } from "@/components/chat-message";
import type { ChatMessage } from "@/types";

interface MessageListProps {
  messages: ChatMessage[];
  panelColor?: string;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRegenerateMessage?: (messageId: string) => void;
  isLoading?: boolean;
  streamingMessage?: string;
}

// Empty state component
const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className="text-4xl mb-4 animate-pulse">💬</div>
    <div className="text-muted-foreground mb-2">
      メッセージを送信して会話を始めてください
    </div>
    <div className="flex gap-1 mt-4">
      <span
        className="w-2 h-2 bg-gray-400/50 rounded-full"
        style={{ animation: "pulse-dot 1.5s infinite" }}
      />
      <span
        className="w-2 h-2 bg-gray-400/50 rounded-full"
        style={{ animation: "pulse-dot 1.5s infinite 0.2s" }}
      />
      <span
        className="w-2 h-2 bg-gray-400/50 rounded-full"
        style={{ animation: "pulse-dot 1.5s infinite 0.4s" }}
      />
    </div>
  </div>
));

EmptyState.displayName = "EmptyState";

// Loading indicator component
const LoadingIndicator = memo(() => (
  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg backdrop-blur-sm">
    <div className="flex gap-1.5">
      <span
        className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50"
        style={{ animationDelay: "0ms", animationDuration: "1s" }}
      />
      <span
        className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"
        style={{ animationDelay: "200ms", animationDuration: "1s" }}
      />
      <span
        className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse shadow-lg shadow-purple-500/50"
        style={{ animationDelay: "400ms", animationDuration: "1s" }}
      />
    </div>
    <span className="text-sm bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-medium animate-pulse">
      AIが考えています...
    </span>
  </div>
));

LoadingIndicator.displayName = "LoadingIndicator";

// Streaming message component
const StreamingMessage = memo(
  ({ content, panelColor }: { content: string; panelColor?: string }) => (
    <div className="flex justify-start">
      <div
        className="max-w-[80%] rounded-2xl p-4 glass"
        style={{
          background:
            panelColor || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}>
        <div className="text-white whitespace-pre-wrap">
          {content}
          <span className="inline-block w-2 h-4 ml-1 bg-white/50 animate-pulse" />
        </div>
      </div>
    </div>
  )
);

StreamingMessage.displayName = "StreamingMessage";

export const MessageList = memo(function MessageList({
  messages,
  panelColor,
  onEditMessage,
  onRegenerateMessage,
  isLoading,
  streamingMessage,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [hasManuallyScrolled, setHasManuallyScrolled] = useState(false);
  const [savedScrollTop, setSavedScrollTop] = useState(0); // スクロール位置保存

  // Detect manual scrolling - 保持
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollThreshold = 300;
      const isNearBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - scrollThreshold;

      if (!isNearBottom) {
        setHasManuallyScrolled(true);
      } else if (hasManuallyScrolled) {
        const resetTimer = setTimeout(() => {
          setHasManuallyScrolled(false);
        }, 500);
        return () => clearTimeout(resetTimer);
      }
    }
  }, [hasManuallyScrolled]);

  // Debounced auto-scroll to bottom - 無効化（そのまま）
  const scrollToBottom = useCallback(() => {
    // 自動スクロールをオフ: コメントアウト
    // if (containerRef.current) {
    //   const container = containerRef.current;
    //   const now = Date.now();
    //   if (now - lastScrollTime < 300) return;
    //   const scrollThreshold = 300;
    //   const isNearBottom =
    //     container.scrollTop + container.clientHeight >=
    //     container.scrollHeight - scrollThreshold;
    //   if (hasManuallyScrolled) return;
    //   requestIdleCallback(() => {
    //     if (containerRef.current) {
    //       containerRef.current.scrollTop = containerRef.current.scrollHeight;
    //     }
    //   }, { timeout: 16 });
    //   setLastScrollTime(now);
    // }
    console.log("📜 Auto-scroll is disabled. Manual scrolling only.");
  }, [lastScrollTime, hasManuallyScrolled]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // スクロール位置保存と復元: レンダリング後に位置を維持
  useEffect(() => {
    const container = containerRef.current;
    if (container && hasManuallyScrolled) {
      // 手動スクロール時は位置を保存
      setSavedScrollTop(container.scrollTop);
      console.log("📍 Scroll position saved:", container.scrollTop);
    }
  }, [hasManuallyScrolled]);

  useEffect(() => {
    const container = containerRef.current;
    if (container && savedScrollTop > 0 && hasManuallyScrolled) {
      // メッセージ変化後、位置を復元（少し遅延）
      const timer = setTimeout(() => {
        if (container) {
          container.scrollTop = savedScrollTop;
          console.log("📍 Scroll position restored:", savedScrollTop);
        }
      }, 50); // 短い遅延でDOM安定後復元
      return () => clearTimeout(timer);
    }
  }, [messages.length, streamingMessage, savedScrollTop, hasManuallyScrolled]);

  // Auto-scroll useEffects - 無効化
  // useEffect(() => {
  //   if (messages.length > 0) {
  //     const timer = setTimeout(scrollToBottom, 100);
  //     return () => clearTimeout(timer);
  //   }
  // }, [messages.length, scrollToBottom]);

  // useEffect(() => {
  //   if (streamingMessage && !hasManuallyScrolled) {
  //     const timer = setTimeout(() => {
  //       if (containerRef.current && !hasManuallyScrolled) {
  //         const container = containerRef.current;
  //         const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 300;
  //         if (isNearBottom) {
  //           scrollToBottom();
  //         }
  //       }
  //     }, 200);
  //     return () => clearTimeout(timer);
  //   }
  // }, [streamingMessage, hasManuallyScrolled, scrollToBottom]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto p-3 space-y-4 scrollbar-hide min-h-0"
      style={{
        scrollBehavior: "auto", // Instant to prevent smooth jitter
        // Hide scrollbar but keep functionality
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        // Mobile Safari optimizations
        WebkitOverflowScrolling: "touch",
        overscrollBehavior: "contain"
      }}
    >
      {messages.length === 0 && !isLoading && !streamingMessage ? (
        <EmptyState />
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessageComponent
              key={message.id}
              message={message}
              panelColor={panelColor}
              onEditMessage={onEditMessage}
              onRegenerateMessage={onRegenerateMessage}
            />
          ))}

          {/* Streaming message display */}
          {streamingMessage && (
            <StreamingMessage
              content={streamingMessage}
              panelColor={panelColor}
            />
          )}

          {/* Loading indicator */}
          {isLoading && !streamingMessage && <LoadingIndicator />}
        </>
      )}
    </div>
  );
});

MessageList.displayName = "MessageList";
