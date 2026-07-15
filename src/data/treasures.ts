import type { Treasure } from "@/lib/types";

/**
 * 宝物（遗物）种子数据，第 1/4/9 局三选一
 * verified=false 表示待官方校对。
 */
export const treasures: Treasure[] = [
  {
    id: "tr-gold-coin",
    name: "黄金硬币",
    effect: "每回合额外获得 50 金币利息。",
    description: "经济向宝物，滚雪球核心，配合守财奴。",
    verified: false,
  },
  {
    id: "tr-bloodthirst-blade",
    name: "嗜血之刃",
    effect: "攻击附带吸血，普攻与暴击触发。",
    description: "续航向宝物，适合普攻/暴击流。",
    verified: false,
  },
  {
    id: "tr-frozen-heart",
    name: "冰霜之心",
    effect: "受击冰冻攻击者，降其攻速。",
    description: "控场向宝物，克制普攻流。",
    verified: false,
  },
  {
    id: "tr-venom-fang",
    name: "毒牙",
    effect: "攻击附加中毒层数。",
    description: "中毒流核心宝物，叠层利器。",
    verified: false,
  },
  {
    id: "tr-arcane-orb",
    name: "奥术之球",
    effect: "回蓝提升，大招冷却缩短。",
    description: "大招流核心宝物，提升大招质量。",
    verified: false,
  },
  {
    id: "tr-aegis-shield",
    name: "永恒之盾",
    effect: "生成可叠加护盾，减伤提升。",
    description: "护盾流核心宝物，容错利器。",
    verified: false,
  },
  {
    id: "tr-crit-eye",
    name: "鹰眼",
    effect: "暴击率与爆伤提升，暴击触发额外伤害。",
    description: "暴击流核心宝物。",
    verified: false,
  },
  {
    id: "tr-shadow-cloak",
    name: "暗影披风",
    effect: "闪避率提升，闪避后反击。",
    description: "闪避流核心宝物，后期质变。",
    verified: false,
  },
];
