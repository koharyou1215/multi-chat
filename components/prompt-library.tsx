"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAppStore } from "@/store/use-app-store";
import { CustomPrompt } from "@/types";
import { Button } from "./ui/button";
import { generateId, truncateText, cn } from "@/lib/utils";
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

  // 削除関数を定義
  const handleDeletePrompt = (targetPrompt: CustomPrompt) => {
    console.log('削除ボタンクリック (リスト): ID =', targetPrompt.id);
    if (deleteCustomPrompt) {
      deleteCustomPrompt(targetPrompt.id);
    }
  };
  const [editingPrompt, setEditingPrompt] = useState<CustomPrompt | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'list' | 'edit'>('list');

  // open をストアから取得 (Props上書き)
  const effectiveOpen = open || store.promptLibraryOpen;
  const editingPromptId = store.editingPromptId;

  // useEffect で自動選択 (ストア連動)
  useEffect(() => {
    if (editingPromptId && !editingPrompt && !showCreateForm) {
      const prompt = customPrompts.find(p => p.id === editingPromptId);
      if (prompt) {
        setEditingPrompt(prompt);
      }
    }
  }, [editingPromptId, customPrompts, editingPrompt, showCreateForm]);

  const handleClose = () => {
    onClose();
    store.setPromptLibraryOpen(false);
    store.setEditingPromptId(null);
    setEditingPrompt(null);
    setShowCreateForm(false);
    setCurrentView('list');
  };

  return (
    <Dialog.Root open={effectiveOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/90 z-[100] backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "bg-gray-900/98 backdrop-blur-xl border border-purple-600/40 rounded-xl shadow-2xl z-[110]",
            "flex flex-col",
            // デスクトップサイズ
            "w-[90%] max-w-5xl h-[70vh] md:w-[90%] md:max-w-5xl md:h-[70vh]",
            // モバイルサイズ: 全画面に近く
            "sm:w-[95%] sm:h-[85vh] sm:max-w-none"
          )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              {/* モバイル用戻るボタン */}
              {currentView === 'edit' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentView('list')}
                  className="md:hidden">
                  ←
                </Button>
              )}
              <Dialog.Title className="text-lg font-semibold text-foreground">
                {currentView === 'list' ? 'プロンプトライブラリ' : (editingPrompt ? 'プロンプト編集' : '新規プロンプト')}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Prompt List - デスクトップは常に表示、モバイルはlistビューでのみ表示 */}
            <div className={cn(
              "border-r p-3 overflow-auto custom-scrollbar min-w-64",
              // デスクトップ: 常に2/5幅で表示
              "md:w-2/5 md:block",
              // モバイル: currentViewに基づいて表示切替
              currentView === 'list' ? "w-full block" : "hidden"
            )}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground">
                  保存済みプロンプト
                </h3>
                <Button size="sm" onClick={() => {
                  setEditingPrompt(null);
                  setShowCreateForm(true);
                  setCurrentView('edit');
                }}>
                  <Plus className="w-4 h-4 mr-1" />
                  新規
                </Button>
              </div>

              <div className="space-y-0">
                {customPrompts && Array.isArray(customPrompts) && customPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={cn(
                      "group p-2.5 rounded-md border-b border-gray-700/50 cursor-pointer transition-colors last:border-b-0 relative",
                      editingPrompt?.id === prompt.id
                        ? "bg-purple-600/20 border-purple-600"
                        : "hover:bg-gray-800 border-gray-700"
                    )}
                    onClick={() => {
                      setEditingPrompt(prompt);
                      setShowCreateForm(false); // 切り替え時に新規モード解除
                      setCurrentView('edit');
                    }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="font-medium text-sm text-gray-200 truncate">
                        {prompt.title}
                      </h4>
                      {prompt.isOptimized && (
                        <Sparkles className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-1">
                      {truncateText(prompt.content, 50)}
                    </p>
                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {prompt.tags.slice(0, 2).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-1 py-0.5 bg-purple-600/20 text-purple-300 text-[10px] rounded">
                            {tag}
                          </span>
                        ))}
                        {prompt.tags.length > 2 && (
                          <span className="text-[10px] text-gray-500">
                            +{prompt.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    {/* 新規: ホバー時ボタン群 */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-800/80 rounded-md">
                      {/* 編集ボタン */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPrompt(prompt);
                          setCurrentView('edit');
                        }}
                        className="h-6 w-6 p-0 text-purple-400 hover:bg-purple-600/20"
                        title="編集">
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      {/* 削除ボタン (条件付き) */}
                      {!prompt.id.startsWith('default-prompt') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePrompt(prompt);
                          }}
                          className="h-6 w-6 p-0 text-red-400 hover:bg-red-600/20"
                          title="削除">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {(!customPrompts || customPrompts.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">プロンプトがありません</div>
                    <div className="text-xs">新規ボタンで作成してください</div>
                  </div>
                )}
              </div>
            </div>

            {/* Edit/Create Form - デスクトップは常に表示、モバイルはeditビューでのみ表示 */}
            <div className={cn(
              "flex-1 p-4",
              // デスクトップ: 常に表示
              "md:block",
              // モバイル: currentViewに基づいて表示切替
              currentView === 'edit' ? "block" : "hidden"
            )}>
              {editingPrompt || showCreateForm ? (
                <PromptEditForm
                  prompt={editingPrompt}
                  onSave={(prompt) => {
                    if (editingPrompt) {
                      updateCustomPrompt(prompt.id, prompt);
                    } else {
                      addCustomPrompt(prompt);
                    }
                    setEditingPrompt(null);
                    setShowCreateForm(false);
                    setCurrentView('list');
                  }}
                  onCancel={() => {
                    setEditingPrompt(null);
                    setShowCreateForm(false);
                    setCurrentView('list');
                  }}
                  onDelete={
                    editingPrompt
                      ? () => {
                          deleteCustomPrompt(editingPrompt.id);
                          setEditingPrompt(null);
                          setShowCreateForm(false); // 削除後も新規可能
                          setCurrentView('list');
                        }
                      : undefined
                  }
                />
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <div className="text-lg mb-2">
                    プロンプトを選択してください
                  </div>
                  <div className="text-sm">
                    左からプロンプトを選んで編集したり、新規ボタンで作成してください
                  </div>
                  {/* Apply Button */}
                  {editingPrompt && <div className="mt-4" />}
                </div>
              )}
            </div>
          </div>

          {/* Footer - Apply */}
          {editingPrompt && (
            <div className="border-t p-4 flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                適用先は下部入力の「送信対象」で自動判定（全体 / 選択 /
                複数選択）
              </div>
              <Button
                onClick={() => {
                  const activePanelsArr = panels.slice(0, activePanels);
                  const targets =
                    multiSendIds.length > 0
                      ? activePanelsArr.filter((p) =>
                          multiSendIds.includes(p.id)
                        )
                      : selectedPanelId
                      ? activePanelsArr.filter((p) => p.id === selectedPanelId)
                      : activePanelsArr;
                  targets.forEach((p) =>
                    applyPromptToPanel(p.id, editingPrompt.id)
                  );
                  addPromptHistory({
                    id: generateId(),
                    promptId: editingPrompt.id,
                    title: editingPrompt.title,
                    panelIds: targets.map((t) => t.id),
                    appliedAt: new Date(),
                  });
                  onClose();
                }}>
                このプロンプトを適用
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface PromptEditFormProps {
  prompt?: CustomPrompt | null;
  onSave: (prompt: CustomPrompt) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

function PromptEditForm({
  prompt,
  onSave,
  onCancel,
  onDelete,
}: PromptEditFormProps) {
  const [title, setTitle] = useState(prompt?.title || "");
  const [content, setContent] = useState(prompt?.content || "");
  const [tags, setTags] = useState(prompt?.tags.join(", ") || "");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false); // 新規: 確認ダイアログ状態

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    const savedPrompt: CustomPrompt = {
      id: prompt?.id || generateId(),
      title: title.trim(),
      content: content.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      createdAt: prompt?.createdAt || new Date(),
      updatedAt: new Date(),
      isOptimized: prompt?.isOptimized || false,
      originalContent: prompt?.originalContent || content.trim(),
    };

    onSave(savedPrompt);
  };

      const appStore = useAppStore();
  const handleOptimize = async () => {
    if (!content.trim()) return;
    setIsOptimizing(true);
    try {
      const panelModel = appStore.panels?.find((p) => p.id === appStore.editingPromptId || p.id === appStore.selectedPanelId)?.modelId || appStore.panels?.[0]?.modelId;
      const optimizer = new PromptOptimizer(appStore.openRouterApiKey, panelModel);
      // If current content already includes {input}, treat it as template; otherwise use {input} as template and sample is content
      const hasPlaceholder = content.includes("{input}");
      const template = hasPlaceholder ? content : "{input}";
      const sample = hasPlaceholder ? "" : content;
      const result = await optimizer.optimizeTemplateWithSample(template, sample || content, { mode: "clarity" });
      // Ensure returned template contains {input}
      let optimized = result.optimizedContent || content;
      if (!optimized.includes('{input}')) {
        // If optimizer returned plain text, restore placeholder
        optimized = optimized + '\n\n{input}';
      }
      setContent(optimized);
    } catch (err) {
      console.error('最適化に失敗しました:', err);
      // fallback
      setContent(`[最適化済み] ${content}`);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDeleteClick = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!prompt) return;
    console.log('削除ボタンクリック (リスト): ID =', prompt.id);

    // ブロック削除: すべて削除可能に
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (onDelete && prompt) {
      console.log('確認削除実行: ID =', prompt.id);
      onDelete();
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground">
          {prompt ? "プロンプト編集" : "新規プロンプト"}
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOptimize}
            disabled={isOptimizing || !content.trim()}>
            <Sparkles className="w-4 h-4 mr-1" />
            {isOptimizing ? "最適化中..." : "最適化"}
          </Button>
          {onDelete && !prompt?.id.startsWith('default-prompt') && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteClick} // 修正: 確認トリガー
                className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>

              {/* 新規: 確認ダイアログ */}
              <Dialog.Root open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[200]" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 border border-gray-600 rounded-md p-6 w-80 z-[210]">
                    <Dialog.Title className="text-lg font-semibold mb-4">削除確認</Dialog.Title>
                    <p className="text-sm text-gray-300 mb-4">
                      「{prompt?.title}」を削除しますか？
                    </p>
                    <div className="flex justify-end gap-2">
                      <Dialog.Close asChild>
                        <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
                          キャンセル
                        </Button>
                      </Dialog.Close>
                      <Button 
                        variant="destructive" 
                        onClick={confirmDelete}
                      >
                        削除
                      </Button>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-auto">
        {/* Title */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            タイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="プロンプトのタイトルを入力"
            className={cn(
              "w-full p-2 text-sm bg-background border border-input rounded-md",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground mb-2 block">
            プロンプト内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="プロンプトの内容を入力..."
            className={cn(
              "w-full h-40 p-3 text-sm bg-background border border-input rounded-md",
              "resize-none custom-scrollbar",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
            rows={10}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            タグ (カンマ区切り)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="例: コーディング, 翻訳, クリエイティブ"
            className={cn(
              "w-full p-2 text-sm bg-background border border-input rounded-md",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          キャンセル
        </Button>
        <Button
          onClick={handleSave}
          disabled={!title.trim() || !content.trim()}>
          {prompt ? "更新" : "作成"}
        </Button>
      </div>
    </div>
  );
}
