import { Badge } from "@/components/ui/badge";
import type { DamageType } from "@/lib/types";

const DAMAGE_TYPE_LABEL: Record<DamageType, string> = {
  physical: "物理",
  magical: "魔法",
  pure: "纯粹",
  mixed: "混合",
};

/** 伤害类型徽章，如「物理伤害」「纯粹伤害」 */
export function DamageTypeBadge({ type }: { type: DamageType }) {
  return <Badge variant="outline">{DAMAGE_TYPE_LABEL[type]}伤害</Badge>;
}
