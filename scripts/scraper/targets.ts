/**
 * 目标源配置
 *
 * 游戏无官方结构化数据库，英雄/技能数据散落在第三方散文式攻略页。
 * 下面 4 个源为已调研确认的有效来源，覆盖英雄图鉴、禁用规则、评级与机制数值。
 */

export type TargetKind = "hero-roster" | "mechanics";

export interface Target {
  /** 短 id，用于文件名与报告 */
  id: string;
  url: string;
  kind: TargetKind;
  /** 调研备注 */
  note?: string;
}

export const targets: Target[] = [
  {
    id: "233leyuan-heroes",
    url: "https://www.233leyuan.com/post-detail/2058845777266425856",
    kind: "hero-roster",
    note: "233乐园英雄图鉴，最结构化，6 英雄含天赋+大招+数值",
  },
  {
    id: "pp-news-heroes",
    url: "https://wap.pp.cn/news/1148593.html",
    kind: "hero-roster",
    note: "PP助手 8 英雄，禁用规则清晰",
  },
  {
    id: "9game-tier-list",
    url: "https://www.9game.cn/news/6713841.html",
    kind: "hero-roster",
    note: "九游全英雄特性，评级定性（T0=山丘/艾瑞达巫师）",
  },
  {
    id: "bilibili-mechanics",
    url: "http://www.bilibili.com/read/cv39823932/",
    kind: "mechanics",
    note: "B站 steam 基础篇，机制数值：升星 8/16/24/40→25/50/75%，品阶 100/200/300 金币",
  },
];
