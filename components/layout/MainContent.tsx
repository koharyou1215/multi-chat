"use client";

import { useCallback, memo } from "react";
import { useAppStore } from "@/store/chat-store";
import { ChatPanel } from "../chat-panel/ChatPanel";
import { PanelErrorBoundary } from "../chat-panel/ErrorBoundary";
import { zIndex } from "@/lib/config";
import { cn } from "@/lib/utils";

interface MainContentProps {
  isMobile: boolean;
  showRightPanel: boolean;
  selectedPanels: Set<string>;
  onTogglePanelSelection: (panelId: string) => void;
}

export const MainContent = memo(function MainContent({
  isMobile,
  showRightPanel,
  selectedPanels,
  onTogglePanelSelection,
}: MainContentProps) {
  const { panels, activePanelIds, setPanelCount } = useAppStore();
  const activePanels = activePanelIds.length;

  const handlePanelClose = useCallback(
    (panelId: string) => {
      if (activePanels > 1) {
        setPanelCount(activePanels - 1);
      }
    },
    [activePanels, setPanelCount]
  );

  return (
    <main
      className={cn(
        "overflow-y-auto overflow-x-hidden py-4",
        "scrollbar-thin scrollbar-thumb-purple-400/20 scrollbar-track-transparent",
        isMobile ? "mobile-main" : "flex-1",
        zIndex("MAIN_CONTENT")
      )}
      style={{
        position: "fixed",
        top: "56px",
        left: "0",
        right: isMobile ? "0" : showRightPanel ? "400px" : "0",
        bottom: "0",
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: isMobile
          ? "calc(env(safe-area-inset-top, 0px) + 16px)"
          : "16px",
        paddingBottom:
          "calc(68px + env(safe-area-inset-bottom, 0px) + 16px)",
        backgroundColor: "transparent",
      }}
    >
      {/* Chat Panels Grid */}
      <div className="w-full px-3 md:px-4">
        <div
          className={cn(
            "grid gap-4",
            activePanels === 1
              ? "grid-cols-1"
              : activePanels === 2
              ? "grid-cols-1 md:grid-cols-2"
              : activePanels === 3
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}
        >
          {panels && panels.length > 0 ? (
            panels.slice(0, activePanels).map((panel) => {
              const isSelected = selectedPanels.has(panel.id);
              return (
                <div
                  key={panel.id}
                  className="bg-gradient-to-br from-purple-900/20 via-purple-800/15 to-pink-900/20 backdrop-blur-2xl rounded-2xl border border-purple-500/30 overflow-hidden hover:border-purple-400/50 shadow-[0_20px_60px_rgba(147,51,234,0.3)] hover:shadow-[0_25px_70px_rgba(147,51,234,0.4)] transition-all duration-300"
                  style={{ minHeight: "400px" }}
                >
                  <PanelErrorBoundary panelId={panel.id}>
                    <ChatPanel
                      panel={panel}
                      variant="glass"
                      className="h-full"
                      externalIsSelected={isSelected}
                      onToggleSelection={() => onTogglePanelSelection(panel.id)}
                      onClose={() => handlePanelClose(panel.id)}
                    />
                  </PanelErrorBoundary>
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-4xl mb-4 animate-pulse">⚠️</div>
                <h2 className="text-lg font-semibold mb-2 text-gray-300">
                  パネルを初期化中...
                </h2>
                <p className="text-sm text-gray-400">しばらくお待ちください</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
});

MainContent.displayName = "MainContent";
