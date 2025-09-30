"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "./ui/button";
import { Send, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import { useOpenRouter } from "@/hooks/use-openrouter";

export function BroadcastInput() {
  const { panels, activePanels, selectedPanelId, multiSendIds } =
    useAppStore() as any;
  const { sendMessage, isConfigured } = useOpenRouter();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const visiblePanels = panels.slice(0, activePanels);
  const isAnyLoading = visiblePanels.some((p: any) => p.isLoading);
  const isDisabled = isAnyLoading || !isConfigured;

  const [target, setTarget] = useState<"all" | "selected" | "multi">("all");

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

    const targets =
      target === "all"
        ? visiblePanels
        : target === "selected"
        ? visiblePanels.filter((p: any) => p.id === selectedPanelId)
        : visiblePanels.filter((p: any) => multiSendIds.includes(p.id));
    await Promise.all(
      targets.map((panel: any) =>
        sendMessage(
          panel.id,
          panel.modelId,
          trimmed,
          panel.messages,
          panel.customPrompt?.content,
          attachments.map((f, i) => ({
            id: `${i}`,
            type: "file",
            name: f.name,
            url: URL.createObjectURL(f),
            size: f.size,
            mimeType: f.type,
          }))
        )
      )
    );
    setAttachments([]);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const placeholder =
    target === "all"
      ? "メッセージを入力... 全パネルへ同時送信 (Shift+Enterで改行)"
      : target === "selected"
      ? `メッセージを入力... 選択パネル(${
          selectedPanelId?.split("-")[1] || "-"
        })へ送信 (Shift+Enterで改行)`
      : `メッセージを入力... 複数パネル(${multiSendIds.length})へ送信 (Shift+Enterで改行)`;

  return (
    <div className="p-3 border-t bg-background">
      <div className="flex items-end gap-2">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">送信対象</label>
          <select
            className="text-xs border rounded px-2 py-1 bg-background"
            value={target}
            onChange={(e) => setTarget(e.target.value as any)}>
            <option value="all">全パネル</option>
            <option value="selected">選択パネル</option>
            <option value="multi">複数選択</option>
          </select>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          onClick={handleFileClick}
          disabled={isDisabled}>
          <Paperclip className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          {attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-2 py-1 text-xs border rounded">
                  {file.type.startsWith("image/") ? (
                    <img
                      className="w-8 h-8 object-cover rounded"
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                    />
                  ) : (
                    <span className="px-2 py-1 bg-muted/50 rounded">
                      {file.type.split("/")[1] || "file"}
                    </span>
                  )}
                  <span className="max-w-40 truncate">{file.name}</span>
                  <button
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeAttachment(index)}>
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "w-full min-h-10 max-h-32 p-3 text-sm",
              "bg-background border border-input rounded-md",
              "resize-none overflow-auto custom-scrollbar",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "placeholder:text-muted-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            disabled={isDisabled}
            rows={1}
          />
        </div>
        <Button
          size="icon"
          className="h-10 w-10 flex-shrink-0"
          onClick={() => void handleSend()}
          disabled={isDisabled || !value.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
      {!isConfigured && (
        <div className="pt-2 text-xs text-destructive">
          OpenRouter APIキーが未設定です。右の「設定」から登録してください。
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
