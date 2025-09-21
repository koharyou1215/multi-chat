"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  messages: any[];
}

interface FavoriteChat {
  id: string;
  title: string;
  timestamp: Date;
  messages: any[];
}

export function RightPanel({ isOpen, onClose }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<"history" | "favorites">(
    "history"
  );
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([
    {
      id: "1",
      title: "プログラミング相談",
      timestamp: new Date("2024-09-21T10:30:00"),
      messages: [],
    },
    {
      id: "2",
      title: "アイデア出し",
      timestamp: new Date("2024-09-20T15:45:00"),
      messages: [],
    },
  ]);
  const [favorites, setFavorites] = useState<FavoriteChat[]>([
    {
      id: "fav1",
      title: "あの爆笑した会話",
      timestamp: new Date("2024-09-19T14:20:00"),
      messages: [],
    },
    {
      id: "fav2",
      title: "重要な仕事の相談",
      timestamp: new Date("2024-09-18T11:15:00"),
      messages: [],
    },
  ]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const deleteFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-gradient-to-b from-purple-900/30 to-black/60 backdrop-blur-2xl border-l border-purple-500/20 z-50 flex flex-col right-panel">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">チャット管理</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg
              className="w-5 h-5 text-white"
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
            "flex-1 text-sm font-medium transition-colors tab-button",
            activeTab === "history"
              ? "bg-white/10 border-b-2 border-purple-400 text-white"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}>
          💬 履歴
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={cn(
            "flex-1 text-sm font-medium transition-colors tab-button",
            activeTab === "favorites"
              ? "bg-white/10 border-b-2 border-purple-400 text-white"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          )}>
          ⭐ お気に入り
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === "history" && (
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="glass border border-white/10 hover:border-purple-400/30 transition-colors cursor-pointer group chat-item">
                <div className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                  {chat.title}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDate(chat.timestamp)}
                </div>
              </div>
            ))}
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p>履歴がありません</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="space-y-2">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="glass border border-white/10 hover:border-purple-400/30 transition-colors group favorite-item">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors">
                      ⭐ {favorite.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(favorite.timestamp)}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFavorite(favorite.id)}
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
            {favorites.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p>お気に入りがありません</p>
                <p className="text-xs mt-2">
                  ⭐ ボタンで会話をお気に入り登録できます
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
