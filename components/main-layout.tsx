"use client";

import { useState, useEffect, memo, useCallback } from "react";
import { useAppStore } from "@/store/use-app-store";
import { OptimizedChatPanel as ChatPanel } from "./OptimizedChatPanel";
import { BroadcastInput } from "./broadcast-input";
import { PromptLibrary } from "./prompt-library";
import { Settings } from "./settings";
import { RightPanel } from "./right-panel";
import {
  Menu,
  Settings as SettingsIcon,
  BookOpen,
  History,
  Plus,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const MainLayout = memo(function MainLayout() {
  const { panels, activePanels, setActivePanels, sidebarOpen, toggleSidebar } =
    useAppStore();
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [selectedPanels, setSelectedPanels] = useState<Set<string>>(new Set());

  // パネル選択を切り替える関数
  const togglePanelSelection = useCallback((panelId: string) => {
    console.log("🔄 Toggling panel selection:", panelId);
    setSelectedPanels((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(panelId)) {
        newSet.delete(panelId);
        console.log("❌ Removed panel from selection:", panelId);
      } else {
        newSet.add(panelId);
        console.log("✅ Added panel to selection:", panelId);
      }
      console.log("📋 New selection:", Array.from(newSet));
      return newSet;
    });
  }, []);

  // デバッグログ
  useEffect(() => {
    console.log("🔍 Sidebar open:", sidebarOpen);
    console.log("🔍 Active panels:", activePanels);
    console.log("🔍 Selected panels:", Array.from(selectedPanels));
  }, [sidebarOpen, activePanels, selectedPanels]);

  return (
    <div className="min-h-screen app-shell-bg text-white overflow-hidden relative">
      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute w-96 h-96 top-1/2 right-1/4 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-[2s]" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-[4s]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex h-screen">
        {/* Sidebar - Toggleable */}
        {sidebarOpen && (
          <aside
            className="w-80 bg-gradient-to-b from-purple-900/90 to-black/90 backdrop-blur-2xl border-l border-purple-500/20 p-6 flex flex-col"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.85)",
            }}>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 gradient-primary rounded-xl animate-glow flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  MultiChat AI
                </h1>
                <p className="text-xs text-gray-400">次世代AIチャット体験</p>
              </div>
            </div>

            {/* Panel Control */}
            <div className="mb-6">
              <label className="text-sm text-gray-400 mb-2 block">
                アクティブパネル
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => setActivePanels(1)}
                  className={cn(
                    "flex-1 py-2 px-3 text-sm font-medium transition-colors",
                    activePanels === 1
                      ? "bg-white/10 border-b-2 border-purple-400 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}>
                  1 Panel
                </button>
                <button
                  onClick={() => setActivePanels(2)}
                  className={cn(
                    "flex-1 py-2 px-3 text-sm font-medium transition-colors",
                    activePanels === 2
                      ? "bg-white/10 border-b-2 border-purple-400 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}>
                  2 Panels
                </button>
                <button
                  onClick={() => setActivePanels(3)}
                  className={cn(
                    "flex-1 py-2 px-3 text-sm font-medium transition-colors",
                    activePanels === 3
                      ? "bg-white/10 border-b-2 border-purple-400 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}>
                  3 Panels
                </button>
                <button
                  onClick={() => setActivePanels(4)}
                  className={cn(
                    "flex-1 py-2 px-3 text-sm font-medium transition-colors",
                    activePanels === 4
                      ? "bg-white/10 border-b-2 border-purple-400 text-white"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}>
                  4 Panels
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="text-sm text-gray-400 mb-3">クイックアクション</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowPromptLibrary(true)}
                  className="w-full text-left px-3 py-2 glass rounded-md hover:bg-white/10 transition-all flex items-center gap-2 group">
                  <div className="w-6 h-6 gradient-secondary rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-white text-xs">📚</span>
                  </div>
                  <span className="text-xs">プロンプトライブラリ</span>
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full text-left px-3 py-2 glass rounded-md hover:bg-white/10 transition-all flex items-center gap-2 group">
                  <div className="w-6 h-6 gradient-success rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-white text-xs">⚙️</span>
                  </div>
                  <span className="text-xs">設定</span>
                </button>
              </div>
            </div>

            {/* Active Prompts */}
            <div className="flex-1 overflow-auto custom-scrollbar">
              <h3 className="text-sm text-gray-400 mb-3">
                アクティブプロンプト
              </h3>
              <div className="space-y-2">
                {panels.slice(0, activePanels).map((panel, index) => (
                  <div
                    key={panel.id}
                    className={cn(
                      "p-3 glass rounded-md",
                      panel.isLoading ? "border border-purple-500/30" : ""
                    )}>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          panel.isLoading
                            ? "gradient-primary animate-pulse"
                            : "bg-gray-500"
                        )}
                      />
                      <span className="text-xs font-medium">
                        Panel {index + 1}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {panel.customPrompt?.title || "No prompt selected"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <div
              className="mt-auto pt-4"
              style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">ダークモード</span>
                <label className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-12 h-6 gradient-primary rounded-full peer-checked:gradient-secondary transition-all" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
                </label>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header
            className="glass-dark px-3 py-1"
            style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Menu Button */}
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 glass rounded-md hover:bg-white/10 transition-all">
                  <Menu className="w-4 h-4" />
                </button>
                <h2 className="text-lg font-semibold">マルチAIチャット</h2>
              </div>
              <div className="flex items-center gap-3">
                {/* Favorite Button */}
                <button
                  onClick={() => {
                    const chatData = {
                      id: Date.now().toString(),
                      title: "楽しいチャット",
                      timestamp: new Date(),
                      messages: panels.flatMap((panel) => panel.messages),
                    };
                    console.log("Bookmarked chat:", chatData);
                  }}
                  className="p-1.5 glass rounded-md hover:bg-white/10 transition-all"
                  title="お気に入り登録">
                  <Star className="w-4 h-4" />
                </button>

                {/* New Chat Button */}
                <button
                  onClick={() => {
                    panels.forEach((panel) => {
                      // Clear messages logic would go here
                    });
                  }}
                  className="p-1.5 glass rounded-md hover:bg-white/10 transition-all"
                  title="新規チャット">
                  <Plus className="w-4 h-4" />
                </button>

                {/* History Button */}
                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className="p-1.5 glass rounded-md hover:bg-white/10 transition-all"
                  title="履歴">
                  <History className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Chat Panels Grid */}
          <div className="flex-1 p-6 overflow-auto">
            <div
              className={cn(
                "grid gap-4 h-full",
                activePanels === 1
                  ? "grid-cols-1"
                  : activePanels === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : activePanels === 3
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-2"
              )}
              style={{
                gridTemplateColumns:
                  activePanels === 1
                    ? "1fr"
                    : activePanels === 2
                    ? "repeat(2, 1fr)"
                    : activePanels === 3
                    ? "repeat(3, 1fr)"
                    : "repeat(2, 1fr)",
                gridTemplateRows: activePanels === 4 ? "repeat(2, 1fr)" : "1fr",
              }}>
              {panels.slice(0, activePanels).map((panel) => {
                const isSelected = selectedPanels.has(panel.id);
                console.log(
                  `🔍 Rendering panel ${panel.id} - isSelected:`,
                  isSelected
                );
                console.log(
                  `🔍 Passing to ChatPanel ${panel.id} - isSelected:`,
                  isSelected
                );
                return (
                  <div
                    key={panel.id}
                    className="bg-gradient-to-br from-purple-900/20 via-purple-800/15 to-pink-900/20 backdrop-blur-2xl rounded-2xl border border-purple-500/30 overflow-hidden hover:border-purple-400/50 shadow-[0_20px_60px_rgba(147,51,234,0.3)] hover:shadow-[0_25px_70px_rgba(147,51,234,0.4)] transition-all duration-300">
                    <ChatPanel
                      panel={panel}
                      variant="glass"
                      className="h-full"
                      isSelected={isSelected}
                      onToggleSelection={() => {
                        console.log(
                          `🔄 Passing toggling panel selection: ${panel.id}`
                        );
                        togglePanelSelection(panel.id);
                      }}
                      onClose={() => {
                        console.log(`🚪 Closing panel: ${panel.id}`);
                        // パネルを閉じる処理：アクティブパネル数を減らす
                        if (activePanels > 1) {
                          setActivePanels(activePanels - 1);
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Global Input */}
          <BroadcastInput />
        </main>
      </div>

      {/* Modals */}
      <PromptLibrary
        open={showPromptLibrary}
        onClose={() => setShowPromptLibrary(false)}
      />
      <Settings open={showSettings} onClose={() => setShowSettings(false)} />

      {/* Right Panel */}
      <RightPanel
        isOpen={showRightPanel}
        onClose={() => setShowRightPanel(false)}
      />
    </div>
  );
});
