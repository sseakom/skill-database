import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** 「数据待校对」小标记 — 用于 verified=false 的条目 */
export function VerifiedMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400",
        className
      )}
      title="该条目数值未经官方校对，仅供参考"
    >
      <AlertCircle className="size-3" />
      数据待校对
    </span>
  );
}
