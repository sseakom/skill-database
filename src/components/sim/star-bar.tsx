import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 星级条：渲染 max 个星形，前 stars 个实心金色，其余空心灰显。
 */
export function StarBar({
  stars,
  max = 4,
  className,
}: {
  stars: number;
  max?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${stars} 星`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i < stars ? "text-yellow-400" : "text-muted-foreground/30"
          )}
          fill={i < stars ? "currentColor" : "none"}
          strokeWidth={i < stars ? 0 : 1.5}
        />
      ))}
    </span>
  );
}
