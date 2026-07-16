/**
 * 《选技大乱斗》游戏机制计算
 *
 * 负责由「选中技能列表」推导流派星级、英雄等级、HP 与基础属性面板。
 * 设计原则：纯函数 + 确定性，便于模拟器与推荐器复用。
 *
 * 说明：技能对属性的加成通过 Skill.statBonuses 结构化字段累加，
 * 加成为固定值（不随星级缩放）。attack/attackSpeed/energy/critDamage
 * 为 base + bonus 的合并总值；dodge/crit 在累加后 clamp 至 75 上限。
 * hp 仅由等级成长决定，不受 statBonuses 影响；累加到的加成量额外
 * 通过 panel.bonuses 暴露给 UI 展示「(+X)」标注。
 */
import type { Hero, Skill, StatBonuses } from "@/lib/types";
import { STAR_THRESHOLDS } from "@/lib/types";

/** 属性面板结构 */
export interface StatPanel {
  /** 英雄等级（1 + 全流派星级之和） */
  level: number;
  /** 生命值（基础 + 等级成长；不受技能 statBonuses 影响） */
  hp: number;
  /** 攻击力（基础 + 技能加成） */
  attack: number;
  /** 攻速（基础 + 技能加成） */
  attackSpeed: number;
  /** 回蓝（基础 + 技能加成） */
  energy: number;
  /** 闪避（基础 + 技能加成，上限 75；缺失记 0） */
  dodge: number;
  /** 暴击（基础 + 技能加成，上限 75；缺失记 0） */
  crit: number;
  /** 爆伤（基础 + 技能加成；缺失记 2.5） */
  critDamage: number;
  /** 技能累加的加成量（供 UI 展示「(+X)」标注） */
  bonuses: Partial<StatBonuses>;
}

/**
 * 按流派分组计数技能，对照 STAR_THRESHOLDS 得各流派星级 0-4。
 * 仅返回有选中技能的流派；未选中技能的流派不在结果中。
 */
export function computeFactionStars(
  selectedSkills: Skill[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const skill of selectedSkills) {
    counts[skill.faction] = (counts[skill.faction] ?? 0) + 1;
  }

  const stars: Record<string, number> = {};
  for (const [factionId, count] of Object.entries(counts)) {
    let star = 0;
    for (const threshold of STAR_THRESHOLDS) {
      if (count >= threshold) star += 1;
    }
    stars[factionId] = star;
  }
  return stars;
}

/** 英雄等级 = 1 + 全流派星级之和 */
export function computeHeroLevel(factionStars: Record<string, number>): number {
  const totalStars = Object.values(factionStars).reduce(
    (sum, stars) => sum + stars,
    0
  );
  return 1 + totalStars;
}

/** 英雄 HP = baseStats.hp + (level - 1) * 100 */
export function computeHeroHp(hero: Hero, level: number): number {
  return hero.baseStats.hp + (level - 1) * 100;
}

/** 闪避 / 暴击累加后的上限 */
const STAT_CAP = 75;

/**
 * 由英雄与选中技能计算完整属性面板。
 * 等级与 HP 由机制精确计算；attack/attackSpeed/energy/critDamage 为
 * base + bonus 合并值，dodge/crit 累加后 clamp 至 75。statBonuses 中的
 * hp 项不计入 panel.hp（HP 仅由等级成长），但会累加进 panel.bonuses.hp
 * 供 UI 展示参考。
 */
export function computeStatPanel(hero: Hero, selectedSkills: Skill[]): StatPanel {
  const factionStars = computeFactionStars(selectedSkills);
  const level = computeHeroLevel(factionStars);
  const hp = computeHeroHp(hero, level);
  const base = hero.baseStats;

  // 累加所有选中技能的 statBonuses
  const bonuses: StatBonuses = {};
  for (const skill of selectedSkills) {
    const sb = skill.statBonuses;
    if (!sb) continue;
    for (const key of Object.keys(sb) as (keyof StatBonuses)[]) {
      const v = sb[key];
      if (v === undefined) continue;
      bonuses[key] = (bonuses[key] ?? 0) + v;
    }
  }

  return {
    level,
    hp,
    attack: base.attack + (bonuses.attack ?? 0),
    attackSpeed: base.attackSpeed + (bonuses.attackSpeed ?? 0),
    energy: base.energy + (bonuses.energy ?? 0),
    dodge: Math.min(STAT_CAP, (base.dodge ?? 0) + (bonuses.dodge ?? 0)),
    crit: Math.min(STAT_CAP, (base.crit ?? 0) + (bonuses.crit ?? 0)),
    critDamage: (base.critDamage ?? 2.5) + (bonuses.critDamage ?? 0),
    bonuses,
  };
}

/** 选中技能的金币总花费（cost 之和） */
export function computeTotalCost(selectedSkills: Skill[]): number {
  return selectedSkills.reduce((sum, skill) => sum + skill.cost, 0);
}
