"use client";

import { useState, useEffect, memo, useCallback } from "react";
import { useAppStore } from "@/store/use-app-store";
import { ChatPanel } from "./chat-panel/ChatPanel";
import { PanelErrorBoundary } from "./chat-panel/ErrorBoundary";
import { BroadcastInput } from "./broadcast-input";
import { PromptLibrary } from "./prompt-library";
import { Settings } from "./settings";
import { RightPanel } from "./right-panel";
import { zIndex } from "@/lib/z-index";
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
  const { panels, activePanels, setPanelCount, sidebarOpen, toggleSidebar, initializePanels, clearPanelMessages, clearAllMessages, addFavorite } =
    useAppStore();
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [selectedPanels, setSelectedPanels] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // クライアントサイドでのみ実行
  useEffect(() => {
    setIsMounted(true);
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adjust main/footer positioning on mobile when soft keyboard is shown using visualViewport
  useEffect(() => {
    if (!isMobile || typeof window === 'undefined') return;

    const onViewportChange = () => {
      const vv = (window as any).visualViewport;
      const footer = document.querySelector('[data-app-footer]') as HTMLElement | null;
      const mainEl = document.querySelector('main') as HTMLElement | null;
      if (!vv || !footer || !mainEl) return;

      // When keyboard opens, visualViewport.height shrinks; compute bottom inset
      const viewportHeight = vv.height;
      const layoutHeight = window.innerHeight;
      const bottomInset = Math.max(0, layoutHeight - viewportHeight);

      footer.style.transform = `translateY(-${bottomInset}px)`;
      mainEl.style.paddingBottom = `${(footer.offsetHeight || 80) + bottomInset}px`;
    };

    window.addEventListener('resize', onViewportChange);
    if ((window as any).visualViewport) {
      (window as any).visualViewport.addEventListener('resize', onViewportChange);
    }
    // initial call
    setTimeout(onViewportChange, 100);

    return () => {
      window.removeEventListener('resize', onViewportChange);
      if ((window as any).visualViewport) {
        (window as any).visualViewport.removeEventListener('resize', onViewportChange);
      }
      // reset styles
      const footer = document.querySelector('[data-app-footer]') as HTMLElement | null;
      const mainEl = document.querySelector('main') as HTMLElement | null;
      if (footer) footer.style.transform = '';
      if (mainEl) mainEl.style.paddingBottom = '';
    };
  }, [isMobile]);

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

  // SSRとクライアントの不一致を防ぐ
  if (!isMounted) {
    return (
      <div className="fixed inset-0 flex flex-col app-shell-bg text-white overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4 animate-pulse">⚡</div>
            <p className="text-gray-400">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col app-shell-bg text-white overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute w-96 h-96 top-1/2 right-1/4 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-[2s]" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-[4s]" />
      </div>

      {/* Header */}
      <header
        className={cn(
          "px-4 md:px-6 glass-dark backdrop-blur-xl border-b border-white/10",
          isMobile ? "mobile-header" : "flex-shrink-0 h-14",
          zIndex('HEADER')
        )}
        style={isMobile ? {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          background: 'rgba(31, 41, 55, 0.98)'
        } : {}}>
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-4">
            {/* Menu Button - Touch optimized */}
            <button
              onClick={toggleSidebar}
              className="min-h-[44px] min-w-[44px] p-2.5 glass rounded-md hover:bg-white/10 transition-all flex items-center justify-center">
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base md:text-lg font-semibold hidden sm:block">マルチAIチャット</h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Favorite Button - Touch optimized */}
            <button
              onClick={() => {
                const activeMessages = panels
                  .slice(0, activePanels)
                  .flatMap(panel => panel.messages || [])
                  .filter(msg => msg.role === 'assistant');

                if (activeMessages.length > 0) {
                  const lastMessage = activeMessages[activeMessages.length - 1];
                  addFavorite(lastMessage);
                  setShowRightPanel(true);
                  console.log("✨ Added to favorites:", lastMessage.content.substring(0, 50) + "...");
                } else {
                  console.log("⚠️ No messages to add to favorites");
                }
              }}
              className="min-h-[44px] min-w-[44px] p-2.5 glass rounded-lg hover:bg-yellow-500/20 transition-all border border-white/10 hover:border-yellow-500/30 flex items-center justify-center"
              title="お気に入りに追加">
              <Star className="w-5 h-5 text-yellow-400" />
            </button>

            {/* New Chat Button - Touch optimized */}
            <button
              onClick={() => {
                if (confirm("すべてのチャットをクリアしますか？")) {
                  clearAllMessages();
                  console.log("🔄 All chats cleared");
                }
              }}
              className="min-h-[44px] min-w-[44px] p-2.5 glass rounded-lg hover:bg-green-500/20 transition-all border border-white/10 hover:border-green-500/30 flex items-center justify-center"
              title="新規チャット">
              <Plus className="w-5 h-5 text-green-400" />
            </button>

            {/* Right Sidebar Toggle Button - Touch optimized */}
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className={cn(
                "min-h-[44px] min-w-[44px] p-2.5 glass rounded-lg transition-all border flex items-center justify-center",
                showRightPanel
                  ? "bg-purple-500/20 border-purple-500/50"
                  : "hover:bg-purple-500/20 border-white/10 hover:border-purple-500/30"
              )}
              title="右サイドバー">
              <History className="w-5 h-5 text-purple-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className={cn("absolute inset-0 bg-black/50 md:hidden", zIndex('SIDEBAR_OVERLAY'))}
            onClick={toggleSidebar}
          />
        )}

        {/* Sidebar - Toggleable */}
        {(sidebarOpen || !isMobile) && (
          <aside
            className={cn(
              "glass-dark border-r border-white/10 p-4 flex flex-col overflow-y-auto",
              isMobile ? `fixed top-14 bottom-0 left-0 w-64 ${zIndex('SIDEBAR')}` : "relative w-64 h-full"
            )}
            style={{
              background: "rgba(31, 41, 55, 0.95)",
              backdropFilter: "blur(10px)",
              transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
              transition: isMobile ? 'transform 0.3s ease-in-out' : 'none'
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
                  onClick={() => setPanelCount(1)}
                  className={cn(
                    "flex-1 min-h-[44px] py-2 px-2 md:px-3 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer",
                    activePanels === 1
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
                  )}>
                  1
                </button>
                <button
                  onClick={() => setPanelCount(2)}
                  className={cn(
                    "flex-1 min-h-[44px] py-2 px-2 md:px-3 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer",
                    activePanels === 2
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
                  )}>
                  2
                </button>
                <button
                  onClick={() => setPanelCount(3)}
                  className={cn(
                    "flex-1 min-h-[44px] py-2 px-2 md:px-3 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer",
                    activePanels === 3
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
                  )}>
                  3
                </button>
                <button
                  onClick={() => setPanelCount(4)}
                  className={cn(
                    "flex-1 min-h-[44px] py-2 px-2 md:px-3 rounded-lg text-xs md:text-sm font-medium transition-all cursor-pointer",
                    activePanels === 4
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                      : "bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 border border-white/10"
                  )}>
                  4
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
        <main
          className={cn(
            isMobile
              ? "mobile-main"
              : "flex-1 overflow-y-auto overflow-x-hidden px-4 md:px-6"
          )}
          style={isMobile ? {
            position: 'fixed',
            top: '56px',
            bottom: '80px',
            left: 0,
            right: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            width: '100%'
          } : {}}>
          {/* Chat Panels Grid */}
          <div className={isMobile ? "p-2" : "p-4"} style={{ width: '100%' }}>
            <div
              className={cn(
                "grid gap-4",
                activePanels === 1
                  ? "grid-cols-1"
                  : activePanels === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : activePanels === 3
                  ? "grid-cols-1 lg:grid-cols-3"
                  : "grid-cols-1 md:grid-cols-2"
              )}
              >
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
                      className="bg-gradient-to-br from-purple-900/20 via-purple-800/15 to-pink-900/20 backdrop-blur-2xl rounded-2xl border border-purple-500/30 overflow-hidden hover:border-purple-400/50 shadow-[0_20px_60px_rgba(147,51,234,0.3)] hover:shadow-[0_25px_70px_rgba(147,51,234,0.4)] transition-all duration-300"
                      style={{ minHeight: "400px" }}>
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
                            if (activePanels > 1) {
                              setPanelCount(activePanels - 1);
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

      {/* Footer */}
      <div
        data-app-footer
        className={cn(
          "glass-dark backdrop-blur-xl border-t border-white/10 px-3 md:px-4 py-3",
          isMobile ? "mobile-footer" : "flex-shrink-0",
          zIndex('FOOTER')
        )}
        style={isMobile ? {
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          height: '80px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          background: 'rgba(31, 41, 55, 0.98)',
          boxSizing: 'border-box'
        } : {}}>
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