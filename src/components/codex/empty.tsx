import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message?: string;
  className?: string;
}

/** 列表为空时的占位 */
export function EmptyState({
  message = "暂无数据",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground",
        className
      )}
    >
      {message}
    </div>
  );
}
