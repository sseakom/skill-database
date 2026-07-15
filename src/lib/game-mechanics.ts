/**
 * 《选技大乱斗》游戏机制计算
 *
 * 负责由「选中技能列表」推导流派星级、英雄等级、HP 与基础属性面板。
 * 设计原则：纯函数 + 确定性，便于模拟器与推荐器复用。
 *
 * 说明：技能 effect 文本无法精确解析出攻击/攻速等加成，
 * 本版仅计算等级与 HP，其余属性暂取英雄基础值，UI 层据此标注
 * 「技能加成待实现」。
 */
import type { Hero, Skill } from "@/lib/types";
import { STAR_THRESHOLDS } from "@/lib/types";

/** 属性面板结构 */
export interface StatPanel {
  /** 英雄等级（1 + 全流派星级之和） */
  level: number;
  /** 生命值（基础 + 等级成长） */
  hp: number;
  /** 攻击力（基础值，技能加成待实现） */
  attack: number;
  /** 攻速（基础值，技能加成待实现） */
  attackSpeed: number;
  /** 回蓝（基础值） */
  energy: number;
  /** 闪避（基础值，缺失记 0） */
  dodge: number;
  /** 暴击（基础值，缺失记 0） */
  crit: number;
  /** 爆伤（基础值，缺失记 2.5） */
  critDamage: number;
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

/**
 * 由英雄与选中技能计算完整属性面板。
 * 等级与 HP 由机制精确计算；其余属性暂取英雄基础值。
 */
export function computeStatPanel(hero: Hero, selectedSkills: Skill[]): StatPanel {
  const factionStars = computeFactionStars(selectedSkills);
  const level = computeHeroLevel(factionStars);
  const hp = computeHeroHp(hero, level);
  const base = hero.baseStats;
  return {
    level,
    hp,
    attack: base.attack,
    attackSpeed: base.attackSpeed,
    energy: base.energy,
    dodge: base.dodge ?? 0,
    crit: base.crit ?? 0,
    critDamage: base.critDamage ?? 2.5,
  };
}

/** 选中技能的金币总花费（cost 之和） */
export function computeTotalCost(selectedSkills: Skill[]): number {
  return selectedSkills.reduce((sum, skill) => sum + skill.cost, 0);
}
