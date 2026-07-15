/**
 * 《选技大乱斗》流派推荐器（启发式）
 *
 * 输入主流派 + 可选英雄与打法风格，输出推荐技能与宝物列表。
 * 算法保持简单、可读、确定性：按品阶传奇 > 稀有 > 普通优先取技，
 * 主流派集中取数以触发升星，协同流派各取前 2 个作为升星素材。
 *
 * 全部经 data 层函数取数据，不直接 import 数据数组。
 */
import {
  getFactionById,
  getHeroById,
  getSkillsByFaction,
  getTreasureById,
  getTreasures,
} from "@/lib/data";
import type { Skill, SkillTier, Treasure } from "@/lib/types";

/** 打法风格 */
export type Playstyle = "aggressive" | "defensive" | "economic";

/** 推荐输入 */
export interface RecommendInput {
  primaryFaction: string;
  heroId?: string;
  playstyle?: Playstyle;
}

/** 推荐输出 */
export interface RecommendationResult {
  primaryFaction: string;
  /** 协同流派 id 列表 */
  synergyFactions: string[];
  recommendedSkills: Skill[];
  recommendedTreasures: Treasure[];
  /** 推荐理由（人类可读） */
  notes: string[];
}

/** 品阶权重：传奇 > 稀有 > 普通，用于稳定排序 */
const TIER_WEIGHT: Record<SkillTier, number> = {
  legendary: 3,
  rare: 2,
  normal: 1,
};

/** 构筑技能总数上限（与模拟器一致） */
const MAX_SKILLS = 10;

/** 主流派 -> 适配宝物 id（缺省取经济向 tr-gold-coin） */
const FACTION_TREASURE: Record<string, string> = {
  poison: "tr-venom-fang",
  frost: "tr-frozen-heart",
  ultimate: "tr-arcane-orb",
  shield: "tr-aegis-shield",
  crit: "tr-crit-eye",
  dodge: "tr-shadow-cloak",
  "normal-attack": "tr-bloodthirst-blade",
};

/**
 * 按品阶降序稳定排序（传奇 -> 稀有 -> 普通，同品阶保持原序）。
 */
function sortByTierDesc(skills: Skill[]): Skill[] {
  return [...skills].sort(
    (a, b) => TIER_WEIGHT[b.tier] - TIER_WEIGHT[a.tier]
  );
}

/** 取流派名（缺失回退 id） */
function factionName(factionId: string): string {
  return getFactionById(factionId)?.name ?? factionId;
}

/**
 * 生成推荐构筑。
 *
 * - 进攻型：主流派取 6 个，集中升星；
 * - 防守型 / 经济型 / 默认：主流派取 4 个，技能精简；
 * - 协同流派各取前 2 个（同品阶优先高阶）；
 * - 总数不超过 MAX_SKILLS；
 * - 宝物按主流派映射，经济型额外加入黄金硬币。
 */
export function recommend(input: RecommendInput): RecommendationResult {
  const { primaryFaction, heroId, playstyle } = input;

  const faction = getFactionById(primaryFaction);
  const synergyFactions = faction?.synergy ?? [];
  const candidateFactions = [primaryFaction, ...synergyFactions];

  const primaryCount = playstyle === "aggressive" ? 6 : 4;
  const synergyCount = 2;

  const recommendedSkills: Skill[] = [];
  for (const factionId of candidateFactions) {
    const factionSkills = getSkillsByFaction(factionId);
    if (factionSkills.length === 0) continue;
    const sorted = sortByTierDesc(factionSkills);
    const limit = factionId === primaryFaction ? primaryCount : synergyCount;
    recommendedSkills.push(...sorted.slice(0, limit));
    if (recommendedSkills.length >= MAX_SKILLS) break;
  }
  const capped = recommendedSkills.slice(0, MAX_SKILLS);

  // 宝物：经济型先加黄金硬币，再加入主流派适配宝物（去重）
  const recommendedTreasures: Treasure[] = [];
  if (playstyle === "economic") {
    const goldCoin = getTreasureById("tr-gold-coin");
    if (goldCoin) recommendedTreasures.push(goldCoin);
  }
  const treasureId = FACTION_TREASURE[primaryFaction] ?? "tr-gold-coin";
  const mainTreasure = getTreasureById(treasureId);
  if (
    mainTreasure &&
    !recommendedTreasures.some((t) => t.id === mainTreasure.id)
  ) {
    recommendedTreasures.push(mainTreasure);
  }
  if (recommendedTreasures.length === 0) {
    const fallback = getTreasures()[0];
    if (fallback) recommendedTreasures.push(fallback);
  }

  // 推荐理由
  const notes: string[] = [];
  const primaryPicked = capped.filter(
    (s) => s.faction === primaryFaction
  ).length;
  notes.push(
    `以「${factionName(primaryFaction)}」为主流派：同流派技能学满 2/4/6/8 个依次升 1~4 星，等级 = 1 + 全流派星级之和。`
  );
  if (primaryPicked > 0) {
    const starTarget = Math.min(4, Math.floor(primaryPicked / 2));
    notes.push(
      `主流派选 ${primaryPicked} 个技能（传奇 > 稀有 > 普通），目标达成 ${starTarget} 星。`
    );
  } else {
    notes.push(
      `主流派「${factionName(primaryFaction)}」暂无技能数据，改从协同流派选技作为升星素材。`
    );
  }
  if (synergyFactions.length > 0) {
    notes.push(
      `协同流派：${synergyFactions
        .map((id) => factionName(id))
        .join("、")}，每个取前 ${synergyCount} 个联动升星。`
    );
  } else {
    notes.push("该流派暂无协同关系记录，仅推荐主流派技能。");
  }
  notes.push(
    `推荐宝物：${recommendedTreasures
      .map((t) => t.name)
      .join("、")}（${playstyle === "economic" ? "经济向优先" : "适配主流派"}）。`
  );
  if (playstyle === "aggressive") {
    notes.push("进攻型：主流派技能数加码，快速升星抢占爆发。");
  } else if (playstyle === "defensive") {
    notes.push("防守型：技能精简保留金币，搭配生存/护盾向宝物。");
  } else if (playstyle === "economic") {
    notes.push("经济型：黄金硬币滚雪球，技能精简以控成本。");
  }
  if (heroId) {
    const hero = getHeroById(heroId);
    if (hero) {
      notes.push(
        `适配英雄「${hero.name}」：倾向 ${hero.factions
          .map((id) => factionName(id))
          .join("/")}${
          hero.banFactions && hero.banFactions.length > 0
            ? `，禁用 ${hero.banFactions.map((id) => factionName(id)).join("/")}`
            : ""
        }。`
      );
    }
  }

  return {
    primaryFaction,
    synergyFactions,
    recommendedSkills: capped,
    recommendedTreasures,
    notes,
  };
}
