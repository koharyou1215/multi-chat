"use client";

import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAppStore } from "@/store/use-app-store";
import { CustomPrompt } from "@/types";
import { Button } from "./ui/button";
import { generateId, truncateText, cn } from "@/lib/utils";
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  Search,
  Star,
  StarOff,
  Copy,
  Download,
  Upload,
  Clock,
  Tag,
  Grid3x3,
  List,
} from "lucide-react";

interface EnhancedPromptLibraryProps {
  open: boolean;
  onClose: () => void;
}

const PROMPT_CATEGORIES = [
  { id: "all", name: "すべて", icon: Grid3x3 },
  { id: "coding", name: "コーディング", icon: FileText },
  { id: "writing", name: "文章作成", icon: FileText },
  { id: "analysis", name: "分析", icon: FileText },
  { id: "creative", name: "クリエイティブ", icon: Sparkles },
  { id: "translation", name: "翻訳", icon: FileText },
  { id: "favorites", name: "お気に入り", icon: Star },
  { id: "recent", name: "最近使用", icon: Clock },
];

export function EnhancedPromptLibrary({ open, onClose }: EnhancedPromptLibraryProps) {
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
    promptHistory,
  } = useAppStore();

  const [editingPrompt, setEditingPrompt] = useState<CustomPrompt | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter prompts based on category and search
  const filteredPrompts = useMemo(() => {
    let filtered = customPrompts;

    // Category filter
    if (selectedCategory === "favorites") {
      filtered = filtered.filter(p => p.isFavorite);
    } else if (selectedCategory === "recent") {
      // Get recently used prompt IDs from history
      const recentIds = promptHistory
        .slice(0, 10)
        .map((h) => h.promptId);
      filtered = filtered.filter(p => recentIds.includes(p.id));
    } else if (selectedCategory !== "all") {
      filtered = filtered.filter(p =>
        p.tags?.some(tag =>
          tag.toLowerCase().includes(selectedCategory.toLowerCase())
        )
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.content.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [customPrompts, selectedCategory, searchQuery, promptHistory]);

  // Handle prompt export
  const handleExportPrompts = () => {
    const dataStr = JSON.stringify(customPrompts, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `prompts-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Handle prompt import
  const handleImportPrompts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const prompts = JSON.parse(e.target?.result as string);
          prompts.forEach((prompt: CustomPrompt) => {
            addCustomPrompt({ ...prompt, id: generateId() });
          });
        } catch (error) {
          // Failed to import prompts: ${error}
        }
      };
      reader.readAsText(file);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (promptId: string) => {
    const prompt = customPrompts.find(p => p.id === promptId);
    if (prompt) {
      updateCustomPrompt(promptId, {
        ...prompt,
        isFavorite: !prompt.isFavorite
      });
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "bg-gray-900 border border-purple-500/30 rounded-lg shadow-2xl w-full max-w-6xl h-[85vh] z-50",
            "flex flex-col"
          )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-xl font-semibold text-foreground">
              プロンプトライブラリ
            </Dialog.Title>
            <div className="flex items-center gap-2">
              {/* Import/Export */}
              <Button variant="outline" size="sm" onClick={handleExportPrompts}>
                <Download className="w-4 h-4 mr-1" />
                エクスポート
              </Button>
              <label>
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-1" />
                    インポート
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportPrompts}
                  className="hidden"
                />
              </label>
              <Dialog.Close asChild>
                <Button variant="ghost" size="icon">
                  <X className="w-4 h-4" />
                </Button>
              </Dialog.Close>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar - Categories */}
            <div className="w-48 border-r p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                カテゴリー
              </h3>
              <div className="space-y-1">
                {PROMPT_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <category.icon className="w-4 h-4" />
                    <span>{category.name}</span>
                    {category.id === "favorites" && (
                      <span className="ml-auto text-xs">
                        {customPrompts.filter(p => p.isFavorite).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {/* Search Bar */}
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="プロンプトを検索..."
                      className={cn(
                        "w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-md",
                        "focus:outline-none focus:ring-2 focus:ring-ring"
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-1 border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    新規作成
                  </Button>
                </div>
              </div>

              {/* Prompts Grid/List */}
              <div className="flex-1 p-4 overflow-auto">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPrompts.map((prompt: CustomPrompt) => (
                      <PromptCard
                        key={prompt.id}
                        prompt={prompt}
                        isSelected={editingPrompt?.id === prompt.id}
                        onSelect={() => setEditingPrompt(prompt)}
                        onToggleFavorite={() => toggleFavorite(prompt.id)}
                        onApply={() => {
                          if (selectedPanelId) {
                            applyPromptToPanel(selectedPanelId, prompt.id);
                            addPromptHistory({
                              id: generateId(),
                              promptId: prompt.id,
                              title: prompt.title,
                              panelIds: [selectedPanelId],
                              appliedAt: new Date(),
                            });
                          }
                          onClose();
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredPrompts.map((prompt: CustomPrompt) => (
                      <PromptListItem
                        key={prompt.id}
                        prompt={prompt}
                        isSelected={editingPrompt?.id === prompt.id}
                        onSelect={() => setEditingPrompt(prompt)}
                        onToggleFavorite={() => toggleFavorite(prompt.id)}
                        onApply={() => {
                          if (selectedPanelId) {
                            applyPromptToPanel(selectedPanelId, prompt.id);
                            addPromptHistory({
                              id: generateId(),
                              promptId: prompt.id,
                              title: prompt.title,
                              panelIds: [selectedPanelId],
                              appliedAt: new Date(),
                            });
                          }
                          onClose();
                        }}
                      />
                    ))}
                  </div>
                )}

                {filteredPrompts.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <div className="text-lg mb-2">
                      プロンプトが見つかりません
                    </div>
                    <div className="text-sm">
                      {searchQuery
                        ? "検索条件を変更してください"
                        : "新規作成ボタンでプロンプトを作成してください"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Panel */}
            {(editingPrompt || showCreateForm) && (
              <div className="w-96 border-l">
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
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Prompt Card Component
interface PromptCardProps {
  prompt: CustomPrompt;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onApply: () => void;
}

function PromptCard({ prompt, isSelected, onSelect, onToggleFavorite, onApply }: PromptCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg border cursor-pointer transition-all",
        isSelected
          ? "bg-primary/10 border-primary shadow-md"
          : "hover:bg-muted/50 hover:shadow-sm"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-sm text-foreground line-clamp-1">
          {prompt.title}
        </h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="text-muted-foreground hover:text-yellow-500 transition-colors"
        >
          {prompt.isFavorite ? (
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
          ) : (
            <StarOff className="w-4 h-4" />
          )}
        </button>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
        {prompt.content}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {prompt.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-primary/20 text-primary text-xs rounded"
            >
              {tag}
            </span>
          ))}
          {prompt.tags.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{prompt.tags.length - 2}
            </span>
          )}
        </div>

        {prompt.isOptimized && (
          <Sparkles className="w-3 h-3 text-yellow-500" />
        )}
      </div>

      <Button
        size="sm"
        variant="outline"
        className="w-full mt-3"
        onClick={(e) => {
          e.stopPropagation();
          onApply();
        }}
      >
        適用
      </Button>
    </div>
  );
}

// Prompt List Item Component
interface PromptListItemProps {
  prompt: CustomPrompt;
  isSelected: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
  onApply: () => void;
}

function PromptListItem({ prompt, isSelected, onSelect, onToggleFavorite, onApply }: PromptListItemProps) {
  return (
    <div
      className={cn(
        "p-3 rounded-md border cursor-pointer transition-all flex items-center gap-3",
        isSelected
          ? "bg-primary/10 border-primary"
          : "hover:bg-muted/50"
      )}
      onClick={onSelect}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="text-muted-foreground hover:text-yellow-500 transition-colors"
      >
        {prompt.isFavorite ? (
          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
        ) : (
          <StarOff className="w-4 h-4" />
        )}
      </button>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm text-foreground">
            {prompt.title}
          </h4>
          {prompt.isOptimized && (
            <Sparkles className="w-3 h-3 text-yellow-500" />
          )}
          <div className="flex items-center gap-1">
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-primary/20 text-primary text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
          {prompt.content}
        </p>
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          onApply();
        }}
      >
        適用
      </Button>
    </div>
  );
}

// Prompt Edit Form Component (simplified version from original)
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
    // Simulate optimization (in real app, would call API)
    setTimeout(() => {
      setContent(`[最適化済み]\n\n${content}`);
      setIsOptimizing(false);
    }, 1500);
  };

  const handleDuplicate = () => {
    const duplicatedPrompt: CustomPrompt = {
      id: generateId(),
      title: `${title} (コピー)`,
      content,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      createdAt: new Date(),
      updatedAt: new Date(),
      isOptimized: false,
    };
    onSave(duplicatedPrompt);
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-foreground">
          {prompt ? "プロンプト編集" : "新規プロンプト"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
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
              "w-full h-48 p-3 text-sm bg-background border border-input rounded-md",
              "resize-none custom-scrollbar",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          />
          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOptimize}
              disabled={isOptimizing || !content.trim()}>
              <Sparkles className="w-4 h-4 mr-1" />
              {isOptimizing ? "最適化中..." : "AI最適化"}
            </Button>
            {prompt && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-1" />
                複製
              </Button>
            )}
          </div>
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
      <div className="flex items-center justify-between pt-4 border-t">
        {onDelete && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-1" />
            削除
          </Button>
        )}
        <div className="flex items-center gap-2 ml-auto">
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
    </div>
  );
}