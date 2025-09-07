"use client";

import { useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { ChatPanel } from "./chat-panel";
import { PanelControls } from "./panel-controls";
import { PromptLibrary } from "./prompt-library";
import { Settings } from "./settings";
import { cn } from "@/lib/utils";
import { BroadcastInput } from "./broadcast-input";

export function MainLayout() {
  const { panels, activePanels, sidebarOpen, toggleSidebar } =
    useAppStore() as any;
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getGridClasses = () =>
    activePanels === 1
      ? "grid-cols-1"
      : activePanels === 2
      ? "grid-cols-1 md:grid-cols-2"
      : activePanels === 3
      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Side Panel */}
      <div
        className={cn(
          "border-r bg-card flex flex-col transition-all duration-300",
          sidebarOpen ? "w-80" : "w-0"
        )}>
        {sidebarOpen && (
          <>
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold text-foreground">
                MultiChat AI
              </h1>
            </div>

            {/* Panel Controls */}
            <div className="p-4">
              <PanelControls
                onShowPromptLibrary={() => setShowPromptLibrary(true)}
                onShowSettings={() => setShowSettings(true)}
              />
            </div>

            {/* Active Prompts Display */}
            <div className="flex-1 p-4 overflow-auto">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                アクティブプロンプト
              </h3>
              <div className="space-y-2">
                {panels.slice(0, activePanels).map((panel) => (
                  <div
                    key={panel.id}
                    className="p-2 rounded-md bg-muted/50 text-xs">
                    <div className="font-medium text-foreground">
                      Panel {panel.id.split("-")[1]}
                    </div>
                    {panel.customPrompt && (
                      <div className="text-muted-foreground mt-1">
                        📜 {panel.customPrompt.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Chat Panels + Global Input */}
      <div className="flex-1 h-full flex flex-col overflow-hidden">
        <div className="p-2 pb-0 flex items-center gap-2">
          <button
            className="px-2 py-1 text-xs border rounded hover:bg-muted/50"
            onClick={toggleSidebar}>
            {sidebarOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
          </button>
        </div>
        <div
          className={cn(
            "grid gap-2 p-2 flex-1 overflow-auto",
            getGridClasses()
          )}>
          {panels.slice(0, activePanels).map((panel) => (
            <ChatPanel key={panel.id} panel={panel} />
          ))}
        </div>
        <div className="sticky bottom-0 bg-background border-t">
          <BroadcastInput />
        </div>
      </div>

      {/* Modals */}
      <PromptLibrary
        open={showPromptLibrary}
        onClose={() => setShowPromptLibrary(false)}
      />

      <Settings open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
