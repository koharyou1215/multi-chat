"use client";

import { memo, useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { ChatPanel as ChatPanelType } from "@/types";
import { ChatMessage as ChatMessageComponent } from "./chat-message";
import { ModelSelector } from "./model-selector";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import {
  MoreVertical,
  CheckCircle,
  Circle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import PanelMenu from "./panel-features/PanelMenu";
import GlassEffects from "./panel-features/GlassEffects";

interface OptimizedChatPanelProps {
  panel: ChatPanelType;
  variant?: "minimal" | "glass" | "enhanced";
  className?: string;
}

// Custom hook for panel state management
const usePanelState = (panelId: string) => {
  const store = useAppStore();

  // Memoized selectors to prevent unnecessary re-renders
  const panel = useMemo(
    () => store.panels.find((p) => p.id === panelId),
    [store.panels, panelId]
  );

  const isSelected = useMemo(
    () => store.selectedPanelId === panelId,
    [store.selectedPanelId, panelId]
  );

  const isMultiSend = useMemo(
    () => store.multiSendIds.includes(panelId),
    [store.multiSendIds, panelId]
  );

  // Memoized actions to prevent recreation
  const actions = useMemo(
    () => ({
      selectPanel: () => store.setSelectedPanel(panelId),
      clearMessages: () => store.clearPanelMessages(panelId),
      toggleMultiSend: () => store.toggleMultiSendPanel(panelId),
    }),
    [store, panelId]
  );

  return {
    panel,
    isSelected,
    isMultiSend,
    ...actions,
  };
};

// Optimized message list with virtual scrolling for large datasets
const VirtualMessageList = memo(
  ({ messages }: { messages: ChatPanelType["messages"] }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

    // Auto-scroll to bottom optimization
    const scrollToBottom = useCallback(() => {
      if (containerRef.current) {
        const container = containerRef.current;
        const isNearBottom =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 100;

        if (isNearBottom) {
          container.scrollTop = container.scrollHeight;
        }
      }
    }, []);

    useEffect(() => {
      scrollToBottom();
    }, [messages.length, scrollToBottom]);

    // Virtual scrolling for performance with large message lists
    const visibleMessages = useMemo(() => {
      if (messages.length <= 50) return messages;
      return messages.slice(visibleRange.start, visibleRange.end);
    }, [messages, visibleRange]);

    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const itemHeight = 80; // Average message height
        const containerHeight = target.clientHeight;
        const scrollTop = target.scrollTop;

        const start = Math.floor(scrollTop / itemHeight);
        const end = Math.min(
          start + Math.ceil(containerHeight / itemHeight) + 5,
          messages.length
        );

        setVisibleRange({ start, end });
      },
      [messages.length]
    );

    return (
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-3 space-y-4"
        onScroll={handleScroll}>
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Spacer for virtual scrolling */}
            {visibleRange.start > 0 && (
              <div style={{ height: visibleRange.start * 80 }} />
            )}

            {visibleMessages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))}

            {/* Spacer for virtual scrolling */}
            {visibleRange.end < messages.length && (
              <div
                style={{ height: (messages.length - visibleRange.end) * 80 }}
              />
            )}
          </>
        )}
      </div>
    );
  }
);

VirtualMessageList.displayName = "VirtualMessageList";

// Memoized empty state component
const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className="text-2xl mb-2">💬</div>
    <div className="text-muted-foreground">
      メッセージを送信して会話を始めてください
    </div>
  </div>
));

EmptyState.displayName = "EmptyState";

// Memoized panel header component
const PanelHeader = memo(
  ({
    panel,
    isSelected,
    isMultiSend,
    onSelect,
    onToggleMultiSend,
    onMenuToggle,
    variant = "minimal",
  }: {
    panel: ChatPanelType;
    isSelected: boolean;
    isMultiSend: boolean;
    onSelect: () => void;
    onToggleMultiSend: () => void;
    onMenuToggle: () => void;
    variant?: "minimal" | "glass" | "enhanced";
  }) => {
    const panelNumber = useMemo(() => panel.id.split("-")[1], [panel.id]);

    // Variant-specific header styles
    const headerClasses = useMemo(() => {
      const baseClasses = "flex items-center justify-between p-3 border-b";

      switch (variant) {
        case "glass":
          return cn(
            baseClasses,
            "backdrop-blur-xl rounded-t-[calc(1rem-1px)]",
            "bg-gradient-to-r from-purple-600/20 via-purple-500/15 to-pink-600/20",
            "border-white/10"
          );
        case "enhanced":
          return cn(
            baseClasses,
            "bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm",
            "border-gray-200/50 dark:border-gray-700/50"
          );
        default:
          return cn(baseClasses, "bg-muted/50");
      }
    }, [variant]);

    return (
      <div className={headerClasses}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Selection Indicator */}
          <button onClick={onSelect} className="flex-shrink-0">
            {isSelected ? (
              <CheckCircle className="w-5 h-5 text-primary" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {/* Panel Number */}
          <span className="text-sm font-medium text-muted-foreground">
            Panel {panelNumber}
          </span>

          {/* Model Selector */}
          <div className="flex-1 min-w-0">
            <ModelSelector
              panelId={panel.id}
              currentModelId={panel.modelId}
              className="text-xs"
            />
          </div>

          {/* Selection Toggle */}
          <label className="text-xs flex items-center gap-1 cursor-pointer select-none">
            <input
              type="checkbox"
              className="accent-purple-400"
              checked={isMultiSend}
              onChange={onToggleMultiSend}
            />
            <span className="text-gray-300">
              {isMultiSend ? "選択済み" : "選択"}
            </span>
          </label>
        </div>

        {/* Actions */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onMenuToggle}>
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    );
  }
);

PanelHeader.displayName = "PanelHeader";

// Main optimized component
export const OptimizedChatPanel = memo<OptimizedChatPanelProps>(
  ({ panel, variant = "minimal", className }) => {
    const {
      isSelected,
      isMultiSend,
      selectPanel,
      clearMessages,
      toggleMultiSend,
    } = usePanelState(panel.id);

    const [showMenu, setShowMenu] = useState(false);

    // Memoized panel container classes
    const containerClasses = useMemo(() => {
      const baseClasses =
        "flex flex-col h-full rounded-lg border overflow-hidden transition-all duration-200";

      const variantClasses = {
        minimal: cn(
          baseClasses,
          "bg-card",
          isSelected && "ring-2 ring-primary shadow-lg",
          panel.error && "border-destructive"
        ),
        glass: cn(
          baseClasses,
          "glass-card rounded-2xl backdrop-blur-xl",
          "bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5",
          "shadow-[0_20px_70px_rgba(102,126,234,0.15)]",
          "hover:shadow-[0_30px_100px_rgba(102,126,234,0.25)]",
          "border border-white/10",
          isSelected &&
            "ring-2 ring-purple-400/50 shadow-[0_0_50px_rgba(167,85,247,0.3)]"
        ),
        enhanced: cn(
          baseClasses,
          "rounded-xl",
          "bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95",
          "backdrop-blur border border-gray-200/50 dark:border-gray-700/50",
          "shadow-xl hover:shadow-2xl",
          isSelected && "ring-2 ring-purple-500/50"
        ),
      };

      return cn(variantClasses[variant], className);
    }, [variant, isSelected, panel.error, className]);

    // Optimized click handler
    const handlePanelClick = useCallback(() => {
      if (!isSelected) {
        selectPanel();
      }
    }, [isSelected, selectPanel]);

    const handleMenuToggle = useCallback(() => {
      setShowMenu((prev) => !prev);
    }, []);

    return (
      <div
        className={cn(containerClasses, "isolate relative")}
        onClick={handlePanelClick}
        data-testid="optimized-chat-panel"
        style={{ isolation: "isolate" }}>
        {/* Glass effects for glass variant */}
        {variant === "glass" && <GlassEffects />}

        {/* Panel Header */}
        <PanelHeader
          panel={panel}
          isSelected={isSelected}
          isMultiSend={isMultiSend}
          onSelect={selectPanel}
          onToggleMultiSend={toggleMultiSend}
          onMenuToggle={handleMenuToggle}
          variant={variant}
        />

        {/* Custom Prompt Indicator */}
        {panel.customPrompt && (
          <div className="mx-3 mt-2 p-2 glass rounded-lg border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-purple-300 font-medium">
                {panel.customPrompt.title}
              </span>
            </div>
          </div>
        )}

        {/* Messages Area with Virtual Scrolling */}
        <VirtualMessageList messages={panel.messages} />

        {/* Loading Indicator */}
        {panel.isLoading && (
          <div className="px-3 py-2 border-t bg-muted/30 text-xs">
            <div className="flex items-center gap-2 text-primary">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Processing...</span>
            </div>
          </div>
        )}

        {/* Error Indicator */}
        {panel.error && (
          <div className="px-3 py-2 border-t bg-destructive/10 text-xs">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-3 h-3" />
              <span>Error: {panel.error}</span>
            </div>
          </div>
        )}

        {/* Menu */}
        {showMenu && (
          <PanelMenu
            panel={panel}
            onClose={() => setShowMenu(false)}
            onClear={clearMessages}
          />
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for optimal re-renders
    const prev = prevProps.panel;
    const next = nextProps.panel;

    return (
      prev.id === next.id &&
      prev.modelId === next.modelId &&
      prev.isLoading === next.isLoading &&
      prev.error === next.error &&
      prev.messages.length === next.messages.length &&
      prev.customPrompt?.id === next.customPrompt?.id &&
      prevProps.variant === nextProps.variant &&
      prevProps.className === nextProps.className
    );
  }
);

OptimizedChatPanel.displayName = "OptimizedChatPanel";

// Performance monitoring hook
export const useChatPanelPerformance = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && window.performance) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.name.includes("ChatPanel")) {
            console.log(`ChatPanel render: ${entry.duration}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ["measure"] });
      return () => observer.disconnect();
    }
  }, []);
};

export default OptimizedChatPanel;
