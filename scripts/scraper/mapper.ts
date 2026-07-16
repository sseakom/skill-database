/**
 * LLM 输出 → Hero 草稿映射
 *
 * - 合并多源提取结果，按英雄名去重（后者补充前者 null 字段）
 * - 强制 verified: false
 * - 缺失字段填 null / 空数组（草稿供人工校对，null 即"未知"信号）
 *
 * 注意：输出类型为 HeroDraft（Hero 的可空放宽版本），而非严格 Hero。
 * 因为草稿阶段大量字段未知需用 null 表示，而严格 Hero 的 baseStats 等字段
 * 不允许 null。草稿写入 JSON 供人工校对，校对通过后再手写为严格 Hero 入 src/data。
 */

import type { BaseStats, DamageType, HeroTier } from "@/lib/types";
import type { ExtractionResult } from "./llm-extractor";

export interface HeroDraft {
  id: string;
  name: string;
  title: string | null;
  factions: string[];
  passive: { name: string | null; description: string | null } | null;
  ultimate: {
    name: string | null;
    description: string | null;
    damageType: DamageType | null;
  } | null;
  baseStats: Partial<BaseStats> | null;
  banFactions: string[] | null;
  tier: HeroTier | null;
  description: string | null;
  sourceUrl: string | null;
  verified: false;
}

const TIER_VALUES = new Set(["T0", "T1", "T2", "T3"]);
const DAMAGE_VALUES = new Set(["physical", "magical", "pure", "mixed"]);
const NUMERIC_KEYS = [
  "hp",
  "attack",
  "attackSpeed",
  "energy",
  "dodge",
  "crit",
  "critDamage",
] as const;

function slugify(name: string): string {
  return (
    "draft-" +
    name
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
  );
}

function asString(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim() !== "")
    .map((s) => s.trim());
}

function asTier(v: unknown): HeroTier | null {
  const s = typeof v === "string" ? v.toUpperCase() : "";
  return TIER_VALUES.has(s) ? (s as HeroTier) : null;
}

function asDamage(v: unknown): DamageType | null {
  return typeof v === "string" && DAMAGE_VALUES.has(v)
    ? (v as DamageType)
    : null;
}

function asAbility(
  v: unknown,
): { name: string | null; description: string | null } | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const name = asString(o.name);
  const description = asString(o.description);
  if (!name && !description) return null;
  return { name, description };
}

function asBaseStats(v: unknown): Partial<BaseStats> | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const stats: Partial<BaseStats> = {};
  for (const key of NUMERIC_KEYS) {
    const val = o[key];
    if (typeof val === "number" && Number.isFinite(val)) {
      (stats as Record<string, number>)[key] = val;
    }
  }
  return Object.keys(stats).length ? stats : null;
}

interface NormalizedDraft {
  name: string | null;
  title: string | null;
  factions: string[];
  passive: { name: string | null; description: string | null } | null;
  ultimate: {
    name: string | null;
    description: string | null;
    damageType: DamageType | null;
  } | null;
  baseStats: Partial<BaseStats> | null;
  banFactions: string[];
  tier: HeroTier | null;
  description: string | null;
  sourceUrl: string | null;
}

function normalizeRaw(
  raw: Record<string, unknown> | null,
  fallback: ExtractionResult,
): NormalizedDraft {
  if (raw) {
    const ultimate = (() => {
      if (!raw.ultimate || typeof raw.ultimate !== "object") return null;
      const o = raw.ultimate as Record<string, unknown>;
      const ab = asAbility(o);
      const dt = asDamage(o.damageType);
      if (!ab && !dt) return null;
      return {
        name: ab?.name ?? null,
        description: ab?.description ?? null,
        damageType: dt,
      };
    })();
    return {
      name: asString(raw.name) ?? fallback.hero ?? null,
      title: asString(raw.title),
      factions: asStringArray(raw.factions),
      passive: asAbility(raw.passive),
      ultimate,
      baseStats: asBaseStats(raw.baseStats),
      banFactions: asStringArray(raw.banFactions),
      tier: asTier(raw.tier),
      description: asString(raw.description),
      sourceUrl: asString(raw.sourceUrl) ?? fallback.sourceUrl,
    };
  }
  // 降级：仅文本草稿
  return {
    name: fallback.hero ?? null,
    title: null,
    factions: [],
    passive: null,
    ultimate: null,
    baseStats: null,
    banFactions: [],
    tier: null,
    description: fallback.text.slice(0, 300) || null,
    sourceUrl: fallback.sourceUrl,
  };
}

export function mapToHeroes(results: ExtractionResult[]): HeroDraft[] {
  const byName = new Map<string, NormalizedDraft>();

  for (const r of results) {
    const n = normalizeRaw(r.raw, r);
    if (!n.name) continue; // 无英雄名（mechanics 段）不产 Hero
    const existing = byName.get(n.name);
    if (!existing) {
      byName.set(n.name, n);
      continue;
    }
    // 后者补充前者 null 字段
    existing.title = existing.title ?? n.title;
    existing.factions = Array.from(
      new Set([...existing.factions, ...n.factions]),
    );
    existing.passive = existing.passive ?? n.passive;
    existing.ultimate = existing.ultimate ?? n.ultimate;
    existing.baseStats = existing.baseStats ?? n.baseStats;
    existing.banFactions = Array.from(
      new Set([...existing.banFactions, ...n.banFactions]),
    );
    existing.tier = existing.tier ?? n.tier;
    existing.description = existing.description ?? n.description;
    existing.sourceUrl = existing.sourceUrl ?? n.sourceUrl;
  }

  const drafts: HeroDraft[] = [];
  for (const [name, n] of byName) {
    drafts.push({
      id: slugify(name),
      name,
      title: n.title,
      factions: n.factions,
      passive: n.passive,
      ultimate: n.ultimate,
      baseStats: n.baseStats,
      banFactions: n.banFactions.length ? n.banFactions : null,
      tier: n.tier,
      description: n.description,
      sourceUrl: n.sourceUrl,
      verified: false,
    });
  }
  return drafts;
}
