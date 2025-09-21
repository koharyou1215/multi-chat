"use client";

import { useState } from "react";
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

export function MainLayout() {
  const { panels, activePanels, setActivePanels, sidebarOpen, toggleSidebar } =
    useAppStore();
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);

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
        {/* Sidebar - Always visible */}
        <aside className="w-80 bg-gradient-to-b from-purple-900/30 to-black/60 backdrop-blur-2xl border-r border-purple-500/20 p-6 flex flex-col sidebar-wide">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🤖</span>
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
            <label className="text-sm text-gray-400 mb-3 block">
              アクティブパネル
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setActivePanels(1)}
                className={cn(
                  "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  activePanels === 1
                    ? "btn-gradient-primary text-white shadow-lg"
                    : "glass hover-glow-purple text-gray-300"
                )}>
                1 Panel
              </button>
              <button
                onClick={() => setActivePanels(2)}
                className={cn(
                  "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  activePanels === 2
                    ? "btn-gradient-primary text-white shadow-lg"
                    : "glass hover-glow-purple text-gray-300"
                )}>
                2 Panels
              </button>
              <button
                onClick={() => setActivePanels(3)}
                className={cn(
                  "flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                  activePanels === 3
                    ? "btn-gradient-primary text-white shadow-lg"
                    : "glass hover-glow-purple text-gray-300"
                )}>
                3 Panels
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-400 mb-3">クイックアクション</h3>
            <div className="space-y-2">
              <button
                onClick={() => setShowPromptLibrary(true)}
                className="w-full text-left px-4 py-3 glass hover-glow-purple rounded-lg transition-all flex items-center gap-3 group">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm">プロンプトライブラリ</span>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="w-full text-left px-4 py-3 glass hover-glow-purple rounded-lg transition-all flex items-center gap-3 group">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <SettingsIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm">設定</span>
              </button>
            </div>
          </div>

          {/* Active Prompts */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <h3 className="text-sm text-gray-400 mb-3">アクティブプロンプト</h3>
            <div className="space-y-2">
              {panels.slice(0, activePanels).map((panel, index) => (
                <div
                  key={panel.id}
                  className={cn(
                    "p-3 rounded-lg backdrop-blur transition-all",
                    panel.isLoading
                      ? "bg-purple-500/20 border border-purple-500/30"
                      : "bg-white/5 border border-white/10"
                  )}>
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        panel.isLoading
                          ? "bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse"
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
          <div className="mt-auto pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">ダークモード</span>
              <label className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-12 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="glass-dark backdrop-blur-2xl border-b border-white/20 px-6 py-4 header-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Menu Button */}
                <button
                  onClick={toggleSidebar}
                  className="p-2 header-button rounded-2xl transition-all">
                  <Menu className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold">マルチAIチャット</h2>
              </div>
              <div className="flex items-center gap-3">
                {/* Favorite Button */}
                <button
                  onClick={() => {
                    // Bookmark current chat
                    const chatData = {
                      id: Date.now().toString(),
                      title: "楽しいチャット",
                      timestamp: new Date(),
                      messages: panels.flatMap((panel) => panel.messages),
                    };
                    console.log("Bookmarked chat:", chatData);
                  }}
                  className="header-button favorite-button flex items-center gap-2"
                  title="お気に入り登録">
                  <Star className="w-4 h-4" />
                  <span className="text-sm">⭐</span>
                </button>

                {/* New Chat Button */}
                <button
                  onClick={() => {
                    // Reset all panels
                    panels.forEach((panel) => {
                      // Clear messages logic would go here
                    });
                  }}
                  className="header-button flex items-center gap-2"
                  title="新規チャット">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">新規🆕</span>
                </button>

                {/* History Button */}
                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className="header-button flex items-center gap-2"
                  title="履歴">
                  <History className="w-4 h-4" />
                  <span className="text-sm">履歴📚</span>
                </button>
              </div>
            </div>
          </header>

          {/* Chat Panels Grid */}
          <div className="flex-1 p-6 overflow-auto">
            <div
              className={cn(
                "grid gap-6 h-full",
                activePanels === 1
                  ? "grid-cols-1"
                  : activePanels === 2
                  ? "grid-cols-1 lg:grid-cols-2"
                  : "grid-cols-1 lg:grid-cols-3"
              )}>
              {panels.slice(0, activePanels).map((panel) => (
                <div
                  key={panel.id}
                  className="bg-gradient-to-br from-purple-900/20 via-purple-800/15 to-pink-900/20 backdrop-blur-2xl rounded-2xl border border-purple-500/30 overflow-hidden hover:border-purple-400/50 shadow-[0_20px_60px_rgba(147,51,234,0.3)] hover:shadow-[0_25px_70px_rgba(147,51,234,0.4)] transition-all duration-300">
                  <ChatPanel panel={panel} variant="glass" className="h-full" />
                </div>
              ))}
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
}
