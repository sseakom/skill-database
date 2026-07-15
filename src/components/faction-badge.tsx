import Link from "next/link";
import { FACTION_COLOR_MAP, FACTION_NAME_MAP } from "@/lib/data";
import { cn } from "@/lib/utils";

/** 流派徽章：色点 + 名称，可点击跳转流派图鉴 */
export function FactionBadge({
  factionId,
  clickable = true,
  className,
}: {
  factionId: string;
  clickable?: boolean;
  className?: string;
}) {
  const name = FACTION_NAME_MAP[factionId] ?? factionId;
  const color = FACTION_COLOR_MAP[factionId] ?? "#888";
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium",
        clickable && "transition-colors hover:bg-secondary/70",
        className
      )}
    >
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
  if (!clickable) return content;
  return (
    <Link href={`/factions#${factionId}`} className="inline-block">
      {content}
    </Link>
  );
}
