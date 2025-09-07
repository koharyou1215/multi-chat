"use client";

import { useAppStore } from "@/store/use-app-store";
import { useState } from "react";
import { availableModels, getModelsByGroup } from "@/lib/models";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelPill } from "./ui/model-pill";

interface ModelSelectorProps {
  panelId: string;
  currentModelId: string;
}

export function ModelSelector({ panelId, currentModelId }: ModelSelectorProps) {
  const { setModelForPanel } = useAppStore();
  const modelGroups = getModelsByGroup();
  const [open, setOpen] = useState(false);

  return (
    <Select.Root
      open={open}
      onOpenChange={setOpen}
      value={currentModelId}
      onValueChange={(value) => setModelForPanel(panelId, value)}>
      <Select.Trigger
        className={cn(
          "relative flex items-center justify-between w-full px-2 py-1 text-xs",
          "bg-background border border-input rounded-full",
          "focus:outline-none focus:ring-2 focus:ring-ring",
          "hover:bg-accent hover:text-accent-foreground",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
        onPointerDown={(e) => {
          e.stopPropagation();
        }}>
        <div className="flex items-center gap-2">
          <ModelPill modelId={currentModelId} />
        </div>
        <Select.Icon>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          className="bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-auto z-[9999]">
          <Select.Viewport className="p-1">
            {Object.entries(modelGroups).map(([group, models]) => (
              <div key={group}>
                <Select.Group>
                  <Select.Label className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {group}
                  </Select.Label>
                  {models.map((model) => (
                    <Select.Item
                      key={model.id}
                      value={model.id}
                      className={cn(
                        "relative flex cursor-default select-none items-center",
                        "px-2 py-1.5 text-sm outline-none",
                        "focus:bg-accent focus:text-accent-foreground",
                        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                      )}>
                      <Select.ItemText>{model.name}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Group>
                <Select.Separator className="h-px bg-border my-1" />
              </div>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
