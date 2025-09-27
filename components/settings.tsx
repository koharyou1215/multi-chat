"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "./ui/button";
import { X, Key, RefreshCw } from "lucide-react";
import { validateApiKey as validateUtilsApiKey, cn } from "@/lib/utils";

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

export function Settings({ open, onClose }: SettingsProps) {
  const { openRouterApiKey, setApiKey, resetStore } = useAppStore();
  const [inputKey, setInputKey] = useState(openRouterApiKey);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleTestApiKey = async () => {
    if (!inputKey.trim()) {
      alert("APIキーを入力してください");
      return;
    }

    setIsValidating(true);
    try {
      const { OpenRouterClient } = await import("@/lib/api/openrouter");
      const client = new OpenRouterClient(inputKey);
      const isValid = await client.validateApiKey();

      if (isValid) {
        alert("APIキーの検証が成功しました");
      } else {
        alert("APIキーの検証に失敗しました。キーを確認してください。");
      }
    } catch (error) {
      alert("APIキーの検証でエラーが発生しました。");
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveApiKey = async () => {
    // まず古いクライアントキャッシュをクリア
    try {
      const { OpenRouterClient } = await import("@/lib/api/openrouter");
      const client = new OpenRouterClient(inputKey);
      const isValid = await client.validateApiKey();

      if (isValid) {
        setApiKey(inputKey);
        alert("APIキーが正常に設定されました");
        // ページをリロードして新しいAPIキーを確実に使用する
        window.location.reload();
      } else {
        alert("APIキーの検証に失敗しました。キーを確認してください。");
      }
    } catch (error) {
      alert("APIキーの検証でエラーが発生しました。");
    }
  };

  const handleReset = () => {
    resetStore();
    setShowConfirmReset(false);
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
        <Dialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
            "bg-card border rounded-lg shadow-lg w-full max-w-md z-[110]"
          )}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-lg font-semibold text-foreground">
              設定
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon">
                <X className="w-4 h-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {/* API Key */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Key className="w-4 h-4" />
                OpenRouter APIキー
              </h3>
              <div className="space-y-2">
                <input
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="sk-or-..."
                  className={cn(
                    "w-full p-2 text-sm bg-background border border-input rounded-md",
                    "focus:outline-none focus:ring-2 focus:ring-ring"
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTestApiKey}
                    disabled={!inputKey.trim() || isValidating}
                    className="flex-1">
                    {isValidating ? "検証中..." : "テスト"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveApiKey}
                    disabled={!inputKey.trim()}
                    className="flex-1">
                    設定
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  現在の状態:
                  <span
                    className={
                      validateUtilsApiKey(openRouterApiKey)
                        ? "text-green-500"
                        : "text-destructive"
                    }>
                    {validateUtilsApiKey(openRouterApiKey)
                      ? "設定済み"
                      : "未設定"}
                  </span>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                データ管理
              </h3>
              <div className="space-y-2">
                <div className="bg-muted/30 p-3 rounded-md">
                  <div className="text-xs text-muted-foreground mb-2">
                    すべてのチャットメッセージ、カスタムプロンプト、設定をリセットします。
                    この操作は元に戻せません。
                  </div>
                  {!showConfirmReset ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowConfirmReset(true)}
                      className="w-full">
                      アプリデータをリセット
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs text-destructive font-medium">
                        本当にリセットしますか？
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowConfirmReset(false)}
                          className="flex-1">
                          キャンセル
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleReset}
                          className="flex-1">
                          リセット
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
