"use client";

import { useState, useEffect, memo, useCallback } from "react";
import { useAppStore } from "@/store/use-app-store";
import { ChatPanel } from "./chat-panel/ChatPanel";
import { PanelErrorBoundary } from "./chat-panel/ErrorBoundary";
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
  const { panels, activePanels, setActivePanels, sidebarOpen, toggleSidebar, initializePanels, clearPanelMessages, clearAllMessages, addFavorite } =
    useAppStore();
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [selectedPanels, setSelectedPanels] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

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

  // ウィンドウサイズ変更を監視
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // パネル初期化とデバッグログ
  useEffect(() => {
    if (!isInitialized) {
      console.log("🚀 Initializing panels...");
      if (!panels || panels.length === 0) {
        console.log("⚠️ No panels found, initializing with default count:", activePanels || 2);
        initializePanels(activePanels || 2);
      } else {
        console.log("✅ Found existing panels:", panels.map(p => p.id));
      }
      setIsInitialized(true);
    }
    console.log("🔍 Sidebar open:", sidebarOpen);
    console.log("🔍 Active panels:", activePanels);
    console.log("🔍 Available panels:", panels?.map(p => ({ id: p.id, hasMessages: p.messages?.length || 0 })));
    console.log("🔍 Selected panels:", Array.from(selectedPanels));
  }, [sidebarOpen, activePanels, selectedPanels, panels, isInitialized, initializePanels]);

  return (
    <div className="h-dvh app-shell-bg text-white overflow-hidden relative flex flex-col">
      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute w-96 h-96 top-1/2 right-1/4 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-[2s]" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-[4s]" />
      </div>

      {/* Fixed Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 glass-dark px-4 py-2 backdrop-blur-xl bg-black/30"
        style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)", height: "60px", margin: 0, inset: "0 0 auto 0" }}>
        <div className="flex items-center justify-between h-full">
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
                // Get the last message from active panels
                const activeMessages = panels
                  .slice(0, activePanels)
                  .flatMap(panel => panel.messages || [])
                  .filter(msg => msg.role === 'assistant');

                if (activeMessages.length > 0) {
                  const lastMessage = activeMessages[activeMessages.length - 1];
                  addFavorite(lastMessage);
                  // Show right panel on favorites tab
                  setShowRightPanel(true);
                  console.log("✨ Added to favorites:", lastMessage.content.substring(0, 50) + "...");
                } else {
                  console.log("⚠️ No messages to add to favorites");
                }
              }}
              className="p-2 glass rounded-lg hover:bg-yellow-500/20 transition-all border border-white/10 hover:border-yellow-500/30"
              title="お気に入りに追加">
              <Star className="w-4 h-4 text-yellow-400" />
            </button>

            {/* New Chat Button */}
            <button
              onClick={() => {
                if (confirm("すべてのチャットをクリアしますか？")) {
                  // Clear all messages using the store method
                  clearAllMessages();
                  console.log("🔄 All chats cleared");
                }
              }}
              className="p-2 glass rounded-lg hover:bg-green-500/20 transition-all border border-white/10 hover:border-green-500/30"
              title="新規チャット">
              <Plus className="w-4 h-4 text-green-400" />
            </button>

            {/* Right Sidebar Toggle Button */}
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={cn(
                "p-2 glass rounded-lg transition-all border",
                showRightPanel
                  ? "bg-purple-500/20 border-purple-500/50"
                  : "hover:bg-purple-500/20 border-white/10 hover:border-purple-500/30"
              )}
              title="右サイドバー">
              <History className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggleSidebar}
          style={{ top: "60px", bottom: "80px" }}
        />
      )}

      {/* Main Container */}
      <div className="relative z-10 flex" style={{
        height: "calc(100dvh - 140px)", /* Total height minus header (60px) and footer (80px) */
        marginTop: "60px",
        marginBottom: "80px"
      }}>
        {/* Sidebar - Toggleable */}
        {sidebarOpen && (
          <aside
            className={cn(
              "w-64 glass-dark border-r border-white/10 p-4 flex flex-col flex-shrink-0",
              sidebarOpen ? "open" : ""
            )}
            style={{
              background: "rgba(31, 41, 55, 0.95)",
              backdropFilter: "blur(10px)",
              minWidth: "256px",
              maxWidth: "256px",
            }}>
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
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
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">
                アクティブパネル
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setActivePanels(1)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer",
                    activePanels === 1
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
                  )}>
                  1 Panel
                </button>
                <button
                  onClick={() => setActivePanels(2)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer",
                    activePanels === 2
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
                  )}>
                  2 Panels
                </button>
                <button
                  onClick={() => setActivePanels(3)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer",
                    activePanels === 3
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
                  )}>
                  3 Panels
                </button>
                <button
                  onClick={() => setActivePanels(4)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer",
                    activePanels === 4
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
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
                  className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center gap-3 group cursor-pointer">
                  <div className="w-6 h-6 gradient-secondary rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-white text-xs">📚</span>
                  </div>
                  <span className="text-xs">プロンプトライブラリ</span>
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center gap-3 group cursor-pointer">
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
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* Chat Panels Grid */}
          <div className="flex-1 p-4 min-h-0">
            <div
              className={cn(
                "grid gap-4 h-full min-h-0",
                activePanels === 1
                  ? "grid-cols-1"
                  : activePanels === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : activePanels === 3
                  ? "grid-cols-1 lg:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2"
              )}
              style={{
                gridTemplateColumns:
                  activePanels === 1
                    ? "1fr"
                    : activePanels === 2
                    ? windowWidth >= 768 ? "repeat(2, 1fr)" : "1fr"
                    : activePanels === 3
                    ? windowWidth >= 1024 ? "repeat(3, 1fr)" : "1fr"
                    : windowWidth >= 768 ? "repeat(2, 1fr)" : "1fr",
                gridTemplateRows: activePanels === 4 && windowWidth >= 768 ? "repeat(2, 1fr)" : activePanels > 1 && windowWidth < 768 ? `repeat(${activePanels}, auto)` : "1fr",
              }}>
              {panels && panels.length > 0 ? (
                panels.slice(0, activePanels).map((panel) => {
                  const isSelected = selectedPanels.has(panel.id);
                  console.log(
                    `🔍 Rendering panel ${panel.id} - isSelected:`,
                    isSelected
                  );
                  return (
                    <div
                      key={panel.id}
                      className="bg-gradient-to-br from-purple-900/20 via-purple-800/15 to-pink-900/20 backdrop-blur-2xl rounded-2xl border border-purple-500/30 overflow-hidden hover:border-purple-400/50 shadow-[0_20px_60px_rgba(147,51,234,0.3)] hover:shadow-[0_25px_70px_rgba(147,51,234,0.4)] transition-all duration-300 min-h-0">
                      <PanelErrorBoundary panelId={panel.id}>
                        <ChatPanel
                          panel={panel}
                          variant="glass"
                          className="h-full"
                          externalIsSelected={isSelected}
                          onToggleSelection={() => {
                            console.log(
                              `🔄 Toggling panel selection: ${panel.id}`
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
                      </PanelErrorBoundary>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">⚠️</div>
                    <h2 className="text-lg font-semibold mb-2 text-gray-300">パネルを初期化中...</h2>
                    <p className="text-sm text-gray-400">しばらくお待ちください</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Fixed Footer - Global Input */}
      <div className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-black/30" style={{ height: "80px", margin: 0, inset: "auto 0 0 0" }}>
        <BroadcastInput />
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
