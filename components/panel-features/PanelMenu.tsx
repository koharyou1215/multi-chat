"use client";

import { memo, useCallback } from "react";
import { ChatPanel } from "@/types";
import { Button } from "../ui/button";
import {
  Trash2,
  RefreshCw,
  Download,
  FileText,
  Copy,
  Share,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PanelMenuProps {
  panel: ChatPanel;
  onClose: () => void;
  onClear: () => void;
}

interface MenuItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

const MenuItem = memo<MenuItemProps>(({ icon: Icon, label, onClick, danger, disabled }) => (
  <button
    className={cn(
      "flex w-full items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
      "text-left disabled:opacity-50 disabled:cursor-not-allowed",
      danger
        ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    )}
    onClick={onClick}
    disabled={disabled}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
));

MenuItem.displayName = 'MenuItem';

export const PanelMenu = memo<PanelMenuProps>(({ panel, onClose, onClear }) => {
  const handleRegenerate = useCallback(() => {
    // Find the last user message for regeneration
    const lastUserMessage = [...panel.messages]
      .reverse()
      .find((m) => m.role === "user");

    if (lastUserMessage) {
      const event = new CustomEvent("panel-regenerate", {
        detail: { panelId: panel.id, messageId: lastUserMessage.id },
      });
      window.dispatchEvent(event);
    }
    onClose();
  }, [panel.messages, panel.id, onClose]);

  const handleClear = useCallback(() => {
    onClear();
    onClose();
  }, [onClear, onClose]);

  const handleExport = useCallback(() => {
    try {
      const exportData = {
        panelId: panel.id,
        modelId: panel.modelId,
        messages: panel.messages,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${panel.id}-chat-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      // Export failed: ${error}
    }
    onClose();
  }, [panel, onClose]);

  const handleCopyMessages = useCallback(async () => {
    try {
      const chatText = panel.messages
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');

      await navigator.clipboard.writeText(chatText);
    } catch (error) {
      // Copy failed: ${error}
    }
    onClose();
  }, [panel.messages, onClose]);

  const handleShare = useCallback(() => {
    // Placeholder for share functionality
    // Share panel: ${panel.id}
    onClose();
  }, [panel.id, onClose]);

  const hasMessages = panel.messages.length > 0;
  const hasUserMessages = panel.messages.some(m => m.role === 'user');

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
      <div className="p-1">
        <MenuItem
          icon={RefreshCw}
          label="再生成"
          onClick={handleRegenerate}
          disabled={!hasUserMessages}
        />
        <MenuItem
          icon={Copy}
          label="メッセージをコピー"
          onClick={handleCopyMessages}
          disabled={!hasMessages}
        />
        <MenuItem
          icon={Download}
          label="エクスポート"
          onClick={handleExport}
          disabled={!hasMessages}
        />
        <MenuItem
          icon={Share}
          label="共有"
          onClick={handleShare}
          disabled={!hasMessages}
        />

        {/* Separator */}
        <div className="my-1 border-t border-gray-200 dark:border-gray-700" />

        <MenuItem
          icon={Trash2}
          label="メッセージをクリア"
          onClick={handleClear}
          disabled={!hasMessages}
          danger
        />
      </div>
    </div>
  );
});

PanelMenu.displayName = 'PanelMenu';

export default PanelMenu;