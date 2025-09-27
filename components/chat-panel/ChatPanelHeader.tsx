"use client";

import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Check,
  Settings,
  Trash2,
  Layers,
  Copy,
  Grid3X3,
  PanelTop,
  Circle,
  CircleCheck,
} from "lucide-react";
import type { ChatPanel } from "@/types";
import { PANEL_GRADIENTS } from "@/lib/constants";
import { ModelSelector } from "@/components/model-selector";

interface ChatPanelHeaderProps {
  panel: ChatPanel;
  isSelected: boolean;
  isMultiSend: boolean;
  onSelect: () => void;
  onToggleMultiSend: () => void;
  onDelete?: () => void;
  variant?: "minimal" | "glass" | "enhanced";
}

// パネルカラー設定
const getPanelColorScheme = (panelNumber: string) => {
  const schemes = [
    {
      // Blue-Purple-Indigo
      gradient: "linear-gradient(90deg, #3b82f6, #8b5cf6, #6366f1)",
      headerBg: "rgba(59, 130, 246, 0.9)",
      buttonHover: "rgba(99, 102, 241, 0.2)",
      iconColor: "#93c5fd",
      borderColor: "rgba(147, 197, 253, 0.3)",
    },
    {
      // Pink-Purple-Fuchsia
      gradient: "linear-gradient(90deg, #ec4899, #8b5cf6, #d946ef)",
      headerBg: "rgba(236, 72, 153, 0.9)",
      buttonHover: "rgba(217, 70, 239, 0.2)",
      iconColor: "#f9a8d4",
      borderColor: "rgba(249, 168, 212, 0.3)",
    },
    {
      // Emerald-Teal-Cyan
      gradient: "linear-gradient(90deg, #10b981, #14b8a6, #06b6d4)",
      headerBg: "rgba(16, 185, 129, 0.9)",
      buttonHover: "rgba(6, 182, 212, 0.2)",
      iconColor: "#5eead4",
      borderColor: "rgba(94, 234, 212, 0.3)",
    },
    {
      // Orange-Amber-Yellow
      gradient: "linear-gradient(90deg, #fb923c, #f59e0b, #eab308)",
      headerBg: "rgba(251, 146, 60, 0.9)",
      buttonHover: "rgba(234, 179, 8, 0.2)",
      iconColor: "#fcd34d",
      borderColor: "rgba(252, 211, 77, 0.3)",
    },
  ];

  const index = (parseInt(panelNumber) - 1) % schemes.length;
  return schemes[index];
};

// グラスモーフィズムボタンコンポーネント
const GlassButton = ({
  children,
  onClick,
  title,
  isActive = false,
  hoverColor,
  iconColor,
  borderColor,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  isActive?: boolean;
  hoverColor: string;
  iconColor: string;
  borderColor: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-8 h-8 rounded-lg flex items-center justify-center",
      "transition-all duration-300 backdrop-blur-sm",
      "border"
    )}
    style={{
      backgroundColor: isActive
        ? "rgba(255, 255, 255, 0.25)"
        : "rgba(255, 255, 255, 0.1)",
      borderColor: isActive ? "rgba(255, 255, 255, 0.4)" : borderColor,
      boxShadow: isActive
        ? "0 4px 15px rgba(255,255,255,0.2)"
        : "0 2px 8px rgba(0,0,0,0.1)",
    }}
    title={title}>
    <div
      className="transition-all duration-300"
      style={{
        color: isActive ? "white" : iconColor,
        transform: isActive ? "scale(1.15)" : "scale(1)",
      }}>
      {children}
    </div>
  </button>
);

export const ChatPanelHeader = memo(function ChatPanelHeader({
  panel,
  isSelected,
  isMultiSend,
  onSelect,
  onToggleMultiSend,
  onDelete,
  variant = "enhanced",
}: ChatPanelHeaderProps) {
  const panelNumber = useMemo(() => panel.id.split("-")[1], [panel.id]);
  const colorScheme = useMemo(
    () => getPanelColorScheme(panelNumber),
    [panelNumber]
  );

  // ヘッダースタイル
  const headerStyles = useMemo(() => {
    if (variant === "glass" || variant === "enhanced") {
      return {
        background: colorScheme.gradient,
        backdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        borderBottom: `2px solid ${colorScheme.borderColor}`,
        position: "relative" as const,
      };
    }
    return {
      borderBottom: `2px solid rgba(255, 255, 255, 0.1)`,
    };
  }, [variant, colorScheme]);

  const headerClasses = cn(
    "flex items-center justify-between p-4 rounded-t-2xl",
    "transition-all duration-500"
  );

  return (
    <div className={headerClasses} style={headerStyles}>
      {/* Left side - All controls in desired order */}
      <div className="flex items-center gap-3">
        {/* 1. マルチ送信から除外 - シンプルな点灯/消灯アイコン */}
        <button
          onClick={onToggleMultiSend}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "transition-all duration-300 backdrop-blur-sm",
            "border hover:scale-110"
          )}
          style={{
            backgroundColor: isMultiSend
              ? "rgba(34, 197, 94, 0.2)"
              : "rgba(255, 255, 255, 0.1)",
            borderColor: isMultiSend
              ? "rgba(34, 197, 94, 0.6)"
              : colorScheme.borderColor,
            boxShadow: isMultiSend
              ? "0 0 12px rgba(34, 197, 94, 0.4)"
              : "none",
          }}
          title={isMultiSend ? "マルチ送信に含める" : "マルチ送信から除外"}>
          {isMultiSend ? (
            <CircleCheck
              className="w-4 h-4 transition-all duration-200"
              style={{
                color: "#86efac",
                filter: "drop-shadow(0 0 4px rgba(34, 197, 94, 0.6))"
              }}
            />
          ) : (
            <Circle
              className="w-4 h-4"
              style={{ color: colorScheme.iconColor }}
            />
          )}
        </button>

        {/* 2. パネル番号 */}
        <div
          className="px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm border flex items-center gap-2"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderColor: colorScheme.borderColor,
            color: "rgba(255, 255, 255, 0.9)",
          }}>
          <PanelTop
            className="w-4 h-4"
            style={{ color: colorScheme.iconColor }}
          />
          <span>Panel {panelNumber}</span>
        </div>

        {/* 3. モデルセレクター - ヘッダーカラーに合わせて自然に統合 */}
        <div className="model-selector-wrapper">
          <ModelSelector
            panelId={panel.id}
            currentModelId={panel.modelId}
            variant="glass"
            className="!bg-transparent !border-none"
          />
        </div>
      </div>

      {/* Right side - Delete button only */}
      <div className="flex items-center gap-2">
        {/* 4. 削除ボタン（ゴミ箱） */}
        {onDelete && (
          <button
            onClick={onDelete}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              "transition-all duration-300 backdrop-blur-sm",
              "hover:scale-110 active:scale-95",
              "border hover:border-red-400"
            )}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(252, 165, 165, 0.3)",
            }}
            title="パネルを削除">
            <Trash2
              className="w-4 h-4 transition-colors duration-200"
              style={{
                color: "#fca5a5",
              }}
            />
          </button>
        )}

        {/* Selection status indicator (hidden but functional) */}
        <button
          onClick={onSelect}
          className="sr-only"
          aria-label="パネルを選択">
          {isSelected && <Check className="w-4 h-4 text-white" />}
        </button>
      </div>
    </div>
  );
});

ChatPanelHeader.displayName = "ChatPanelHeader";
