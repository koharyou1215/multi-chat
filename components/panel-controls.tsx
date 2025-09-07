"use client";

import { useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "./ui/button";
import { Library, Settings, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { availableModels, getModelsByGroup } from "@/lib/models";

interface PanelControlsProps {
  onShowPromptLibrary: () => void;
  onShowSettings: () => void;
}

export function PanelControls({
  onShowPromptLibrary,
  onShowSettings,
}: PanelControlsProps) {
  const {
    activePanels,
    setPanelCount,
    panels,
    setSelectedPanel,
    selectedPanelId,
    setModelForPanel,
  } = useAppStore() as any;

  const panelOptions = [
    { count: 1, icon: "1", label: "シングル" },
    { count: 2, icon: "2", label: "デュアル" },
    { count: 3, icon: "3", label: "トリプル" },
    { count: 4, icon: "4", label: "クアッド" },
  ];

  return (
    <div className="space-y-4">
      {/* Panel Count Selection */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          パネル数
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {panelOptions.map((option) => (
            <Button
              key={option.count}
              variant={activePanels === option.count ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-12 flex flex-col items-center gap-1 text-xs",
                activePanels === option.count &&
                  "bg-primary text-primary-foreground"
              )}
              onClick={() => setPanelCount(option.count)}>
              <span className="text-lg font-bold">{option.icon}</span>
              <span>{option.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          クイックアクション
        </h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={onShowPromptLibrary}>
            <Library className="w-4 h-4 mr-2" />
            プロンプトライブラリ
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={onShowSettings}>
            <Settings className="w-4 h-4 mr-2" />
            設定
          </Button>
        </div>
      </div>

      {/* Models List */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          モデル一覧
        </h3>
        <div className="space-y-2 max-h-60 overflow-auto custom-scrollbar">
          {Object.entries(getModelsByGroup()).map(([group, models]) => (
            <div key={group}>
              <div className="text-xs text-muted-foreground mb-1">{group}</div>
              <div className="space-y-1">
                {models.map((m) => (
                  <button
                    key={m.id}
                    className={cn(
                      "w-full text-left px-2 py-1 rounded border hover:bg-muted/50 text-sm",
                      panels.find((p) => p.id === selectedPanelId)?.modelId ===
                        m.id && "border-primary"
                    )}
                    onClick={() =>
                      selectedPanelId && setModelForPanel(selectedPanelId, m.id)
                    }>
                    <span className="text-foreground">{m.name}</span>
                  </button>
                ))}
              </div>
              <div className="h-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Panel Layout Preview */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          レイアウトプレビュー
        </h3>
        <div className="bg-muted/30 rounded-md p-2">
          <div
            className={cn(
              "grid gap-1 h-16",
              activePanels === 1 && "grid-cols-1",
              activePanels === 2 && "grid-cols-2",
              activePanels === 3 && "grid-cols-3",
              activePanels === 4 && "grid-cols-2 grid-rows-2"
            )}>
            {Array.from({ length: activePanels }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "bg-primary/20 rounded border flex items-center justify-center cursor-pointer",
                  `border-primary/30`
                )}
                onClick={() => setSelectedPanel(`panel-${i + 1}`)}>
                <span className="text-xs text-primary font-medium">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
