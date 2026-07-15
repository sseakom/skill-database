import { Badge } from "@/components/ui/badge";
import { TIER_META, type SkillTier } from "@/lib/types";
import { cn } from "@/lib/utils";

/** 品阶颜色：传奇金、稀有蓝、普通灰 */
const TIER_COLOR: Record<SkillTier, string> = {
  legendary: "text-yellow-400 border-yellow-400/40",
  rare: "text-blue-400 border-blue-400/40",
  normal: "text-muted-foreground border-border",
};

/** 技能品阶徽章 */
export function TierBadge({ tier }: { tier: SkillTier }) {
  return (
    <Badge variant="outline" className={cn(TIER_COLOR[tier])}>
      {TIER_META[tier].label}
    </Badge>
  );
}
