"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAppStore } from "@/store/use-app-store";
import { CustomPrompt } from "@/types";
import { Button } from "./ui/button";
import { generateId, truncateText, cn } from "@/lib/utils";
import { zIndex } from "@/lib/z-index";
import { X, Plus, Trash2, Sparkles, FileText, Edit2 } from "lucide-react";
import { PromptOptimizer } from "@/lib/prompt-optimizer";

interface PromptLibraryProps {
  open: boolean;
  onClose: () => void;
}

export function PromptLibrary({ open, onClose }: PromptLibraryProps) {
  const store = useAppStore();
  const {
    customPrompts = [],  // Provide default empty array
    addCustomPrompt,
    updateCustomPrompt,
    deleteCustomPrompt,
    applyPromptToPanel,
    panels,
    activePanels,
    selectedPanelId,
    multiSendIds,
    addPromptHistory,
  } = store;

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [editingPrompt, setEditingPrompt] = useState<CustomPrompt | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingPrompt, setDeletingPrompt] = useState<CustomPrompt | null>(null);

  const editingPromptId = store.editingPromptId;

  // 効果的なopen状態を計算
  const effectiveOpen = open || !!editingPromptId;

  useEffect(() => {
    if (editingPromptId && customPrompts) {
      const promptToEdit = customPrompts.find(p => p.id === editingPromptId);
      if (promptToEdit) {
        setEditingPrompt(promptToEdit);
        setNewTitle(promptToEdit.title);
        setNewContent(promptToEdit.content);
        setNewTags(promptToEdit.tags?.join(", ") || "");
      }
    }
  }, [editingPromptId, customPrompts]);

  const handleClose = () => {
    // Clear editing state
    setEditingPrompt(null);
    setNewTitle("");
    setNewContent("");
    setNewTags("");
    store.setEditingPromptId?.("");
    onClose();
  };

  return (
    <Dialog.Root open={effectiveOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className={cn("fixed inset-0 bg-black/90 backdrop-blur-sm", zIndex('MODAL_BACKDROP'))} />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "bg-gray-900/98 backdrop-blur-xl border border-purple-600/40 rounded-xl shadow-2xl",
            "flex flex-col",
            // デスクトップサイズ
            "w-[90%] max-w-5xl h-[70vh] md:w-[90%] md:max-w-5xl md:h-[70vh]",
            // モバイルサイズ: 全画面に近く
            "sm:w-[95%] sm:h-[85vh] sm:max-w-none",
            zIndex('PROMPT_LIBRARY')
          )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              {/* モバイル用戻るボタン */}
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <Dialog.Title className="text-xl font-bold text-white">
                {editingPrompt ? "プロンプト編集" : "プロンプトライブラリ"}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 overflow-hidden">
            {editingPrompt ? (
              // Edit Mode
              <div className="space-y-4 h-full">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    タイトル
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="プロンプトのタイトル"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    内容
                  </label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="プロンプトの内容を入力してください..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    タグ (カンマ区切り)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="例: 要約, 翻訳, コーディング"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      const tags = newTags
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean);

                      const updatedPrompt: CustomPrompt = {
                        ...editingPrompt,
                        title: newTitle.trim() || "無題のプロンプト",
                        content: newContent.trim(),
                        tags,
                        updatedAt: new Date(),
                      };

                      // updateCustomPrompt expects (id, updates)
                      if (updatedPrompt.id) {
                        updateCustomPrompt(updatedPrompt.id, updatedPrompt);
                      }
                      handleClose();
                    }}
                    disabled={!newContent.trim()}
                    className="flex-1"
                  >
                    更新
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              // Library Mode
              <div className="space-y-4 h-full flex flex-col">
                {/* Add New Prompt */}
                <div className="space-y-3 border-b border-gray-700 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="タイトル"
                    />
                    <input
                      type="text"
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      className="px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="タグ (カンマ区切り)"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={async () => {
                          if (!newContent.trim()) return;

                          const tags = newTags
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter(Boolean);

                          if (isOptimizing) {
                            // If optimizing, create the prompt with the current content
                            const prompt: CustomPrompt = {
                              id: generateId(),
                              title: newTitle.trim() || "最適化プロンプト",
                              content: newContent.trim(),
                              tags,
                              createdAt: new Date(),
                              updatedAt: new Date(),
                            };

                            addCustomPrompt(prompt);
                            // Convert to PromptUsageHistoryItem for history
                            addPromptHistory({
                              id: generateId(),
                              promptId: prompt.id,
                              title: prompt.title,
                              panelIds: [],
                              appliedAt: new Date(),
                            });

                            setNewTitle("");
                            setNewContent("");
                            setNewTags("");
                            setIsOptimizing(false);
                          } else {
                            // Normal add
                            const prompt: CustomPrompt = {
                              id: generateId(),
                              title: newTitle.trim() || "新しいプロンプト",
                              content: newContent.trim(),
                              tags,
                              createdAt: new Date(),
                              updatedAt: new Date(),
                            };

                            addCustomPrompt(prompt);
                            addPromptHistory({
                              id: generateId(),
                              promptId: prompt.id,
                              title: prompt.title,
                              panelIds: [],
                              appliedAt: new Date(),
                            });

                            setNewTitle("");
                            setNewContent("");
                            setNewTags("");
                          }
                        }}
                        disabled={!newContent.trim()}
                        className="flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        追加
                      </Button>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!newContent.trim() || isOptimizing) return;

                          setIsOptimizing(true);
                          try {
                            // Always use Panel 1's model for optimization (as per requirements)
                            const panelModel = panels[0]?.modelId;
                            const openRouterApiKey = store.openRouterApiKey;

                            if (!openRouterApiKey) {
                              alert("OpenRouter APIキーが設定されていません。設定画面で設定してください。");
                              return;
                            }

                            const optimizer = new PromptOptimizer(openRouterApiKey, panelModel);
                            // Use template-based optimization for raw text input
                            const result = await optimizer.optimizeTemplateWithSample(newContent.trim(), "", { mode: "clarity" });

                            setNewContent(result.optimizedContent);
                            setNewTitle(newTitle || "最適化プロンプト");

                            console.log("✨ Prompt optimized:", {
                              original: newContent.trim().substring(0, 50) + "...",
                              optimized: result.optimizedContent.substring(0, 50) + "...",
                              improvements: result.improvements,
                              tokenReduction: result.tokenReduction
                            });
                          } catch (error) {
                            console.error("Optimization failed:", error);
                            alert("最適化に失敗しました。APIキーを確認してください。");
                          } finally {
                            setIsOptimizing(false);
                          }
                        }}
                        disabled={!newContent.trim() || isOptimizing}
                        className="flex items-center gap-1"
                      >
                        <Sparkles className={`w-4 h-4 ${isOptimizing ? "animate-pulse" : ""}`} />
                        {isOptimizing ? "最適化中..." : "最適化"}
                      </Button>
                    </div>
                  </div>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full h-24 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="プロンプトの内容を入力してください..."
                  />
                </div>

                {/* Prompts List */}
                <div className="flex-1 overflow-auto space-y-3">
                  {customPrompts && customPrompts.length > 0 ? (
                    customPrompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-white truncate">{prompt.title}</h3>
                              {prompt.tags && prompt.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {prompt.tags.slice(0, 3).map((tag, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 bg-purple-600/20 text-purple-300 text-xs rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-2">
                              {truncateText(prompt.content, 150)}
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const visiblePanels = panels.slice(0, activePanels);
                                const targetPanels = multiSendIds.length > 0
                                  ? visiblePanels.filter(p => multiSendIds.includes(p.id))
                                  : visiblePanels;

                                targetPanels.forEach(panel => {
                                  applyPromptToPanel(panel.id, prompt.id);
                                });

                                handleClose();
                              }}
                              className="h-8 px-2"
                            >
                              <FileText className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingPrompt(prompt);
                                setNewTitle(prompt.title);
                                setNewContent(prompt.content);
                                setNewTags(prompt.tags?.join(", ") || "");
                              }}
                              className="h-8 px-2"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingPrompt(prompt);
                                setDeleteConfirmOpen(true);
                              }}
                              className="h-8 px-2 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-400 mb-2">
                        プロンプトがありません
                      </h3>
                      <p className="text-gray-500 text-sm">
                        上のフォームからプロンプトを追加してください
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && deletingPrompt && (
        <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className={cn("fixed inset-0 bg-black/50", zIndex('MODAL_BACKDROP'))} />
            <Dialog.Content className={cn("fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 border border-gray-600 rounded-md p-6 w-80", zIndex('MODAL_CONTENT'))}>
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
                    deleteCustomPrompt(deletingPrompt.id);
                    setDeleteConfirmOpen(false);
                    setDeletingPrompt(null);
                  }}
                >
                  削除
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </Dialog.Root>
  );
}