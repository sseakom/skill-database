import type {
  Faction,
  Hero,
  Skill,
  Treasure,
  SkillTier,
} from "@/lib/types";
import { factions } from "@/data/factions";
import { heroes } from "@/data/heroes";
import { skills } from "@/data/skills";
import { treasures } from "@/data/treasures";

// ---- 列表访问 ----

/** counteredBy 由 counters 派生后必填的流派类型 */
export type FactionResolved = Omit<Faction, "counteredBy"> & {
  counteredBy: string[];
};

/**
 * 取流派列表。
 * counteredBy 由 counters 自动派生为严格镜像（单一数据源），
 * 避免 counters / counteredBy 两处手写导致不一致。
 */
export function getFactions(): FactionResolved[] {
  return factions.map((f) => ({
    ...f,
    counteredBy: factions
      .filter((g) => g.counters.includes(f.id))
      .map((g) => g.id),
  }));
}

/** 取原始 counters 镜像前的数据（如需） */
export function getFactionsRaw(): Faction[] {
  return factions;
}
export function getHeroes(): Hero[] {
  return heroes;
}
export function getSkills(): Skill[] {
  return skills;
}
export function getTreasures(): Treasure[] {
  return treasures;
}

// ---- 按 id 访问 ----
export function getFactionById(id: string): FactionResolved | undefined {
  return getFactions().find((f) => f.id === id);
}
export function getHeroById(id: string): Hero | undefined {
  return heroes.find((h) => h.id === id);
}
export function getSkillById(id: string): Skill | undefined {
  return skills.find((s) => s.id === id);
}
export function getTreasureById(id: string): Treasure | undefined {
  return treasures.find((t) => t.id === id);
}

// ---- 派生查询 ----

/** 取流派下的技能 */
export function getSkillsByFaction(factionId: string): Skill[] {
  return skills.filter((s) => s.faction === factionId);
}

/** 取倾向某流派的英雄 */
export function getHeroesByFaction(factionId: string): Hero[] {
  return heroes.filter((h) => h.factions.includes(factionId));
}

/** 取禁用某流派的英雄 */
export function getHeroesBanning(factionId: string): Hero[] {
  return heroes.filter((h) => h.banFactions?.includes(factionId));
}

/** 按品阶筛选技能 */
export function getSkillsByTier(tier: SkillTier): Skill[] {
  return skills.filter((s) => s.tier === tier);
}

/** 流派 id -> 名称映射，便于 UI 展示 */
export const FACTION_NAME_MAP: Record<string, string> = Object.fromEntries(
  factions.map((f) => [f.id, f.name])
);

/** 流派 id -> 主题色映射 */
export const FACTION_COLOR_MAP: Record<string, string> = Object.fromEntries(
  factions
    .filter((f) => f.color)
    .map((f) => [f.id, f.color as string])
);
