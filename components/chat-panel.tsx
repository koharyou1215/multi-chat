"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { ChatPanel as ChatPanelType } from "@/types";
import { ChatMessage as ChatMessageComponent } from "./chat-message";
// 個別入力はグローバル入力に置き換えたため未使用
import { ModelSelector } from "./model-selector";
import { Button } from "./ui/button";
import {
  MoreVertical,
  Trash2,
  FileText,
  RefreshCw,
  Download,
} from "lucide-react";
import { getModelName } from "@/lib/models";

interface ChatPanelProps {
  panel: ChatPanelType;
}

export function ChatPanel({ panel }: ChatPanelProps) {
  const {
    clearPanelMessages,
    selectedPanelId,
    setSelectedPanel,
    multiSendIds,
    toggleMultiSendPanel,
  } = useAppStore() as any;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [panel.messages]);

  // 送信はグローバル入力から行われるため、このコンポーネント内では未実装

  return (
    <div
      className={
        "flex flex-col h-full bg-card rounded-lg border " +
        (selectedPanelId === panel.id ? "ring-2 ring-primary" : "")
      }
      onClick={() => setSelectedPanel(panel.id)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30 rounded-t-lg">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-medium text-sm text-foreground">
              Panel {panel.id.split("-")[1]}
            </div>
            <button
              className={
                "text-xs px-2 py-0.5 rounded border " +
                (selectedPanelId === panel.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted/50")
              }
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPanel(panel.id);
              }}>
              {selectedPanelId === panel.id ? "選択中" : "選択"}
            </button>
            <label className="text-xs flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-primary"
                checked={multiSendIds.includes(panel.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleMultiSendPanel(panel.id);
                }}
              />
              複数送信
            </label>
          </div>

          <div className="flex-1 min-w-0">
            <ModelSelector panelId={panel.id} currentModelId={panel.modelId} />
          </div>
        </div>

        {/* Panel Menu */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical className="w-4 h-4" />
          </Button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-popover border rounded-md shadow-lg z-10">
              <div className="py-1">
                <button
                  className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-accent"
                  onClick={() => {
                    clearPanelMessages(panel.id);
                    setShowMenu(false);
                  }}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  クリア
                </button>
                <button
                  className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-accent"
                  onClick={() => {
                    // 直近のユーザーメッセージで再生成
                    const lastUser = [...panel.messages]
                      .reverse()
                      .find((m) => m.role === "user");
                    if (lastUser) {
                      const event = new CustomEvent("panel-regenerate", {
                        detail: { panelId: panel.id, messageId: lastUser.id },
                      });
                      window.dispatchEvent(event);
                    }
                    setShowMenu(false);
                  }}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  再生成
                </button>
                <button
                  className="flex w-full items-center px-3 py-2 text-sm text-foreground hover:bg-accent"
                  onClick={() => {
                    const blob = new Blob(
                      [JSON.stringify(panel.messages, null, 2)],
                      { type: "application/json" }
                    );
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${panel.id}-chat.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setShowMenu(false);
                  }}>
                  <Download className="w-4 h-4 mr-2" />
                  エクスポート
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Prompt Indicator */}
      {panel.customPrompt && (
        <div className="mx-3 mt-2 p-2 bg-primary/10 border border-primary/20 rounded-md">
          <div className="flex items-center gap-2 text-xs">
            <FileText className="w-3 h-3 text-primary" />
            <span className="text-primary font-medium">
              {panel.customPrompt.title}
            </span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto p-3 custom-scrollbar">
        <div className="space-y-4">
          {panel.messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="text-2xl mb-2">💬</div>
              <div>メッセージを送信して会話を始めてください</div>
            </div>
          ) : (
            panel.messages.map((message) => (
              <ChatMessageComponent key={message.id} message={message} />
            ))
          )}
          {panel.isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm">
                {getModelName(panel.modelId)} が考えています...
              </span>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input: グローバル入力に統合 */}
    </div>
  );
}
