import { cn } from "@/lib/utils";

interface StatBarProps {
  label: string;
  value: number;
  /** 进度条最大值（用于换算百分比） */
  max: number;
  /** 自定义展示文本（默认用 value） */
  display?: string;
  className?: string;
}

/** 横向数值进度条：标签 + 数值 + 进度条 */
export function StatBar({
  label,
  value,
  max,
  display,
  className,
}: StatBarProps) {
  const pct =
    max > 0 ? Math.min(100, Math.max(2, (value / max) * 100)) : 0;
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums">{display ?? value}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-primary/80"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
