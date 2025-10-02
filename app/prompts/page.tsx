"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { CustomPrompt } from "@/types";
import { Button } from "@/components/ui/button";
import { generateId, truncateText, cn } from "@/lib/utils";
import { ArrowLeft, Plus, Trash2, Sparkles, FileText, Edit2, X } from "lucide-react";
import { PromptOptimizer } from "@/lib/prompt-optimizer";

export default function PromptsPage() {
  const router = useRouter();
  const store = useAppStore();
  const {
    customPrompts = [],
    addCustomPrompt,
    updateCustomPrompt,
    deleteCustomPrompt,
    applyPromptToPanel,
    panels,
    activePanels,
    multiSendIds,
    addPromptHistory,
  } = store;

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTags, setNewTags] = useState("");
  const [editingPrompt, setEditingPrompt] = useState<CustomPrompt | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleAddPrompt = async () => {
    if (!newContent.trim()) return;

    const tags = newTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

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
    setIsOptimizing(false);
  };

  const handleOptimize = async () => {
    if (!newContent.trim() || isOptimizing) return;

    setIsOptimizing(true);
    try {
      const panelModel = panels[0]?.modelId;
      const openRouterApiKey = store.openRouterApiKey;

      if (!openRouterApiKey) {
        alert("OpenRouter APIキーが設定されていません。設定画面で設定してください。");
        return;
      }

      const optimizer = new PromptOptimizer(openRouterApiKey, panelModel);
      const result = await optimizer.optimizeTemplateWithSample(newContent.trim(), "", { mode: "clarity" });

      setNewContent(result.optimizedContent);
      setNewTitle(newTitle || "最適化プロンプト");
    } catch (error) {
      console.error("Optimization failed:", error);
      alert("最適化に失敗しました。APIキーを確認してください。");
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleUpdatePrompt = () => {
    if (!editingPrompt) return;

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

    if (updatedPrompt.id) {
      updateCustomPrompt(updatedPrompt.id, updatedPrompt);
    }

    setEditingPrompt(null);
    setNewTitle("");
    setNewContent("");
    setNewTags("");
  };

  const handleEdit = (prompt: CustomPrompt) => {
    setEditingPrompt(prompt);
    setNewTitle(prompt.title);
    setNewContent(prompt.content);
    setNewTags(prompt.tags?.join(", ") || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingPrompt(null);
    setNewTitle("");
    setNewContent("");
    setNewTags("");
  };

  const handleApply = (prompt: CustomPrompt) => {
    const visiblePanels = panels.slice(0, activePanels);
    const targetPanels = multiSendIds.length > 0
      ? visiblePanels.filter(p => multiSendIds.includes(p.id))
      : visiblePanels;

    targetPanels.forEach(panel => {
      applyPromptToPanel(panel.id, prompt.id);
    });

    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/98 backdrop-blur-xl border-b border-purple-600/40">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="戻る"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">
                {editingPrompt ? "プロンプト編集" : "プロンプトライブラリ"}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="pt-14 pb-6 px-4 max-w-5xl mx-auto">
        <div className="space-y-6">
          {/* Add/Edit Form */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="タイトル"
              />
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                className="px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="タグ (カンマ区切り)"
              />
            </div>

            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full h-32 px-3 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="プロンプトの内容を入力してください..."
            />

            <div className="flex gap-2">
              {editingPrompt ? (
                <>
                  <Button
                    onClick={handleUpdatePrompt}
                    disabled={!newContent.trim()}
                    className="flex-1"
                  >
                    更新
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex-1"
                  >
                    キャンセル
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleAddPrompt}
                    disabled={!newContent.trim()}
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    追加
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleOptimize}
                    disabled={!newContent.trim() || isOptimizing}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className={`w-4 h-4 ${isOptimizing ? "animate-pulse" : ""}`} />
                    {isOptimizing ? "最適化中..." : "最適化"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Prompts List */}
          <div className="space-y-3">
            {customPrompts && customPrompts.length > 0 ? (
              customPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-purple-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-medium text-white">{prompt.title}</h3>
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
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApply(prompt)}
                        className="h-9 w-9 p-0"
                        title="適用"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(prompt)}
                        className="h-9 w-9 p-0"
                        title="編集"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirmId(prompt.id)}
                        className="h-9 w-9 p-0 text-red-400 hover:text-red-300"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
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
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative bg-gray-800 border border-gray-600 rounded-xl p-6 w-80 mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">削除確認</h3>
            <p className="text-sm text-gray-300 mb-4">
              「{customPrompts.find(p => p.id === deleteConfirmId)?.title}」を削除しますか？
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteCustomPrompt(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
              >
                削除
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
