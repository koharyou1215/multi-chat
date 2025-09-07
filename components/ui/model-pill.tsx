"use client";

import { Cpu, Brain, Sparkles } from "lucide-react";
import { getModelById } from "@/lib/models";

interface ModelPillProps {
  modelId: string;
}

export function ModelPill({ modelId }: ModelPillProps) {
  const model = getModelById(modelId);
  const Icon = model?.group?.includes("Google")
    ? Sparkles
    : model?.group?.includes("Anthropic")
    ? Brain
    : Cpu;

  const colorClass = model?.group?.includes("Google")
    ? "border-blue-300 text-blue-700"
    : model?.group?.includes("Anthropic")
    ? "border-purple-300 text-purple-700"
    : model?.group?.includes("OpenAI")
    ? "border-emerald-300 text-emerald-700"
    : "border-zinc-300 text-foreground";

  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border bg-background text-xs ${colorClass}`}>
      <Icon className="w-3 h-3 opacity-70" />
      <span className="font-medium text-foreground truncate max-w-40">
        {model?.name || modelId}
      </span>
      {typeof model?.costPer1K === "number" && (
        <span className="text-muted-foreground">${model!.costPer1K}/1K</span>
      )}
    </div>
  );
}
