"use client";

import { memo, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { ChatPanel as ChatPanelType } from "@/types";
import { PANEL_GRADIENTS } from "@/lib/constants";
import { ChatPanelHeader } from "./ChatPanelHeader";
import { MessageList } from "./MessageList";
import { VirtualScroller } from "./VirtualScroller";
import { usePanelState } from "./hooks/usePanelState";
import { useOpenRouter } from "@/hooks/use-openrouter";
import { useAppStore } from "@/store/use-app-store";

interface ChatPanelProps {
  panel: ChatPanelType;
  variant?: "minimal" | "glass" | "enhanced";
  className?: string;
  onClose?: () => void;
  externalIsSelected?: boolean;
  onToggleSelection?: () => void;
  useVirtualScrolling?: boolean;
}

// Glass effects component
const GlassEffects = memo(() => (
  <>
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 rounded-2xl" />
    <div className="absolute inset-0 backdrop-blur-xl rounded-2xl" />
  </>
));

GlassEffects.displayName = "GlassEffects";

export const ChatPanel = memo(function ChatPanel({
  panel,
  variant = "minimal",
  className,
  onClose,
  externalIsSelected,
  onToggleSelection,
  useVirtualScrolling = false,
}: ChatPanelProps) {
  const {
    isSelected: storeIsSelected,
    isMultiSend,
    panelNumber,
    selectPanel,
    toggleMultiSend,
    setLoading,
    setError,
  } = usePanelState(panel.id);

  const { sendMessage } = useOpenRouter();
  const { regenerateLastMessage } = useAppStore();

  // Use external selection state if provided, otherwise use store state
  const isSelected = externalIsSelected !== undefined ? externalIsSelected : storeIsSelected;

  // Get panel gradient color
  const panelGradient = useMemo(
    () => PANEL_GRADIENTS[panelNumber as keyof typeof PANEL_GRADIENTS] || PANEL_GRADIENTS.DEFAULT,
    [panelNumber]
  );

  // Handle message editing
  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    // Find the message to edit
    const messageIndex = panel.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Update the message content
    const updatedMessage = {
      ...panel.messages[messageIndex],
      content: newContent,
    };

    // Update messages in store
    const updatedMessages = [...panel.messages];
    updatedMessages[messageIndex] = updatedMessage;

    // If it's a user message, regenerate the response
    if (updatedMessage.role === 'user') {
      const messagesUpToEdit = updatedMessages.slice(0, messageIndex + 1);
      await sendMessage(
        panel.id,
        panel.modelId,
        newContent,
        messagesUpToEdit,
        panel.customPrompt?.content
      );
    }
  }, [panel, sendMessage]);

  // Handle message regeneration
  const handleRegenerateMessage = useCallback(async (messageId: string) => {
    const messageIndex = panel.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const message = panel.messages[messageIndex];

    if (message.role === 'assistant') {
      // For assistant messages, find the preceding user message
      let lastUserMessage = null;
      for (let i = messageIndex - 1; i >= 0; i--) {
        if (panel.messages[i].role === 'user') {
          lastUserMessage = panel.messages[i];
          break;
        }
      }

      if (lastUserMessage) {
        // Remove this assistant message and all messages after it
        regenerateLastMessage(panel.id);

        // Resend the last user message
        const messagesBeforeAssistant = panel.messages.slice(0, messageIndex);
        await sendMessage(
          panel.id,
          panel.modelId,
          lastUserMessage.content,
          messagesBeforeAssistant,
          panel.customPrompt?.content
        );
      }
    } else if (message.role === 'user') {
      // Regenerate from this user message
      const messagesUpToThis = panel.messages.slice(0, messageIndex + 1);
      await sendMessage(
        panel.id,
        panel.modelId,
        message.content,
        messagesUpToThis,
        panel.customPrompt?.content
      );
    }
  }, [panel, sendMessage, regenerateLastMessage]);

  // Container classes based on variant
  const containerClasses = useMemo(() => {
    const variantClasses = {
      minimal: cn(
        "h-full flex flex-col min-h-0",
        "bg-background border-2 rounded-xl",
        "border-gray-700/50",
        "shadow-lg",
        isSelected && "ring-2 ring-purple-500 border-purple-500/50"
      ),
      glass: cn(
        "h-full flex flex-col rounded-2xl relative min-h-0",
        "bg-white/10 dark:bg-gray-900/10",
        "backdrop-blur-xl border-2 border-white/30",
        "shadow-2xl hover:shadow-3xl",
        isSelected && "ring-2 ring-purple-500/50 border-purple-500/50"
      ),
      enhanced: cn(
        "h-full flex flex-col rounded-2xl relative min-h-0",
        "bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95",
        "backdrop-blur border-2 border-gray-200/50 dark:border-gray-700/50",
        "shadow-xl hover:shadow-2xl",
        isSelected && "ring-2 ring-purple-500/50 border-purple-500/50"
      ),
    };

    return cn(variantClasses[variant], className);
  }, [variant, isSelected, className]);

  return (
    <div
      className={cn(containerClasses, "isolate relative")}
      data-testid="chat-panel"
      style={{ isolation: "isolate" }}
    >
      {/* Glass effects for glass variant */}
      {variant === "glass" && <GlassEffects />}

      {/* Panel Header */}
      <ChatPanelHeader
        panel={panel}
        isSelected={isSelected}
        isMultiSend={isMultiSend}
        onSelect={() => {
          if (onToggleSelection) {
            onToggleSelection();
          } else {
            selectPanel();
          }
        }}
        onToggleMultiSend={toggleMultiSend}
        onDelete={onClose}
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

      {/* Messages Area */}
      {useVirtualScrolling && panel.messages.length > 50 ? (
        <VirtualScroller
          messages={panel.messages}
          panelColor={panelGradient}
          onEditMessage={handleEditMessage}
          onRegenerateMessage={handleRegenerateMessage}
        />
      ) : (
        <MessageList
          messages={panel.messages}
          panelColor={panelGradient}
          onEditMessage={handleEditMessage}
          onRegenerateMessage={handleRegenerateMessage}
          isLoading={panel.isLoading}
          streamingMessage={panel.streamingMessage}
        />
      )}

      {/* Error display */}
      {panel.error && (
        <div className="mx-3 mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="text-xs text-red-400">{panel.error}</div>
        </div>
      )}
    </div>
  );
});

ChatPanel.displayName = "ChatPanel";