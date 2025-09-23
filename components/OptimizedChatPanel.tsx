"use client";

import { memo, useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { useOpenRouter } from "@/hooks/use-openrouter";
import { ChatPanel as ChatPanelType } from "@/types";
import { PANEL_GRADIENTS, TIMING, ANIMATIONS } from "@/lib/constants";
import { ChatMessage as ChatMessageComponent } from "./chat-message";
import { ModelSelector } from "./model-selector";
import { cn } from "@/lib/utils";
import {
  X,
  CheckCircle,
  Circle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import GlassEffects from "./panel-features/GlassEffects";

interface OptimizedChatPanelProps {
  panel: ChatPanelType;
  variant?: "minimal" | "glass" | "enhanced";
  className?: string;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  onClose?: () => void;
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
  ({ messages, panelColor, onEditMessage, onRegenerateMessage }: {
    messages: ChatPanelType["messages"];
    panelColor?: string;
    onEditMessage?: (messageId: string, newContent: string) => void;
    onRegenerateMessage?: (messageId: string) => void;
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

    // Auto-scroll to bottom optimization
    const scrollToBottom = useCallback(() => {
      if (containerRef.current) {
        const container = containerRef.current;
        const scrollThreshold = 150;
        const isNearBottom =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - scrollThreshold;

        // Only auto-scroll if user was already near bottom
        if (isNearBottom) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'auto' // Avoid smooth scrolling conflicts
          });
        }
      }
    }, []);

    useEffect(() => {
      // Only scroll on new messages, not on every render
      if (messages.length > 0) {
        scrollToBottom();
      }
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
              <ChatMessageComponent
                key={message.id}
                message={message}
                panelColor={panelColor}
                onEditMessage={onEditMessage}
                onRegenerateMessage={onRegenerateMessage}
              />
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
    <div className="text-4xl mb-4 animate-pulse">💬</div>
    <div className="text-muted-foreground mb-2">
      メッセージを送信して会話を始めてください
    </div>
    <div className="flex gap-1 mt-4">
      <span className="w-2 h-2 bg-gray-400/50 rounded-full" style={{ animation: 'pulse-dot 1.5s infinite' }} />
      <span className="w-2 h-2 bg-gray-400/50 rounded-full" style={{ animation: 'pulse-dot 1.5s infinite 0.2s' }} />
      <span className="w-2 h-2 bg-gray-400/50 rounded-full" style={{ animation: 'pulse-dot 1.5s infinite 0.4s' }} />
    </div>
  </div>
));

EmptyState.displayName = "EmptyState";

// Helper function to get panel color scheme
const getPanelColorScheme = (panelNumber: string) => {
  const schemes = [
    {
      gradient: "from-blue-600 via-purple-600 to-indigo-600",
      hover: "hover:from-blue-500 hover:via-purple-500 hover:to-indigo-500",
      button: "hover:bg-blue-500/20",
      text: "text-blue-100"
    },
    {
      gradient: "from-pink-600 via-purple-600 to-fuchsia-600",
      hover: "hover:from-pink-500 hover:via-purple-500 hover:to-fuchsia-500",
      button: "hover:bg-pink-500/20",
      text: "text-pink-100"
    },
    {
      gradient: "from-emerald-600 via-teal-600 to-cyan-600",
      hover: "hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500",
      button: "hover:bg-emerald-500/20",
      text: "text-emerald-100"
    },
    {
      gradient: "from-orange-600 via-amber-600 to-yellow-600",
      hover: "hover:from-orange-500 hover:via-amber-500 hover:to-yellow-500",
      button: "hover:bg-orange-500/20",
      text: "text-orange-100"
    },
  ];

  const index = (parseInt(panelNumber) - 1) % schemes.length;
  return schemes[index];
};

// Memoized panel header component
const PanelHeader = memo(
  ({
    panel,
    isSelected,
    isMultiSend,
    onSelect,
    onToggleMultiSend,
    onClose,
    variant = "minimal",
  }: {
    panel: ChatPanelType;
    isSelected: boolean;
    isMultiSend: boolean;
    onSelect: () => void;
    onToggleMultiSend: () => void;
    onClose?: () => void;
    variant?: "minimal" | "glass" | "enhanced";
  }) => {
    const panelNumber = useMemo(() => panel.id.split("-")[1], [panel.id]);
    const colorScheme = useMemo(() => getPanelColorScheme(panelNumber), [panelNumber]);

    // Debug log: PanelHeader ${panel.id} - isSelected: ${isSelected}

    // Variant-specific header styles with subtle gradient
    const headerStyles = useMemo(() => {
      const gradientMap = {
        '1': 'linear-gradient(135deg, rgba(99, 102, 241, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
        '2': 'linear-gradient(135deg, rgba(236, 72, 153, 0.8) 0%, rgba(239, 68, 68, 0.8) 100%)',
        '3': 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(59, 130, 246, 0.8) 100%)',
        '4': 'linear-gradient(135deg, rgba(251, 146, 60, 0.8) 0%, rgba(250, 204, 21, 0.8) 100%)',
      };

      return {
        background: gradientMap[panelNumber as keyof typeof gradientMap] || gradientMap['1'],
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      };
    }, [panelNumber]);

    const headerClasses = useMemo(() => {
      const baseClasses = "flex items-center justify-between p-3 rounded-t-xl";

      if (variant === "glass" || variant === "enhanced") {
        return cn(
          baseClasses,
          "shadow-lg",
          "transition-all duration-300"
        );
      }

      return cn(baseClasses, "bg-gray-800");
    }, [variant]);

    return (
      <div className={headerClasses} style={headerStyles}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Multi-Send Selection Checkbox */}
          <button
            onClick={() => {
              // Panel ${panel.id} multiSend clicked - current isMultiSend: ${isMultiSend}
              onToggleMultiSend();
            }}
            className={cn(
              "flex-shrink-0 flex items-center justify-center",
              "w-10 h-10 rounded-full transition-all duration-200",
              "bg-gray-700 hover:bg-gray-600"
            )}>
            {isMultiSend ? (
              <CheckCircle className="w-5 h-5 text-white drop-shadow-md" />
            ) : (
              <Circle className="w-5 h-5 text-white/90 drop-shadow-md" />
            )}
          </button>


          {/* Model Selector */}
          <div className="flex-1 min-w-0">
            <ModelSelector
              panelId={panel.id}
              currentModelId={panel.modelId}
              className="text-xs"
              variant="simple"
            />
          </div>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            className={cn(
              "flex-shrink-0 flex items-center justify-center",
              "w-10 h-10 rounded-full transition-all duration-200",
              "bg-gray-700 hover:bg-red-600 hover:scale-110"
            )}
            onClick={onClose}>
            <X className="w-5 h-5 text-white drop-shadow-md" />
          </button>
        )}
      </div>
    );
  }
);

PanelHeader.displayName = "PanelHeader";

// Main optimized component
export const OptimizedChatPanel = memo<OptimizedChatPanelProps>(
  ({
    panel,
    variant = "minimal",
    className,
    isSelected: externalIsSelected,
    onToggleSelection,
    onClose,
  }) => {
    const { isMultiSend, clearMessages, toggleMultiSend } = usePanelState(
      panel.id
    );
    const store = useAppStore();
    const { sendMessage } = useOpenRouter();
    const panelNumber = panel.id.split("-")[1];
    const colorScheme = getPanelColorScheme(panelNumber);

    // CSS gradient for message bubbles
    const panelGradient = PANEL_GRADIENTS[panelNumber as keyof typeof PANEL_GRADIENTS] || PANEL_GRADIENTS.DEFAULT;

    // 外部から選択状態が渡された場合はそれを使用、そうでなければfalse
    const isSelected = externalIsSelected || false;

    // Debug log: Panel ${panel.id} - externalIsSelected: ${externalIsSelected}, isSelected: ${isSelected}

    // Memoized panel container classes
    const containerClasses = useMemo(() => {
      const baseClasses =
        "flex flex-col h-full rounded-xl overflow-hidden transition-all duration-200";

      const variantClasses = {
        minimal: cn(
          baseClasses,
          "bg-card border",
          isSelected && "ring-2 ring-primary shadow-lg",
          panel.error && "border-destructive"
        ),
        glass: cn(
          baseClasses,
          "bg-gray-800/95",
          "shadow-[0_20px_70px_rgba(0,0,0,0.3)]",
          "hover:shadow-[0_30px_100px_rgba(0,0,0,0.4)]",
          "border border-white/20",
          isSelected &&
            "ring-2 ring-white/40 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
        ),
        enhanced: cn(
          baseClasses,
          "rounded-xl",
          "bg-gray-800/95 border border-gray-700",
          "shadow-xl hover:shadow-2xl",
          isSelected && "ring-2 ring-purple-500/50"
        ),
      };

      return cn(variantClasses[variant], className);
    }, [variant, isSelected, panel.error, className]);

    return (
      <div
        className={cn(containerClasses, "isolate relative")}
        data-testid="optimized-chat-panel"
        style={{ isolation: "isolate" }}>
        {/* Glass effects for glass variant */}
        {variant === "glass" && <GlassEffects />}

        {/* Panel Header */}
        <PanelHeader
          panel={panel}
          isSelected={isSelected}
          isMultiSend={isMultiSend}
          onSelect={() => {
            // PanelHeader onSelect called for ${panel.id} - onToggleSelection: ${!!onToggleSelection}
            if (onToggleSelection) {
              onToggleSelection();
            }
          }}
          onToggleMultiSend={toggleMultiSend}
          onClose={onClose}
          variant={variant}
        />

        {/* Custom Prompt Indicator */}
        {panel.customPrompt && (
          <div className="mx-3 mt-2 p-2 rounded-lg border border-purple-500/30 bg-gray-800">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-purple-300 font-medium">
                {panel.customPrompt.title}
              </span>
            </div>
          </div>
        )}

        {/* Messages Area with Virtual Scrolling */}
        <VirtualMessageList
          messages={panel.messages}
          panelColor={panelGradient}
          onEditMessage={async (messageId, newContent) => {
            // 編集したプロンプトを再送信
            await sendMessage(
              panel.id,
              panel.modelId,
              newContent,
              panel.messages || [],
              panel.customPrompt?.content,
              []
            );
          }}
          onRegenerateMessage={async (messageId) => {
            // 最後のユーザーメッセージを取得
            const lastUserMessage = panel.messages
              .slice()
              .reverse()
              .find(m => m.role === "user");
            if (lastUserMessage) {
              // Clear the conversation and start fresh with the same prompt
              store.clearPanelMessages(panel.id);
              // Send the message as a new conversation
              setTimeout(async () => {
                await sendMessage(
                  panel.id,
                  panel.modelId,
                  lastUserMessage.content,
                  [], // Empty messages for fresh start
                  panel.customPrompt?.content,
                  []
                );
              }, TIMING.REGENERATE_DELAY);
            }
          }}
        />

        {/* Loading Indicator with animated dots */}
        {panel.isLoading && (
          <div className="px-4 py-3 border-t bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: ANIMATIONS.BOUNCE_DELAY_SHORT }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: ANIMATIONS.BOUNCE_DELAY_MEDIUM }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: ANIMATIONS.BOUNCE_DELAY_LONG }} />
              </div>
              <span className="text-sm text-purple-300 animate-pulse">考えています...</span>
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
            // ChatPanel render: ${entry.duration}ms
          }
        });
      });

      observer.observe({ entryTypes: ["measure"] });
      return () => observer.disconnect();
    }
  }, []);
};

export default OptimizedChatPanel;
