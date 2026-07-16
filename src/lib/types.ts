/**
 * 《选技大乱斗》数据库 — 数据模型类型定义
 *
 * 类型是全应用的地基：图鉴、模拟器、推荐器均依赖此处。
 * verified=false 表示该条目数值未官方校对，仅为占位/估算值，
 * UI 层应据此展示「数据待校对」标记。
 */

/** 伤害类型：物理 / 魔法 / 纯粹(神圣) / 混合 */
export type DamageType = "physical" | "magical" | "pure" | "mixed";

/** 技能品阶：普通 / 稀有 / 传奇 */
export type SkillTier = "normal" | "rare" | "legendary";

/** 英雄强度评级 */
export type HeroTier = "T0" | "T1" | "T2" | "T3";

/** 英雄基础属性 */
export interface BaseStats {
  /** 生命值 */
  hp: number;
  /** 攻击力 */
  attack: number;
  /** 攻速 */
  attackSpeed: number;
  /** 回蓝（能量，每 0.1s 结算，失血也回蓝） */
  energy: number;
  /** 闪避（上限 75） */
  dodge?: number;
  /** 暴击（上限 75） */
  crit?: number;
  /** 爆伤（默认 2.5） */
  critDamage?: number;
}

/** 技能对属性的结构化加成（供模拟器结算，数值待官方校对） */
export interface StatBonuses {
  /** 攻击力 +X 点 */
  attack?: number;
  /** 攻速 +X */
  attackSpeed?: number;
  /** 回蓝 +X */
  energy?: number;
  /** 闪避 +X（百分点） */
  dodge?: number;
  /** 暴击 +X（百分点） */
  crit?: number;
  /** 爆伤 +X（倍数，0.4 = +0.4x） */
  critDamage?: number;
  /** 生命 +X 点 */
  hp?: number;
}

/** 天赋 / 被动技能描述 */
export interface Ability {
  name: string;
  description: string;
}

/** 大招（主动技能） */
export interface Ultimate extends Ability {
  damageType?: DamageType;
}

/** 英雄 */
export interface Hero {
  id: string;
  name: string;
  /** 头衔 / 定位 */
  title?: string;
  /** 流派倾向（faction id 列表） */
  factions: string[];
  /** 天赋（永久被动） */
  passive: Ability;
  /** 大招（主动） */
  ultimate: Ultimate;
  baseStats: BaseStats;
  /** 禁用流派（ban 机制） */
  banFactions?: string[];
  tier?: HeroTier;
  description: string;
  imageUrl?: string;
  /** 数据是否已校对 */
  verified?: boolean;
}

/** 技能 */
export interface Skill {
  id: string;
  name: string;
  /** 所属流派 id */
  faction: string;
  tier: SkillTier;
  /** 金币价（普通 100 / 稀有 200 / 传奇 300） */
  cost: number;
  /** 经验（普通 +1 / 稀有 +2 / 传奇 +3） */
  exp: number;
  /** 效果 */
  effect: string;
  /** 各星级效果（索引 0=1 星 … 3=4 星） */
  starBonuses?: string[];
  /** 对英雄属性的结构化加成（模拟器结算用，固定值累加，不随星级缩放） */
  statBonuses?: StatBonuses;
  description: string;
  imageUrl?: string;
  verified?: boolean;
}

/** 宝物（遗物，第 1/4/9 局三选一） */
export interface Treasure {
  id: string;
  name: string;
  effect: string;
  description: string;
  imageUrl?: string;
  verified?: boolean;
}

/** 流派 */
export interface Faction {
  id: string;
  name: string;
  description: string;
  /** 机制说明 */
  mechanics: string;
  /** 优势 */
  strengths: string[];
  /** 劣势 */
  weaknesses: string[];
  /** 克制的流派 id 列表（数据源，手工维护） */
  counters: string[];
  /** 被哪些流派克制（由数据层从 counters 自动派生，勿手工填写） */
  counteredBy?: string[];
  /** 协同流派 id 列表 */
  synergy: string[];
  /** 主题色（克制图谱节点用） */
  color?: string;
  verified?: boolean;
}

/** 升星阈值：同流派技能学习达该数量则升星 */
export const STAR_THRESHOLDS = [2, 4, 6, 8] as const;

/** 品阶对应的价与经验 */
export const TIER_META: Record<SkillTier, { cost: number; exp: number; label: string }> = {
  normal: { cost: 100, exp: 1, label: "普通" },
  rare: { cost: 200, exp: 2, label: "稀有" },
  legendary: { cost: 300, exp: 3, label: "传奇" },
};
