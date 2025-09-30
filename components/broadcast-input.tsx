"use client";

import { useState, useRef, KeyboardEvent, useCallback, useEffect } from "react";
import { Button } from "./ui/button";
import { Send, Paperclip, X, Clipboard, BookOpen, Sparkles, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/use-app-store";
import { useOpenRouter } from "@/hooks/use-openrouter";
import { TIMING, BUTTON_GRADIENTS, COLORS, SIZES, ANIMATIONS, SHADOWS } from "@/lib/constants";
import { generateId } from "@/lib/utils";
import { PromptOptimizer } from "@/lib/prompt-optimizer";
import { ContentEditableInput, ContentEditableInputRef } from "./content-editable-input";
import { zIndex } from "@/lib/z-index";
import type { Attachment } from "@/types";
import * as Dialog from "@radix-ui/react-dialog";
import type { CustomPrompt } from "@/types";

interface BroadcastInputProps {
  variant?: "glass" | "simple";
}

export function BroadcastInput({ variant = "glass" }: BroadcastInputProps) {
  const { panels, activePanels, selectedPanelId, multiSendIds, customPrompts = [], applyPromptToPanel, openRouterApiKey, resetPrompts, deleteCustomPrompt, updateCustomPrompt, setPromptLibraryOpen, setEditingPromptId } =
    useAppStore();
  const { sendMessage, isConfigured } = useOpenRouter();
  const [value, setValue] = useState("");
  const inputRef = useRef<ContentEditableInputRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showPromptMenu, setShowPromptMenu] = useState(false);
  const [activePrompt, setActivePrompt] = useState<CustomPrompt | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const promptMenuRef = useRef<HTMLDivElement>(null);

  // PromptMenu 部分に状態追加
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingPrompt, setDeletingPrompt] = useState<CustomPrompt | null>(null);

  const visiblePanels = panels.slice(0, activePanels);
  const isAnyLoading = visiblePanels.some((p) => p.isLoading);
  // 一時的にAPIキーチェックを緩める（開発用）
  const isDisabled = isAnyLoading; // || !isConfigured を削除

  // Reset prompts if empty (ensure default prompts are available)
  useEffect(() => {
    console.log("📚 Current prompts count:", customPrompts?.length || 0);
    if (!customPrompts || customPrompts.length === 0) {
      console.log("📚 No prompts found, resetting to default prompts");
      if (resetPrompts) {
        resetPrompts();
      }
    }
  }, [customPrompts?.length]);

  // Click outside to close prompt menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (promptMenuRef.current && !promptMenuRef.current.contains(event.target as Node)) {
        setShowPromptMenu(false);
      }
    }

    if (showPromptMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPromptMenu]);

  // Debug: Check why input is disabled
  console.log("🔍 BroadcastInput state:", {
    isConfigured,
    isAnyLoading,
    isDisabled,
    visiblePanelsCount: visiblePanels.length,
    hasLoadingPanels: visiblePanels.filter(p => p.isLoading).length,
    note: "APIキーチェックを一時的に無効化"
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;  // isConfigured チェックを削除

    setValue("");

    // チェックボックスで選択されたパネルに送信
    const targets =
      multiSendIds.length > 0
        ? visiblePanels.filter((p) => multiSendIds.includes(p.id))
        : visiblePanels;

    // 並列送信：全てのパネルに同時にメッセージを送信
    const sendPromises = targets.map(panel => {
      // Get custom prompt content
      const promptContent = panel.customPrompt?.content || "";

      console.log("🎯 Sending with prompt:", {
        panelId: panel.id,
        hasPrompt: !!panel.customPrompt,
        promptTitle: panel.customPrompt?.title,
        promptContent: promptContent ? promptContent.substring(0, 50) + "..." : "none"
      });

      // Handle {input} variable replacement if present
      let finalMessage = trimmed;
      let systemPrompt: string | undefined = promptContent;

      if (promptContent && promptContent.includes('{input}')) {
        // Replace {input} with user message and don't use as system prompt
        finalMessage = promptContent.replace(/\{input\}/g, trimmed);
        systemPrompt = undefined; // Don't use as system prompt if it has {input}
      }

      return sendMessage(
        panel.id,
        panel.modelId,
        finalMessage,
        panel.messages || [],
        systemPrompt, // Pass the prompt as system prompt
        attachments
      );
    });

    // 全ての送信完了を待つ（但し、各パネルは独立して処理される）
    await Promise.allSettled(sendPromises);

    if (inputRef.current) {
      inputRef.current.focus();
    }
    setAttachments([]);
    setActivePrompt(null);  // Reset active prompt after sending
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

  // Handle clearing active prompt
  const handleClearPrompt = useCallback(() => {
    setActivePrompt(null);

    // Clear from ALL visible panels
    visiblePanels.forEach(panel => {
      applyPromptToPanel(panel.id, '');
    });
  }, [visiblePanels, applyPromptToPanel]);

  // Handle prompt selection from library
  const handleSelectPrompt = useCallback((prompt: CustomPrompt) => {
    // If same prompt is selected, deselect it
    if (activePrompt?.id === prompt.id) {
      handleClearPrompt();
      return;
    }

    // Set as active prompt
    setActivePrompt(prompt);

    // Always apply to ALL visible panels
    visiblePanels.forEach(panel => {
      applyPromptToPanel(panel.id, prompt.id);
    });

    setShowPromptMenu(false);

    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [visiblePanels, applyPromptToPanel, activePrompt, handleClearPrompt]);

  // Handle prompt optimization
  const handleOptimizePrompt = async () => {
    const trimmed = value.trim();
    if (!trimmed || isOptimizing) return;

    setIsOptimizing(true);

    try {
      // Always use Panel 1's model for optimization (as per requirements)
      const panelModel = panels[0]?.modelId;
      console.log('🔍 最適化デバッグ:', {
        apiKey: openRouterApiKey ? 'あり' : 'なし',
        model: panelModel || 'なし',
        note: 'Always using Panel 1 model'
      });
      const optimizer = new PromptOptimizer(openRouterApiKey, panelModel);

      // Build a simple template around {input} for optimization guidance
      const template = `{input}`; // We'll ask the optimizer to create a template around the sample

      const result = await optimizer.optimizeTemplateWithSample(template, trimmed, { mode: "clarity" });

      // The optimizer returns a template containing {input}; set it into the library creation flow
      const optimizedTemplate = result.optimizedContent;

      console.log('最適化結果テンプレート:', optimizedTemplate);

      // If optimizing from input, place the optimized prompt into the input field
      // Fill the {input} placeholder with the original text so it's ready to send
      try {
        const filled = optimizedTemplate.includes('{input}')
          ? optimizedTemplate.replace(/\{input\}/g, trimmed)
          : optimizedTemplate;
        setValue(filled);
        console.log('入力欄に最適化結果をセットしました');
      } catch (e) {
        console.error('入力欄への反映に失敗:', e);
      }

      console.log("✨ Prompt optimized:", {
        original: trimmed.substring(0, 50) + "...",
        optimized: result.optimizedContent.substring(0, 50) + "...",
        improvements: result.improvements,
        tokenReduction: result.tokenReduction
      });
    } catch (error) {
      console.error("Optimization failed:", error);
      // Keep original text on failure
    } finally {
      setIsOptimizing(false);
    }
  };

  // Simplified container styles - parent handles positioning
  const containerClass = variant === "glass"
    ? "w-full max-w-5xl mx-auto"
    : "w-full";

  const inputWrapperClass =
    variant === "glass"
      ? "flex flex-col gap-3 md:gap-4 px-4 md:px-6 py-4 md:py-5 glass-dark backdrop-blur-2xl rounded-2xl min-h-[80px]"
      : "rounded-lg border p-2 flex items-end space-x-2";

  return (
    <div className={containerClass}>
    <div className="w-full">
        <div className={inputWrapperClass} style={{ width: '100%', boxSizing: 'border-box' }}>
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 pb-3 border-b border-white/10">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-1">
                  <span className="px-2 py-1 glass rounded flex items-center gap-1">{file.name}</span>
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
          <div className="flex items-center gap-2 w-full px-2">
            {/* Button Group - Horizontal (参照元と同じ) */}
            <div className="flex flex-row gap-2 items-center">
              {/* Prompt Library Button */}
              <div className="relative" ref={promptMenuRef}>
                <button
                  className="min-h-[44px] min-w-[44px] px-2 py-2 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0 flex items-center justify-center border border-white/50"
                  style={{
                    background: "transparent",
                    color: "white",
                  }}
                  onClick={() => setShowPromptMenu(!showPromptMenu)}
                  title="プロンプトライブラリ">
                  <BookOpen className="w-4 h-4" style={{ color: "white" }} />
                </button>

                {/* Prompt Menu Dropdown */}
                {showPromptMenu && (
                  <div
                    className={cn(
                      "absolute left-0 bottom-full mb-2 bg-gray-900 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl",
                      zIndex('DROPDOWN')
                    )}
                    style={{ width: '400px', maxHeight: '400px', backgroundColor: 'rgba(17, 24, 39, 0.98)' }}>
                    <div className="p-3 border-b border-gray-700 bg-gray-800/50">
                      <div className="text-sm text-gray-300 font-semibold">プロンプトを選択</div>
                      <div className="text-xs text-gray-500 mt-1">クリックしてプロンプトを適用</div>
                    </div>
                    <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
                      <div className="space-y-1 p-2">
                        {(() => {
                          console.log("📋 Available prompts:", customPrompts?.length || 0);
                          return customPrompts && customPrompts.length > 0;
                        })() ? (
                          customPrompts.map((prompt) => (
                            <div
                              key={prompt.id}
                              className="p-3 bg-gray-800/70 hover:bg-gray-700/80 rounded-lg transition-all duration-200 border border-gray-700 hover:border-purple-500/50 hover:shadow-md group"
                            >
                              <div className="flex items-start justify-between">
                                <div
                                  className="flex-1 cursor-pointer"
                                  onClick={() => handleSelectPrompt(prompt)}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-3 h-3 text-purple-400" />
                                    <div className="text-sm font-medium text-gray-100">{prompt.title}</div>
                                  </div>
                                  <div className="text-xs text-gray-400 line-clamp-2 ml-5">
                                    {prompt.content.substring(0, 100)}...
                                  </div>
                                  {prompt.tags && prompt.tags.length > 0 && (
                                    <div className="flex gap-1 mt-2 flex-wrap ml-5">
                                      {prompt.tags.slice(0, 3).map((tag, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-purple-600/20 text-purple-300 text-[10px] rounded-full">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      try {
                                        setPromptLibraryOpen(true);
                                        setEditingPromptId(prompt.id);
                                        console.log("編集: ライブラリを開きプロンプト選択", prompt.id);
                                      } catch (err) {
                                        console.error('編集遷移失敗:', err);
                                        alert('編集画面への遷移に失敗しました。');
                                      }
                                      setShowPromptMenu(false);
                                    }}
                                    className="p-1.5 hover:bg-purple-600/20 rounded transition-colors"
                                    title="編集">
                                    <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // ブロック削除: すべて削除可能に
                                      setDeletingPrompt(prompt);
                                      setDeleteConfirmOpen(true);
                                      console.log('削除確認トリガー: ID =', prompt.id);
                                    }}
                                    className="p-1.5 hover:bg-red-600/20 rounded transition-colors"
                                    title="削除">
                                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <BookOpen className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                            <div className="text-gray-400 mb-3">
                              <div className="font-medium mb-1">プロンプトがありません</div>
                              <div className="text-xs text-gray-500">サイドバーのプロンプトライブラリから新規作成してください</div>
                            </div>
                            <button
                              onClick={() => {
                                console.log("🔄 Resetting prompts to defaults");
                                resetPrompts?.();
                                setShowPromptMenu(false);
                                setTimeout(() => setShowPromptMenu(true), 100);
                              }}
                              className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs rounded-lg transition-colors"
                            >
                              デフォルトプロンプトを読み込む
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* File Attachment Button */}
              <button
                className="min-h-[44px] min-w-[44px] px-2 py-2 rounded-xl hover:opacity-90 transition-opacity flex-shrink-0 flex items-center justify-center border border-white/50"
                style={{
                  background: "transparent",
                  color: "white",
                }}
                onClick={() => fileInputRef.current?.click()}
                title="ファイルを添付">
                <Paperclip className="w-4 h-4" style={{ color: "white" }} />
              </button>
            </div>

            {/* Text Input Area */}
              <div className="flex-1 glass-dark rounded-2xl px-4 py-3 min-h-[60px] md:min-h-[48px] flex flex-col w-full">
              {/* Active Prompt Indicator */}
              {activePrompt && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-300 flex-1">
                    {activePrompt.title} を使用中
                  </span>
                  <button
                    onClick={handleClearPrompt}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="プロンプトをクリア"
                  >
                    <X className="w-3 h-3 text-gray-400 hover:text-white" />
                  </button>
                </div>
              )}

              {/* Safari-optimized ContentEditable Input */}
              <ContentEditableInput
                ref={inputRef}
                value={value}
                onChange={setValue}
                onKeyDown={handleKeyDown}
                placeholder={
                  !isConfigured
                    ? "APIキーを設定してください"
                    : "メッセージを入力... (Enterで送信)"
                }
                className="w-full resize-none bg-transparent border-0 outline-none text-white placeholder:text-gray-400 focus:ring-0 text-base md:text-sm"
                maxLength={10000}
                style={{
                  minHeight: '40px',
                  maxHeight: `${TIMING.MAX_TEXTAREA_HEIGHT}px`,
                  color: `${COLORS.TEXT_LIGHT} !important`,
                  fontSize: '16px', // Prevent iOS zoom
                  lineHeight: '1.5',
                }}
              />
            </div>

            {/* Button Group - Send and Optimize (横並び) */}
            <div className="flex flex-row gap-2 items-center flex-shrink-0">
              {/* Send Button - Touch optimized */}
              <button
                className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 group flex-shrink-0 border border-white/50 whitespace-nowrap"
                style={{
                  background: "transparent",
                  color: "white",
                }}
                onClick={handleSend}
                disabled={!value.trim()}
                title="メッセージを送信">
                <Send
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  style={{ color: "white" }}
                />
              </button>

              {/* Optimize Button - Touch optimized */}
              <button
                className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 group flex-shrink-0 border border-white/50 disabled:opacity-50 whitespace-nowrap"
                style={{
                  background: "transparent",
                  color: "white",
                }}
                onClick={handleOptimizePrompt}
                disabled={!value.trim() || isOptimizing || !openRouterApiKey}
                title={openRouterApiKey ? "プロンプトを最適化" : "APIキーが設定されていません"}
              >
                <Sparkles
                  className={`w-4 h-4 ${isOptimizing ? "animate-pulse" : ""}`}
                  style={{ color: "white" }}
                />
              </button>
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

      {deleteConfirmOpen && deletingPrompt && (
        <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className={cn("fixed inset-0 bg-black/50", zIndex('MODAL_BACKDROP'))} />
            <Dialog.Content className={cn(
              "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 border border-gray-600 rounded-md p-6 w-80",
              zIndex('MODAL_CONTENT')
            )}>
              <Dialog.Title className="text-lg font-semibold mb-4">削除確認</Dialog.Title>
              <p className="text-sm text-gray-300 mb-4">
                「{deletingPrompt.title}」を削除しますか？
              </p>
              <div className="flex justify-end gap-2">
                <Dialog.Close asChild>
                  <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
                    キャンセル
                  </Button>
                </Dialog.Close>
                <Button
                  variant="destructive"
                  onClick={() => {
                    try {
                      if (!deletingPrompt) throw new Error('no prompt');
                      deleteCustomPrompt(deletingPrompt.id);
                      console.log('削除実行成功: ID =', deletingPrompt.id);
                    } catch (error) {
                      console.error('削除失敗:', error);
                      alert('削除に失敗しました。リロードしてください。');
                    }
                    setDeleteConfirmOpen(false);
                    setDeletingPrompt(null);
                    setShowPromptMenu(false);
                  }}
                >
                  削除
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  );
}