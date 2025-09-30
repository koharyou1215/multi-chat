"use client";

import { useState } from "react";
import ReactDOM from "react-dom";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import type { ChatMessage } from "@/types";
import { Sparkles, X } from "lucide-react";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RightPanel({ isOpen, onClose }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<"history" | "favorites" | "prompts">(
    "history"
  );

  // ストアから実際のデータを取得
  const store = useAppStore();
  const chatHistory = store.getChatHistories();
  const panels = store.panels || [];
  const applyPromptToPanel = store.applyPromptToPanel;

  // お気に入りはストアで管理する（永続化済み）
  const favorites = store.favorites || [];
  const addFavorite = (message: ChatMessage) => store.addFavorite(message);
  const removeFavorite = (id: string) => store.removeFavorite(id);

  const formatDate = (date?: Date | string | number | null) => {
    try {
      if (!date) {
        return new Intl.DateTimeFormat("ja-JP", {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date());
      }

      const d = date instanceof Date ? date : new Date(date);

      if (isNaN(d.getTime())) {
        return new Intl.DateTimeFormat("ja-JP", {
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date());
      }

      return new Intl.DateTimeFormat("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch (error) {
      return new Intl.DateTimeFormat("ja-JP", {
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
    }
  };

  const loadChatHistory = (historyId: string) => {
    store.loadChatHistory(historyId);
    onClose(); // 履歴を選択したらパネルを閉じる
  };

  const deleteChatHistory = (historyId: string) => {
    store.deleteChatHistory(historyId);
  };

  const saveCurrentChat = () => {
    store.saveCurrentChat();
  };

  const deleteFavorite = (id: string) => {
    store.removeFavorite(id);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "100vw",
          height: "100vh",
          zIndex: 99998,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      />
      {/* 右パネル */}
      <div
        className="fixed inset-y-0 right-0 w-80 bg-gradient-to-b from-purple-900/90 to-black/90 backdrop-blur-2xl border-l border-purple-500/20 z-50 flex flex-col right-panel"
        style={{
          position: "fixed",
          top: "0",
          right: "0",
          width: "320px",
          height: "100vh",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "rgba(0, 0, 0, 0.65)",
        }}>
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">チャット管理</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-3 hover:bg-red-500/20 rounded-lg transition-colors bg-red-500/10 border border-red-500/30"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.5)",
                padding: "12px",
                borderRadius: "8px",
              }}>
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab("history")}
            className={cn(
              "flex-1 text-sm font-medium transition-colors tab-button rounded-none border border-white/10",
              activeTab === "history"
                ? "bg-white/10 border-b-2 border-purple-400 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}>
            💬 履歴
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={cn(
              "flex-1 text-sm font-medium transition-colors tab-button rounded-none border border-white/10",
              activeTab === "favorites"
                ? "bg-white/10 border-b-2 border-purple-400 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}>
            ⭐ お気に入り
          </button>
          <button
            onClick={() => setActiveTab("prompts")}
            className={cn(
              "flex-1 text-sm font-medium transition-colors tab-button rounded-none border border-white/10",
              activeTab === "prompts"
                ? "bg-white/10 border-b-2 border-purple-400 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}>
            ✨ プロンプト
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === "history" && (
            <div className="space-y-3">
              {/* Save Current Chat Button */}
              <button
                onClick={saveCurrentChat}
                className="w-full p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-none border border-white/10 text-white font-medium transition-all">
                💾 現在のチャットを保存
              </button>

              {/* Chat History List */}
              <div className="space-y-2">
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className="glass border border-white/10 hover:border-purple-400/30 transition-colors group chat-item rounded-lg p-3 bg-white/5"
                    style={{ backdropFilter: "blur(6px)" }}>
                    <div className="flex items-center justify-between">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => loadChatHistory(chat.id)}>
                        <div className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                          {chat.title}
                        </div>
                        <div className="text-xs text-white/70 mt-1">
                          {formatDate(chat.timestamp)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChatHistory(chat.id);
                        }}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100">
                        <svg
                          className="w-4 h-4 text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {chatHistory.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <p>履歴がありません</p>
                    <p className="text-xs mt-2">
                      チャットを開始すると、上のボタンで保存できます
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "favorites" && (
            <div className="space-y-2">
              {favorites.length > 0 ? (
                favorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="glass border border-white/10 hover:border-purple-400/30 transition-colors group favorite-item rounded-lg p-3 bg-white/5"
                    style={{ backdropFilter: "blur(6px)" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                          ⭐ {favorite.content.slice(0, 40)}
                        </div>
                        <div className="text-xs text-white/70 mt-1">
                          {formatDate(favorite.timestamp)}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFavorite(favorite.id)}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100">
                        <svg
                          className="w-4 h-4 text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>お気に入りがありません</p>
                  <p className="text-xs mt-2">
                    ⭐ メッセージをお気に入り登録できます
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "prompts" && (
            <div className="space-y-3">
              <div className="text-xs text-gray-400 mb-3">
                各パネルで使用中のプロンプト
              </div>
              {panels.map((panel) => (
                <div
                  key={panel.id}
                  className="glass border border-white/10 hover:border-purple-400/30 transition-colors group rounded-lg p-3 bg-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 mb-1">
                        パネル {panel.id.replace('panel-', '')}
                      </div>
                      {panel.customPrompt ? (
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span className="text-sm text-white">
                            {panel.customPrompt.title}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          プロンプトなし
                        </span>
                      )}
                    </div>
                    {panel.customPrompt && (
                      <button
                        onClick={() => applyPromptToPanel(panel.id, '')}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="プロンプトをクリア">
                        <X className="w-3 h-3 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {panels.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <p>アクティブなパネルがありません</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
