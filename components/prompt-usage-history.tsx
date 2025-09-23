"use client";

import { useState } from "react";
import { useAppStore } from "@/store/use-app-store";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Clock, ChevronRight, FileText, Target } from "lucide-react";

export function PromptUsageHistory() {
  const { promptHistory, customPrompts, panels } = useAppStore();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Group history by prompt
  const groupedHistory = promptHistory.reduce<Record<string, typeof promptHistory>>(
    (acc, item) => {
      if (!acc[item.promptId]) {
        acc[item.promptId] = [];
      }
      acc[item.promptId].push(item);
      return acc;
    },
    {}
  );

  // Sort by most recent usage
  const sortedPromptIds = Object.keys(groupedHistory).sort(
    (a, b) =>
      new Date(groupedHistory[b][0].appliedAt).getTime() -
      new Date(groupedHistory[a][0].appliedAt).getTime()
  );

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">プロンプト使用履歴</h3>
      </div>

      {sortedPromptIds.length > 0 ? (
        <div className="space-y-2">
          {sortedPromptIds.slice(0, 10).map((promptId) => {
            const prompt = customPrompts.find(p => p.id === promptId);
            const usages = groupedHistory[promptId];
            const isExpanded = expandedItem === promptId;

            if (!prompt) return null;

            return (
              <div
                key={promptId}
                className={cn(
                  "rounded-lg border transition-all",
                  isExpanded ? "bg-muted/30" : "hover:bg-muted/20"
                )}
              >
                <button
                  onClick={() => setExpandedItem(isExpanded ? null : promptId)}
                  className="w-full p-3 flex items-center gap-3 text-left"
                >
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      <span className="text-sm font-medium">{prompt.title}</span>
                      <span className="text-xs text-muted-foreground">
                        ({usages.length}回使用)
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      最終使用: {formatDistanceToNow(new Date(usages[0].appliedAt), {
                        addSuffix: true,
                        locale: ja
                      })}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3">
                    <div className="ml-7 space-y-2 border-l-2 border-muted pl-4">
                      {usages.slice(0, 5).map((usage, index) => (
                        <div key={usage.id} className="text-xs">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Target className="w-3 h-3" />
                            <span>
                              {formatDistanceToNow(new Date(usage.appliedAt), {
                                addSuffix: true,
                                locale: ja
                              })}
                            </span>
                          </div>

                          <div className="mt-1 flex flex-wrap gap-1">
                            {usage.panelIds.map((panelId: string) => {
                              const panel = panels.find(p => p.id === panelId);
                              return (
                                <span
                                  key={panelId}
                                  className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-xs"
                                >
                                  Panel {panelId.split('-')[1]}
                                  {panel && ` (${panel.modelId.split('/')[1]})`}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {usages.length > 5 && (
                        <div className="text-xs text-muted-foreground">
                          他 {usages.length - 5} 件の使用履歴
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <div className="text-sm">使用履歴がありません</div>
          <div className="text-xs mt-1">
            プロンプトをパネルに適用すると履歴が記録されます
          </div>
        </div>
      )}

      {promptHistory.length > 10 && (
        <div className="mt-4 text-center">
          <button className="text-xs text-primary hover:underline">
            すべての履歴を表示 ({promptHistory.length}件)
          </button>
        </div>
      )}
    </div>
  );
}