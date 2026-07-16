/**
 * 正文按英雄切段
 *
 * 维护已知英雄名词表（种子数据 name + 调研发现的额外英雄名），
 * 在正文中定位英雄名出现位置，按位置切段，每段关联一个英雄名；
 * 无英雄名的段落归为 mechanics 段（hero: undefined）。
 */

import { heroes } from "@/data/heroes";

/** 调研发现的额外英雄名（种子数据未覆盖） */
const EXTRA_HERO_NAMES = [
  "战歌酋长",
  "守望者",
  "剑圣",
  "山丘之王",
  "熊猫酒仙",
  "神秘法师",
  "牛头",
  "麦迪文",
  "白虎",
  "冰魂",
  "玛雅影之歌",
  "影舞者",
  "法斯祺",
  "亡灵术士",
  "圣骑士",
  "骸骨鸦医",
  "焚血炎龙",
  "娜迦海妖",
  "赤刃修罗",
  "剧毒巫师",
  "企鹅船长",
  "复仇天神",
  "先锋士兵",
  "炼金术师",
];

/** 已知英雄名词表（去重；按长度降序便于优先匹配长名） */
export const knownHeroNames: string[] = Array.from(
  new Set([...heroes.map((h) => h.name), ...EXTRA_HERO_NAMES]),
).sort((a, b) => b.length - a.length);

export interface Segment {
  /** 关联的英雄名；undefined 表示 mechanics 段（机制说明，无英雄归属） */
  hero?: string;
  text: string;
  sourceUrl: string;
  sourceId: string;
}

/**
 * 把一篇正文按英雄名出现位置切段。
 * 算法：收集所有英雄名的出现位置 → 按 (index asc, name 长度 desc) 排序 →
 * 顺序遍历，文本游标前的内容归属于"上一个英雄"，命中英雄名时切换归属。
 * 重叠命中（落在上一个名跨度内）跳过，避免短名误拆长名。
 */
export function segmentText(
  text: string,
  sourceUrl: string,
  sourceId: string,
  names: string[] = knownHeroNames,
): Segment[] {
  const matches: { name: string; index: number }[] = [];
  for (const name of names) {
    let from = 0;
    while (true) {
      const idx = text.indexOf(name, from);
      if (idx === -1) break;
      matches.push({ name, index: idx });
      from = idx + name.length;
    }
  }
  matches.sort(
    (a, b) => a.index - b.index || b.name.length - a.name.length,
  );

  // 去除重叠：落在已保留名跨度内的命中跳过
  const dedup: { name: string; index: number }[] = [];
  let coveredUntil = -1;
  for (const m of matches) {
    if (m.index < coveredUntil) continue;
    dedup.push(m);
    coveredUntil = m.index + m.name.length;
  }

  const segments: Segment[] = [];
  let cursor = 0;
  let currentHero: string | undefined;

  for (const m of dedup) {
    const before = text.slice(cursor, m.index);
    if (before.trim()) {
      segments.push({
        hero: currentHero,
        text: before.trim(),
        sourceUrl,
        sourceId,
      });
    }
    cursor = m.index;
    currentHero = m.name;
  }
  const tail = text.slice(cursor);
  if (tail.trim()) {
    segments.push({
      hero: currentHero,
      text: tail.trim(),
      sourceUrl,
      sourceId,
    });
  }

  // 合并相邻同 hero 段
  const merged: Segment[] = [];
  for (const s of segments) {
    const last = merged[merged.length - 1];
    if (last && last.hero === s.hero) {
      last.text += "\n\n" + s.text;
    } else {
      merged.push({ ...s });
    }
  }
  return merged;
}
