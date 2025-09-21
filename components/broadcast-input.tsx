"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { Button } from "./ui/button";
import { Send, Paperclip, X, Clipboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import { useOpenRouter } from "@/hooks/use-openrouter";
import { generateId } from "@/lib/utils";
import type { Attachment } from "@/types";

interface BroadcastInputProps {
  variant?: "glass" | "simple";
}

export function BroadcastInput({ variant = "glass" }: BroadcastInputProps) {
  const { panels, activePanels, selectedPanelId, multiSendIds } =
    useAppStore() as any;
  const { sendMessage, isConfigured } = useOpenRouter();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const visiblePanels = panels.slice(0, activePanels);
  const isAnyLoading = visiblePanels.some((p: any) => p.isLoading);
  const isDisabled = isAnyLoading || !isConfigured;

  // JavaScriptで強制適用
  useEffect(() => {
    const forceButtonStyles = () => {
      const buttons = document.querySelectorAll(".glass-dark button");
      buttons.forEach((btn: any) => {
        // お気に入りボタンは特別な色
        if (
          btn.classList.contains("favorite-button") ||
          btn.title === "お気に入り登録"
        ) {
          btn.style.background = "linear-gradient(135deg, #ff9a9e, #fad0c4)";
          btn.style.color = "#2c3e50";
          // アイコンも濃い色に
          const icons = btn.querySelectorAll("*");
          icons.forEach((icon: any) => {
            icon.style.color = "#2c3e50";
          });
        } else {
          btn.style.background =
            "linear-gradient(135deg, #9333ea 0%, #ec4899 100%)";
          btn.style.color = "white";
          // アイコンも白に
          const icons = btn.querySelectorAll("*");
          icons.forEach((icon: any) => {
            icon.style.color = "white";
          });
        }

        // ボーダーを強制適用
        btn.style.setProperty(
          "border",
          "1px solid rgba(255, 255, 255, 0.5)",
          "important"
        );
        btn.style.setProperty("border-width", "1px", "important");
        btn.style.setProperty("border-style", "solid", "important");
        btn.style.setProperty(
          "border-color",
          "rgba(255, 255, 255, 0.5)",
          "important"
        );
        btn.style.borderRadius = "20px";
        btn.style.padding = "8px 16px";
        btn.style.margin = "4px";
        btn.style.display = "inline-flex";
        btn.style.alignItems = "center";
        btn.style.justifyContent = "center";
        btn.style.gap = "8px";
        btn.style.transition = "all 0.2s ease";
        btn.style.boxShadow =
          "0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 5px rgba(255, 255, 255, 0.2)";
      });
    };

    // 即座に実行
    forceButtonStyles();

    // 少し遅らせて再実行（DOMが完全に読み込まれた後）
    setTimeout(forceButtonStyles, 100);
    setTimeout(forceButtonStyles, 500);
    setTimeout(forceButtonStyles, 1000);
    setTimeout(forceButtonStyles, 2000);
    setTimeout(forceButtonStyles, 3000);

    // さらに確実にするために、MutationObserverも追加
    const observer = new MutationObserver(() => {
      setTimeout(forceButtonStyles, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || !isConfigured) return;

    setValue("");

    // チェックボックスで選択されたパネルに送信
    const targets =
      multiSendIds.length > 0
        ? visiblePanels.filter((p: any) => multiSendIds.includes(p.id))
        : visiblePanels;

    for (const panel of targets) {
      await sendMessage(
        panel.id,
        panel.modelId,
        trimmed,
        panel.messages || [],
        panel.customPrompt?.content,
        attachments
      );
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
    setAttachments([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newAttachments: Attachment[] = files.map((file) => ({
      id: generateId(),
      type: file.type.startsWith("image/") ? "image" : "file",
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      mimeType: file.type,
    }));
    setAttachments([...attachments, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Paste function
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setValue(value + text);
      adjustTextareaHeight();
    } catch (err) {
      console.error("貼り付けに失敗:", err);
    }
  };

  // Style configurations based on variant
  const containerClass =
    variant === "glass"
      ? "p-6 bg-gradient-to-t from-purple-900/60 via-purple-800/40 to-transparent backdrop-blur-3xl border-t border-white/30 shadow-2xl"
      : "p-3 border-t bg-background";

  const inputWrapperClass =
    variant === "glass"
      ? "flex flex-col gap-4 px-6 py-5 glass-dark backdrop-blur-2xl rounded-2xl"
      : "rounded-lg border p-2 flex items-end space-x-2";

  const selectClass =
    variant === "glass"
      ? "text-sm bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-xl rounded-lg px-3 py-2 border border-purple-400/30 hover:border-purple-400/50 hover:from-purple-600/40 hover:to-pink-600/40 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 text-white font-medium"
      : "text-xs border rounded px-2 py-1 bg-background";

  const attachButtonClass =
    variant === "glass"
      ? "h-10 w-10 flex-shrink-0 bg-purple-600/50 hover:bg-purple-600/70 border border-purple-500/50 hover:border-purple-400/70 hover:scale-105 transition-all rounded-lg text-white"
      : "h-8 w-8 flex-shrink-0";

  const sendButtonClass =
    variant === "glass"
      ? "h-10 w-10 flex-shrink-0 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
      : "h-8 w-8 flex-shrink-0";

  const attachmentClass =
    variant === "glass"
      ? "px-2 py-1 glass rounded flex items-center gap-1"
      : "px-2 py-1 bg-muted/50 rounded";

  return (
    <div className={containerClass}>
      <div className="max-w-5xl mx-auto">
        <div className={inputWrapperClass}>
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-white/10">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span className={attachmentClass}>{file.name}</span>
                  <button
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Main Input Bar */}
          <div className="flex items-center gap-6 w-full px-2">
            {/* File Attachment Button */}
            <button
              className="px-3 py-2 rounded-2xl hover:opacity-90 transition-opacity flex-shrink-0 flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #9333ea 0%, #ec4899 100%)",
                color: "#2c3e50",
              }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isDisabled}
              title="ファイルを添付">
              <Paperclip className="w-4 h-4" style={{ color: "#2c3e50" }} />
            </button>

            {/* Text Input Area */}
            <div className="flex-1 glass-dark rounded-2xl px-4 py-3 min-h-[48px] flex items-center">
              <textarea
                ref={textareaRef}
                className="w-full resize-none bg-transparent border-0 outline-none text-white placeholder:text-gray-400 focus:ring-0 text-sm"
                placeholder={
                  !isConfigured
                    ? "APIキーを設定してください"
                    : "メッセージを入力... (Cmd+Enterで送信)"
                }
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                disabled={isDisabled}
                rows={1}
                style={{
                  minHeight: "20px",
                  maxHeight: "120px",
                  color: "#ffffff !important",
                }}
              />
            </div>

            {/* Send Button */}
            <button
              className="px-6 py-2 rounded-2xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2 group flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #9333ea 0%, #ec4899 100%)",
                color: "#2c3e50",
              }}
              onClick={handleSend}
              disabled={isDisabled || !value.trim()}
              title="メッセージを送信">
              <span style={{ color: "#2c3e50" }}>送信</span>
              <Send
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                style={{ color: "#2c3e50" }}
              />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
}
