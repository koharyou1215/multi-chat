"use client";

import { useState, useRef, useCallback, useEffect, memo, useMemo } from "react";
import { useAppStore } from "@/store/chat-store";
import { useMessageSender } from "@/hooks/useMessageSender";
import { PromptOptimizer } from "@/lib/prompt-optimizer";
import { AttachmentPreview } from "./input/AttachmentPreview";
import { PromptSelector } from "./input/PromptSelector";
import { TextInput } from "./input/TextInput";
import { SendControls } from "./input/SendControls";
import { ContentEditableInputRef } from "./content-editable-input";
import { generateId } from "@/lib/utils";
import type { Attachment, CustomPrompt } from "@/types";

interface BroadcastInputProps {
  variant?: "glass" | "simple";
}

export const BroadcastInput = memo(function BroadcastInput({ variant = "glass" }: BroadcastInputProps) {
  const store = useAppStore();
  const {
    panels,
    activePanelIds,
    customPrompts = [],
    applyPromptToPanel,
    resetPrompts,
    deleteCustomPrompt,
    setPromptLibraryOpen,
    setEditingPromptId,
    settings,
  } = store;
  const openRouterApiKey = settings?.apiKeys?.openrouter || settings?.apiKeys?.openRouter;

  const { send } = useMessageSender();
  const [value, setValue] = useState("");
  const inputRef = useRef<ContentEditableInputRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activePrompt, setActivePrompt] = useState<CustomPrompt | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const activePanels = activePanelIds.length;

  // Memoize expensive computations
  const visiblePanels = useMemo(
    () => panels.slice(0, activePanels),
    [panels, activePanels]
  );

  const isAnyLoading = useMemo(
    () => visiblePanels.some((p) => p.isLoading),
    [visiblePanels]
  );

  // Reset prompts if empty
  useEffect(() => {
    if (!customPrompts || customPrompts.length === 0) {
      resetPrompts?.();
    }
  }, [customPrompts?.length, resetPrompts]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setValue("");
    await send(trimmed, attachments);

    if (inputRef.current) {
      inputRef.current.focus();
    }
    setAttachments([]);
    setActivePrompt(null);
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

  const handleClearPrompt = useCallback(() => {
    setActivePrompt(null);
    visiblePanels.forEach((panel) => {
      applyPromptToPanel(panel.id, "");
    });
  }, [visiblePanels, applyPromptToPanel]);

  const handleSelectPrompt = useCallback(
    (prompt: CustomPrompt) => {
      // If same prompt is selected, deselect it
      if (activePrompt?.id === prompt.id) {
        handleClearPrompt();
        return;
      }

      // Set as active prompt and apply to all visible panels
      setActivePrompt(prompt);
      visiblePanels.forEach((panel) => {
        applyPromptToPanel(panel.id, prompt.id);
      });

      // Focus the input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    [visiblePanels, applyPromptToPanel, activePrompt, handleClearPrompt]
  );

  const handleOptimizePrompt = async () => {
    const trimmed = value.trim();
    if (!trimmed || isOptimizing) return;

    setIsOptimizing(true);

    try {
      const panelModel = panels[0]?.modelId;
      const optimizer = new PromptOptimizer(openRouterApiKey, panelModel);
      const template = `{input}`;
      const result = await optimizer.optimizeTemplateWithSample(template, trimmed, {
        mode: "clarity",
      });

      const optimizedTemplate = result.optimizedContent;
      const filled = optimizedTemplate.includes("{input}")
        ? optimizedTemplate.replace(/\{input\}/g, trimmed)
        : optimizedTemplate;

      setValue(filled);
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleEditPrompt = (promptId: string) => {
    try {
      setPromptLibraryOpen(true);
      setEditingPromptId(promptId);
    } catch (err) {
      console.error("Edit transition failed:", err);
    }
  };

  const containerClass =
    variant === "glass" ? "w-full max-w-5xl mx-auto" : "w-full";

  const inputWrapperClass =
    variant === "glass"
      ? "flex flex-col gap-2 px-3 py-2 glass-dark backdrop-blur-2xl rounded-2xl min-h-[52px]"
      : "rounded-lg border p-2 flex items-end space-x-2";

  return (
    <div className={containerClass}>
      <div className="w-full">
        <div
          className={inputWrapperClass}
          style={{ width: "100%", boxSizing: "border-box" }}
        >
          {/* Attachments Preview */}
          <AttachmentPreview
            attachments={attachments}
            onRemove={removeAttachment}
          />

          {/* Main Input Bar */}
          <div className="flex items-center gap-2 w-full px-2">
            {/* Prompt Selector */}
            <PromptSelector
              prompts={customPrompts}
              onSelect={handleSelectPrompt}
              onReset={resetPrompts}
              onEdit={handleEditPrompt}
              onDelete={deleteCustomPrompt}
            />

            {/* Text Input */}
            <TextInput
              ref={inputRef}
              value={value}
              onChange={setValue}
              onKeyDown={handleKeyDown}
              placeholder="メッセージを入力... (Enterで送信)"
              activePrompt={activePrompt}
              onClearPrompt={handleClearPrompt}
            />

            {/* Send Controls */}
            <div className="flex flex-row gap-2 items-center flex-shrink-0">
              <SendControls
                onSend={handleSend}
                onOptimize={handleOptimizePrompt}
                onAttach={() => fileInputRef.current?.click()}
                canSend={!!value.trim()}
                canOptimize={!!value.trim() && !!openRouterApiKey}
                isOptimizing={isOptimizing}
                optimizeTooltip={
                  openRouterApiKey
                    ? "プロンプトを最適化"
                    : "APIキーが設定されていません"
                }
              />
            </div>
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
});

BroadcastInput.displayName = "BroadcastInput";
