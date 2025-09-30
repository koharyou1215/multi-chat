"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/lib/utils";
import { zIndex } from "@/lib/z-index";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Key, Sparkles, Save, RefreshCw } from "lucide-react";

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

export function Settings({ open, onClose }: SettingsProps) {
  const store = useAppStore();
  const openRouterApiKey = store.openRouterApiKey || store.apiKeys?.openRouter || store.apiKeys?.openrouter || "";
  const geminiApiKey = store.apiKeys?.gemini || "";
  const anthropicApiKey = store.apiKeys?.anthropic || "";
  const panels = store.panels;
  const savePanelData = store.savePanelData ?? (() => {});
  const loadPanelData = store.loadPanelData ?? (() => {});
  const resetPanels = store.resetPanels ?? (() => {});

  const [tempOpenRouterKey, setTempOpenRouterKey] = useState(openRouterApiKey || "");
  const [tempGeminiKey, setTempGeminiKey] = useState(geminiApiKey || "");
  const [tempAnthropicKey, setTempAnthropicKey] = useState(anthropicApiKey || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTempOpenRouterKey(openRouterApiKey || "");
      setTempGeminiKey(geminiApiKey || "");
      setTempAnthropicKey(anthropicApiKey || "");
    }
  }, [open, openRouterApiKey, geminiApiKey, anthropicApiKey]);

  const handleSave = async () => {
    setIsSaving(true);

    // Save API keys via store.setApiKey
    store.setApiKey && store.setApiKey("openrouter", tempOpenRouterKey);
    store.setApiKey && store.setApiKey("gemini", tempGeminiKey);
    store.setApiKey && store.setApiKey("anthropic", tempAnthropicKey);

    // Save panel data
    savePanelData();

    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 500);
  };

  const handleReset = () => {
    if (confirm("すべての設定をリセットしますか？この操作は取り消せません。")) {
      setTempOpenRouterKey("");
      setTempGeminiKey("");
      setTempAnthropicKey("");
      // Reset API keys in the store
      store.setApiKey && store.setApiKey("openrouter", "");
      store.setApiKey && store.setApiKey("gemini", "");
      store.setApiKey && store.setApiKey("anthropic", "");
      resetPanels();
    }
  };

  const handleLoadData = () => {
    loadPanelData();
    console.log("📊 Panel data loaded from localStorage");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className={cn("fixed inset-0 bg-black/50", zIndex('MODAL_BACKDROP'))} />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "bg-card border rounded-lg shadow-lg w-full max-w-md",
            zIndex('SETTINGS_MODAL')
          )}>

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              設定
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* API Keys Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-medium">APIキー設定</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="openrouter-key" className="text-xs text-muted-foreground">
                    OpenRouter API キー
                  </Label>
                  <Input
                    id="openrouter-key"
                    type="password"
                    placeholder="sk-or-..."
                    value={tempOpenRouterKey}
                    onChange={(e) => setTempOpenRouterKey(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="gemini-key" className="text-xs text-muted-foreground">
                    Google Gemini API キー
                  </Label>
                  <Input
                    id="gemini-key"
                    type="password"
                    placeholder="AIza..."
                    value={tempGeminiKey}
                    onChange={(e) => setTempGeminiKey(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="anthropic-key" className="text-xs text-muted-foreground">
                    Anthropic API キー
                  </Label>
                  <Input
                    id="anthropic-key"
                    type="password"
                    placeholder="sk-ant-..."
                    value={tempAnthropicKey}
                    onChange={(e) => setTempAnthropicKey(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Data Management Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">データ管理</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadData}
                  className="text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  データ復元
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  リセット
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                現在のパネル数: {panels?.length || 0}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-6 border-t">
            <Dialog.Close asChild>
              <Button variant="outline" size="sm">
                キャンセル
              </Button>
            </Dialog.Close>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="min-w-[80px]"
            >
              {isSaving ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <Save className="w-3 h-3 mr-1" />
                  保存
                </>
              )}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}