"use client";

import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/use-app-store";
import { OptimizedChatPanel as ChatPanel } from "./OptimizedChatPanel";
import { BroadcastInput } from "./broadcast-input";
import { PanelControls } from "./panel-controls";
import { PromptLibrary } from "./prompt-library";
import { Settings } from "./settings";
import { Menu, X, MoreVertical, Settings as SettingsIcon, FileText, HelpCircle, LogOut } from "lucide-react";

export function MainLayout() {
  const { panels, activePanels, sidebarOpen, toggleSidebar } = useAppStore();
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  const kebabMenuRef = useRef<HTMLDivElement>(null);

  // Close kebab menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (kebabMenuRef.current && !kebabMenuRef.current.contains(event.target as Node)) {
        setShowKebabMenu(false);
      }
    };

    if (showKebabMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showKebabMenu]);

  return (
    <div className="min-h-screen app-shell-bg text-white overflow-hidden relative">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 gradient-animated opacity-20 pointer-events-none" />

      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute w-96 h-96 top-1/2 right-1/4 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-[2s]" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-[4s]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 glass-dark border-r border-white/10 p-6 flex flex-col relative z-20">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl animate-glow flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text-primary">
                  MultiChat AI
                </h1>
                <p className="text-xs text-gray-400">次世代AIチャット体験</p>
              </div>
            </div>

            {/* Panel Control */}
            <div className="mb-6">
              <PanelControls
                onShowPromptLibrary={() => setShowPromptLibrary(true)}
                onShowSettings={() => setShowSettings(true)}
              />
            </div>

            {/* Active Prompts */}
            <div className="flex-1 overflow-auto custom-scrollbar">
              <h3 className="text-sm text-gray-400 mb-3">アクティブプロンプト</h3>
              <div className="space-y-2">
                {panels.slice(0, activePanels).map((panel) => (
                  <div key={panel.id} className="p-3 glass rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${panel.isLoading ? 'bg-gradient-primary animate-pulse' : 'bg-gray-500'}`} />
                      <span className="text-xs font-medium">Panel {panel.id.split('-')[1]}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {panel.customPrompt?.title || 'No prompt selected'}
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
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-12 h-6 bg-gradient-primary rounded-full peer-checked:bg-gradient-secondary transition-all" />
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
                </label>
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="glass-dark border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Hamburger Menu Button - Enhanced Visual */}
                <button
                  onClick={toggleSidebar}
                  className="p-2.5 glass rounded-lg hover:bg-white/10 transition-all group relative overflow-hidden"
                  title={sidebarOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {sidebarOpen ? (
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform relative z-10" />
                  ) : (
                    <Menu className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" />
                  )}
                </button>
                <h2 className="text-lg font-semibold">マルチAIチャット</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-3 py-1 bg-gradient-success rounded-full text-white animate-pulse">
                  オンライン
                </span>

                {/* Kebab Menu Button - Enhanced Visual */}
                <div className="relative" ref={kebabMenuRef}>
                  <button
                    onClick={() => setShowKebabMenu(!showKebabMenu)}
                    className="p-2.5 glass rounded-lg hover:bg-white/10 transition-all group relative overflow-hidden"
                    title="メニュー"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/0 via-pink-500/20 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <MoreVertical className={`w-5 h-5 transition-all relative z-10 ${showKebabMenu ? 'rotate-90' : ''} group-hover:scale-110`} />
                  </button>

                  {/* Kebab Menu Dropdown */}
                  {showKebabMenu && (
                    <div className="absolute right-0 mt-2 w-48 glass-dark rounded-lg shadow-xl border border-white/20 overflow-hidden z-50 animate-fade-in">
                      <button
                        onClick={() => {
                          setShowSettings(true);
                          setShowKebabMenu(false);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        <span className="text-sm">設定</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowPromptLibrary(true);
                          setShowKebabMenu(false);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">プロンプトライブラリ</span>
                      </button>
                      <div className="border-t border-white/10" />
                      <button
                        onClick={() => {
                          // Help action
                          setShowKebabMenu(false);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-sm">ヘルプ</span>
                      </button>
                      <button
                        onClick={() => {
                          // Logout action
                          setShowKebabMenu(false);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left text-red-400"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">ログアウト</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Chat Panels Grid */}
          <div className="flex-1 p-6 overflow-auto relative z-0">
            <div className={`grid gap-6 ${activePanels === 1 ? 'grid-cols-1' : activePanels === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
              {panels.slice(0, activePanels).map((panel) => (
                <ChatPanel
                  key={panel.id}
                  panel={panel}
                  variant="glass"
                  className="h-[500px] relative"
                />
              ))}
            </div>
          </div>

          {/* Global Input */}
          <BroadcastInput />
        </main>
      </div>

      {/* Modals */}
      <PromptLibrary open={showPromptLibrary} onClose={() => setShowPromptLibrary(false)} />
      <Settings open={showSettings} onClose={() => setShowSettings(false)} />

    </div>
  );
}