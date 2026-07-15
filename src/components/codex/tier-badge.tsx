import { Badge } from "@/components/ui/badge";
import type { HeroTier, SkillTier } from "@/lib/types";

const SKILL_TIER_LABEL: Record<SkillTier, string> = {
  normal: "普通",
  rare: "稀有",
  legendary: "传奇",
};

/** 英雄强度徽章，T0 用 primary 强调色 */
export function HeroTierBadge({ tier }: { tier: HeroTier }) {
  return (
    <Badge variant={tier === "T0" ? "primary" : "default"}>{tier}</Badge>
  );
}

/** 技能品阶徽章：normal=default / rare=accent / legendary=primary */
export function SkillTierBadge({ tier }: { tier: SkillTier }) {
  const variant =
    tier === "legendary" ? "primary" : tier === "rare" ? "accent" : "default";
  return <Badge variant={variant}>{SKILL_TIER_LABEL[tier]}</Badge>;
}
