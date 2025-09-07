"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAppStore } from "@/store/use-app-store";
import { CustomPrompt } from "@/types";
import { Button } from "./ui/button";
import { generateId, truncateText, cn } from "@/lib/utils";
import { X, Plus, Trash2, Sparkles, FileText } from "lucide-react";

interface PromptLibraryProps {
  open: boolean;
  onClose: () => void;
}

export function PromptLibrary({ open, onClose }: PromptLibraryProps) {
  const {
    customPrompts,
    addCustomPrompt,
    updateCustomPrompt,
    deleteCustomPrompt,
    applyPromptToPanel,
    panels,
    activePanels,
    selectedPanelId,
    multiSendIds,
    addPromptHistory,
  } = useAppStore() as any;
  const [editingPrompt, setEditingPrompt] = useState<CustomPrompt | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "bg-card border rounded-lg shadow-lg w-full max-w-4xl h-[80vh] z-50",
            "flex flex-col"
          )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              プロンプトライブラリ
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Prompt List */}
            <div className="w-1/3 border-r p-4 overflow-auto custom-scrollbar min-w-64">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-foreground">
                  保存済みプロンプト
                </h3>
                <Button size="sm" onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  新規
                </Button>
              </div>

              <div className="space-y-2">
                {customPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={cn(
                      "p-3 rounded-md border cursor-pointer transition-colors",
                      editingPrompt?.id === prompt.id
                        ? "bg-primary/10 border-primary"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => setEditingPrompt(prompt)}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {prompt.title}
                      </h4>
                      {prompt.isOptimized && (
                        <Sparkles className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {truncateText(prompt.content, 60)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {prompt.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-primary/20 text-primary text-xs rounded">
                          {tag}
                        </span>
                      ))}
                      {prompt.tags.length > 2 && (
                        <span className="text-xs text-muted-foreground">
                          +{prompt.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {customPrompts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">プロンプトがありません</div>
                    <div className="text-xs">新規ボタンで作成してください</div>
                  </div>
                )}
              </div>
            </div>

            {/* Edit/Create Form */}
            <div className="flex-1 p-4">
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
                  }}
                  onCancel={() => {
                    setEditingPrompt(null);
                    setShowCreateForm(false);
                  }}
                  onDelete={
                    editingPrompt
                      ? () => {
                          deleteCustomPrompt(editingPrompt.id);
                          setEditingPrompt(null);
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
                      ? activePanelsArr.filter((p: any) =>
                          multiSendIds.includes(p.id)
                        )
                      : selectedPanelId
                      ? activePanelsArr.filter(
                          (p: any) => p.id === selectedPanelId
                        )
                      : activePanelsArr;
                  targets.forEach((p: any) =>
                    applyPromptToPanel(p.id, editingPrompt.id)
                  );
                  addPromptHistory({
                    id: generateId(),
                    promptId: editingPrompt.id,
                    title: editingPrompt.title,
                    panelIds: targets.map((t: any) => t.id),
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
      isOptimized: prompt?.isOptimized,
      originalContent: prompt?.originalContent,
    };

    onSave(savedPrompt);
  };

  const handleOptimize = async () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setContent(`[最適化済み] ${content}`);
      setIsOptimizing(false);
    }, 2000);
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
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
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
