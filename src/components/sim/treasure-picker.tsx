"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Treasure } from "@/lib/types";

/**
 * 宝物多选器：点击切换选中，达到 maxTreasures 上限时未选项禁用。
 */
export function TreasurePicker({
  treasures,
  selectedIds,
  onToggle,
  maxTreasures,
}: {
  treasures: Treasure[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxTreasures: number;
}) {
  const atLimit = selectedIds.length >= maxTreasures;

  return (
    <div className="grid gap-1.5 sm:grid-cols-2">
      {treasures.map((treasure) => {
        const selected = selectedIds.includes(treasure.id);
        const disabled = !selected && atLimit;
        return (
          <button
            key={treasure.id}
            type="button"
            onClick={() => !disabled && onToggle(treasure.id)}
            disabled={disabled}
            className={cn(
              "flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors",
              selected
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-secondary/60",
              disabled && "cursor-not-allowed opacity-40"
            )}
          >
            <Check
              className={cn(
                "mt-0.5 size-3.5 shrink-0",
                selected ? "text-primary" : "text-transparent"
              )}
            />
            <span className="min-w-0">
              <span className="block font-medium">{treasure.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {treasure.effect}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
