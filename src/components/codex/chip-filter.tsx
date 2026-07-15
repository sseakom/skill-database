"use client";

import { cn } from "@/lib/utils";

export interface Chip {
  /** null 代表「全部」 */
  id: string | null;
  label: string;
  /** 可选色点（如流派主题色） */
  color?: string;
}

interface ChipFilterProps {
  chips: Chip[];
  active: string | null;
  onChange: (id: string | null) => void;
  ariaLabel?: string;
  className?: string;
}

/** 单选 chips 筛选组，点击切换激活态 */
export function ChipFilter({
  chips,
  active,
  onChange,
  ariaLabel,
  className,
}: ChipFilterProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {chips.map((c) => {
        const isActive = (c.id ?? null) === (active ?? null);
        return (
          <button
            key={c.label}
            type="button"
            onClick={() => onChange(c.id)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {c.color && (
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: c.color }}
              />
            )}
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
