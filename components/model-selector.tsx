"use client";

import { useAppStore } from "@/store/use-app-store";
import { useState, useRef, useEffect } from "react";
import { availableModels, getModelsByGroup, getModelById } from "@/lib/models";
import * as Select from "@radix-ui/react-select";
import { ChevronDown, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelPill } from "./ui/model-pill";

interface ModelSelectorProps {
  // Support both interfaces
  panelId?: string; // For panel-specific usage
  currentModelId?: string; // For panel-specific usage
  value?: string; // For controlled component usage
  onChange?: (modelId: string) => void; // For controlled component usage
  className?: string;
  variant?: "radix" | "custom" | "simple"; // Choose implementation style
}

export function ModelSelector({
  panelId,
  currentModelId,
  value,
  onChange,
  className,
  variant = "radix",
}: ModelSelectorProps) {
  const { setModelForPanel } = useAppStore();
  const modelGroups = getModelsByGroup();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Determine which model ID and change handler to use
  const modelId = currentModelId || value || "";
  const handleChange = (newModelId: string) => {
    if (panelId && setModelForPanel) {
      setModelForPanel(panelId, newModelId);
    }
    if (onChange) {
      onChange(newModelId);
    }
  };

  const currentModel = getModelById(modelId);

  // Close dropdown on outside click (for custom variant)
  useEffect(() => {
    if (variant !== "custom") return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, variant]);

  // Simple implementation (clean dropdown)
  if (variant === "simple") {
    return (
      <Select.Root
        open={open}
        onOpenChange={setOpen}
        value={modelId}
        onValueChange={handleChange}>
        <Select.Trigger
          className={cn(
            "relative inline-flex items-center gap-2 px-3 py-1.5 text-xs",
            "rounded-lg bg-white/10 backdrop-blur-sm",
            "hover:bg-white/20",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-white/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "text-white font-medium",
            className
          )}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}>
          <span className="font-medium">
            {currentModel?.name || "Select Model"}
          </span>
          <Select.Icon>
            <ChevronDown className="w-3 h-3" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={5}
            align="center"
            className={cn(
              "z-50 min-w-[150px] overflow-hidden",
              "rounded-lg bg-gray-900",
              "border border-white/20 shadow-2xl",
              "animate-in fade-in-0 zoom-in-95"
            )}>
            <Select.Viewport className="p-1">
              {Object.entries(modelGroups).map(([group, models]) => (
                <div key={group}>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">
                    {group}
                  </div>
                  {models.map((model) => (
                    <Select.Item
                      key={model.id}
                      value={model.id}
                      className={cn(
                        "relative flex items-center px-2 py-1.5 text-xs",
                        "rounded outline-none cursor-pointer",
                        "hover:bg-white/10 hover:text-white",
                        "focus:bg-white/10 focus:text-white",
                        "data-[state=checked]:bg-white/20 data-[state=checked]:text-white",
                        "transition-colors text-gray-300"
                      )}>
                      <Select.ItemText>{model.name}</Select.ItemText>
                    </Select.Item>
                  ))}
                </div>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    );
  }

  // Radix UI implementation (glass morphism style)
  if (variant === "radix") {
    return (
      <Select.Root
        open={open}
        onOpenChange={setOpen}
        value={modelId}
        onValueChange={handleChange}>
        <Select.Trigger
          className={cn(
            "relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs",
            "rounded-full bg-gradient-to-r from-purple-500/40 to-pink-500/40",
            "border border-purple-400/50 backdrop-blur-md",
            "hover:from-purple-500/30 hover:to-pink-500/30",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-purple-400/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}>
          <span className="font-medium text-purple-200">
            <ModelPill modelId={modelId} />
          </span>
          <Select.Icon>
            <ChevronDown className="w-3 h-3 text-purple-300" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={5}
            align="center"
            className={cn(
              "z-50 min-w-[180px] overflow-hidden",
              "rounded-xl bg-gray-900",
              "border border-white/10 shadow-2xl",
              "animate-in fade-in-0 zoom-in-95"
            )}>
            <Select.Viewport className="p-1">
              {Object.entries(modelGroups).map(([group, models]) => (
                <div key={group}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-purple-300 uppercase tracking-wider">
                    {group}
                  </div>
                  {models.map((model) => (
                    <Select.Item
                      key={model.id}
                      value={model.id}
                      className={cn(
                        "relative flex items-center justify-between px-2 py-1.5 text-sm",
                        "rounded-lg outline-none cursor-pointer",
                        "hover:bg-purple-500/20 hover:text-purple-200",
                        "focus:bg-purple-500/20 focus:text-purple-200",
                        "data-[state=checked]:bg-purple-500/30 data-[state=checked]:text-purple-100",
                        "transition-colors"
                      )}>
                      <Select.ItemText>{model.name}</Select.ItemText>
                      {model.description && (
                        <span className="text-xs text-gray-400 ml-2">
                          {model.description}
                        </span>
                      )}
                    </Select.Item>
                  ))}
                </div>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    );
  }

  // Custom dropdown implementation (simple style)
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={cn(
          "flex items-center gap-2 px-2 py-1 rounded",
          "hover:bg-accent transition-colors",
          "text-sm font-medium",
          className
        )}>
        <Bot className="w-3 h-3" />
        <span className="truncate">{currentModel?.name || "Select Model"}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full mt-1 z-50",
            "min-w-[200px] max-h-[400px] overflow-auto",
            "bg-popover border rounded-lg shadow-lg",
            "animate-in fade-in-0 zoom-in-95"
          )}>
          {Object.entries(modelGroups).map(([group, models]) => (
            <div key={group}>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group}
              </div>
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    handleChange(model.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm",
                    "hover:bg-accent transition-colors",
                    "flex items-center justify-between",
                    model.id === modelId && "bg-accent"
                  )}>
                  <span>{model.name}</span>
                  {model.contextWindow && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {Math.floor(model.contextWindow / 1000)}K
                    </span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
