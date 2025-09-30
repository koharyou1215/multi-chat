"use client";

import { memo, useRef, useState, useCallback, useMemo, useEffect } from "react";
import { ChatMessage as ChatMessageComponent } from "@/components/chat-message";
import type { ChatMessage } from "@/types";
import { TIMING } from "@/lib/constants";

interface VirtualScrollerProps {
  messages: ChatMessage[];
  panelColor?: string;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onRegenerateMessage?: (messageId: string) => void;
  itemHeight?: number;
  overscan?: number;
}

export const VirtualScroller = memo(function VirtualScroller({
  messages,
  panelColor,
  onEditMessage,
  onRegenerateMessage,
  itemHeight = TIMING.ITEM_HEIGHT || 80,
  overscan = 5,
}: VirtualScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const [hasManuallyScrolled, setHasManuallyScrolled] = useState(false);

  // Debounced auto-scroll to bottom - 無効化
  const scrollToBottom = useCallback(() => {
    // 自動スクロールをオフ
    // if (containerRef.current) {
    //   const container = containerRef.current;
    //   const now = Date.now();
    //   if (now - lastScrollTime < 300) return;
    //   if (hasManuallyScrolled) return;
    //   const scrollThreshold = 300;
    //   const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - scrollThreshold;
    //   if (!isNearBottom) return;
    //   requestAnimationFrame(() => {
    //     container.scrollTo({ top: container.scrollHeight, behavior: "auto" });
    //   });
    //   setLastScrollTime(now);
    // }
    console.log("📜 Virtual auto-scroll is disabled. Manual scrolling only.");
  }, [lastScrollTime, hasManuallyScrolled]);

  // useEffect for auto-scroll - 無効化
  // useEffect(() => {
  //   if (messages.length > 0 && !hasManuallyScrolled) {
  //     scrollToBottom();
  //   }
  // }, [messages.length, scrollToBottom, hasManuallyScrolled]);

  // Virtual scrolling for performance with large message lists
  const visibleMessages = useMemo(() => {
    if (messages.length <= 50) return messages;
    return messages.slice(visibleRange.start, visibleRange.end);
  }, [messages, visibleRange]);

  // Throttled handleScroll - 手動検知のみ保持、ログ削除
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement;
      const now = Date.now();
      if (now - lastScrollTime < 50) return;

      const containerHeight = target.clientHeight;
      const scrollTop = target.scrollTop;

      const scrollThreshold = 300;
      const isNearBottom =
        scrollTop + containerHeight >= target.scrollHeight - scrollThreshold;
      if (!isNearBottom && !hasManuallyScrolled) {
        setHasManuallyScrolled(true);
      } else if (hasManuallyScrolled && isNearBottom) {
        const resetTimer = setTimeout(() => {
          setHasManuallyScrolled(false);
        }, 500);
      }

      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const visibleCount = Math.ceil(containerHeight / itemHeight);
      const end = Math.min(
        start + visibleCount + overscan * 2,
        messages.length
      );

      setVisibleRange((prev) => {
        if (prev.start !== start || prev.end !== end) {
          return { start, end };
        }
        return prev;
      });

      setLastScrollTime(now);
    },
    [messages.length, itemHeight, overscan, lastScrollTime, hasManuallyScrolled]
  );

  // Calculate spacer heights for virtual scrolling - stable with minHeight
  const spacers = useMemo(() => {
    const topHeight = visibleRange.start * itemHeight;
    const bottomHeight = Math.max(
      0,
      (messages.length - visibleRange.end) * itemHeight
    );
    return { topHeight, bottomHeight };
  }, [visibleRange, messages.length, itemHeight]);

  // Empty state
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">💬</div>
          <div className="text-muted-foreground">
            メッセージを送信して会話を始めてください
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto p-3 space-y-4"
      onScroll={handleScroll}
      style={{ scrollBehavior: "auto" }} // Disable smooth scrolling to prevent jitter
    >
      {/* Top spacer for virtual scrolling - stable */}
      {spacers.topHeight > 0 && (
        <div
          style={{ height: spacers.topHeight, minHeight: spacers.topHeight }}
          aria-hidden="true"
        />
      )}

      {/* Visible messages */}
      {visibleMessages.map((message) => (
        <ChatMessageComponent
          key={message.id}
          message={message}
          panelColor={panelColor}
          onEditMessage={onEditMessage}
          onRegenerateMessage={onRegenerateMessage}
        />
      ))}

      {/* Bottom spacer for virtual scrolling - stable */}
      {spacers.bottomHeight > 0 && (
        <div
          style={{
            height: spacers.bottomHeight,
            minHeight: spacers.bottomHeight,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
});

VirtualScroller.displayName = "VirtualScroller";
