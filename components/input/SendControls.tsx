"use client";

import { Send, Sparkles, Paperclip } from "lucide-react";

interface SendControlsProps {
  onSend: () => void;
  onOptimize: () => void;
  onAttach: () => void;
  canSend: boolean;
  canOptimize: boolean;
  isOptimizing: boolean;
  optimizeTooltip?: string;
}

export function SendControls({
  onSend,
  onOptimize,
  onAttach,
  canSend,
  canOptimize,
  isOptimizing,
  optimizeTooltip = "プロンプトを最適化",
}: SendControlsProps) {
  return (
    <>
      {/* File Attachment Button */}
      <button
        className="min-h-[36px] min-w-[36px] px-2 py-1.5 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0 flex items-center justify-center border border-white/50"
        style={{
          background: "transparent",
          color: "white",
        }}
        onClick={onAttach}
        title="ファイルを添付"
      >
        <Paperclip className="w-3.5 h-3.5" style={{ color: "white" }} />
      </button>

      {/* Send Button */}
      <button
        className="min-h-[36px] min-w-[36px] px-2.5 py-1.5 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 group flex-shrink-0 border border-white/50 whitespace-nowrap"
        style={{
          background: "transparent",
          color: "white",
        }}
        onClick={onSend}
        disabled={!canSend}
        title="メッセージを送信"
      >
        <Send
          className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
          style={{ color: "white" }}
        />
      </button>

      {/* Optimize Button */}
      <button
        className="min-h-[36px] min-w-[36px] px-2.5 py-1.5 rounded-xl font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 group flex-shrink-0 border border-white/50 disabled:opacity-50 whitespace-nowrap"
        style={{
          background: "transparent",
          color: "white",
        }}
        onClick={onOptimize}
        disabled={!canOptimize || isOptimizing}
        title={optimizeTooltip}
      >
        <Sparkles
          className={`w-3.5 h-3.5 ${isOptimizing ? "animate-pulse" : ""}`}
          style={{ color: "white" }}
        />
      </button>
    </>
  );
}
