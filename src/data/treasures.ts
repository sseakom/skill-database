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
  // ===== 生命流（损血增益）=====
  {
    id: "tr-ruby-heart",
    name: "红宝石心脏",
    effect: "血量上限提升，损血时获得攻击力加成。",
    description: "生命流核心宝物，血量即战力。",
    verified: false,
  },
  {
    id: "tr-berserker-mark",
    name: "狂战士印记",
    effect: "生命值越低，攻速与攻击力越高。",
    description: "生命流残血宝物，配合损血增益。",
    verified: false,
  },
  // ===== 回复流（续航/解毒）=====
  {
    id: "tr-life-well",
    name: "生命之泉",
    effect: "回复量提升，每回合额外回复生命。",
    description: "回复流核心宝物，续航利器。",
    verified: false,
  },
  {
    id: "tr-purify-chalice",
    name: "解毒圣杯",
    effect: "受击概率解毒，回复时清除中毒层数。",
    description: "回复流克毒宝物，克制中毒流。",
    verified: false,
  },
  // ===== 易伤流（触发增伤）=====
  {
    id: "tr-weakness-mark",
    name: "弱点印记",
    effect: "攻击施加易伤标记，触发时增伤。",
    description: "易伤流核心宝物，增伤放大器。",
    verified: false,
  },
  {
    id: "tr-sear-heart",
    name: "灼烧之心",
    effect: "易伤目标受到暴击时附加额外伤害。",
    description: "易伤流协同宝物，配合暴击流。",
    verified: false,
  },
  // ===== 精灵流（召唤强化）=====
  {
    id: "tr-summon-totem",
    name: "召唤图腾",
    effect: "召唤物攻击力与血量提升。",
    description: "精灵流核心宝物，随从强化。",
    verified: false,
  },
  {
    id: "tr-spirit-crown",
    name: "精灵王冠",
    effect: "召唤上限提升，每回合额外召唤一只精灵。",
    description: "精灵流规模宝物，成型质变。",
    verified: false,
  },
  // ===== 怒气流（资源爆发）=====
  {
    id: "tr-fury-drum",
    name: "怒气战鼓",
    effect: "受击与攻击额外回复怒气。",
    description: "怒气流核心宝物，资源加速器。",
    verified: false,
  },
  {
    id: "tr-rage-axe",
    name: "狂怒之斧",
    effect: "怒气技能伤害提升，破盾效果增强。",
    description: "怒气流爆发宝物，克制护盾流。",
    verified: false,
  },
  // ===== 现有流派第二件 =====
  {
    id: "tr-gale-blade",
    name: "疾风之刃",
    effect: "攻速提升，普攻概率连击。",
    description: "普攻流攻速宝物，连击利器。",
    verified: false,
  },
  {
    id: "tr-fury-edge",
    name: "暴怒之刃",
    effect: "爆伤提升，暴击附带额外真实伤害。",
    description: "暴击流爆伤宝物，配合鹰眼。",
    verified: false,
  },
  {
    id: "tr-wind-whisper",
    name: "风之轻语",
    effect: "闪避反击伤害提升，闪避后短暂攻速加成。",
    description: "闪避流反击宝物，强化反击。",
    verified: false,
  },
  {
    id: "tr-scorpion-tail",
    name: "蝎尾",
    effect: "中毒层数上限提升，中毒目标降攻速。",
    description: "中毒流叠层宝物，控伤兼备。",
    verified: false,
  },
  {
    id: "tr-snow-robe",
    name: "雪域法袍",
    effect: "冰冻概率提升，冰冻目标受额外伤害。",
    description: "冰冻流强化宝物，控场加深。",
    verified: false,
  },
  {
    id: "tr-void-codex",
    name: "虚空法典",
    effect: "大招伤害提升，大招击杀返还冷却。",
    description: "大招流伤害宝物，质量放大。",
    verified: false,
  },
  {
    id: "tr-divine-bulwark",
    name: "神圣壁垒",
    effect: "护盾量提升，护盾存在时减伤。",
    description: "护盾流减伤宝物，容错叠加。",
    verified: false,
  },
  // ===== 通用功能宝物 =====
  {
    id: "tr-wisdom-tome",
    name: "智慧之书",
    effect: "技能经验获取加成，每回合额外经验。",
    description: "通用升级宝物，加速成型。",
    verified: false,
  },
  {
    id: "tr-phoenix-plume",
    name: "凤凰羽翼",
    effect: "首次阵亡后复活一次，恢复部分血量。",
    description: "通用复活宝物，容错保险。",
    verified: false,
  },
  {
    id: "tr-thorn-armor",
    name: "荆棘之甲",
    effect: "受击反弹物理伤害，反伤比例提升。",
    description: "通用反伤宝物，克制普攻流。",
    verified: false,
  },
  {
    id: "tr-pierce-spear",
    name: "破甲之矛",
    effect: "攻击附带护甲穿透，无视部分减伤。",
    description: "通用穿透宝物，克制护盾流。",
    verified: false,
  },
  {
    id: "tr-freedom-wing",
    name: "自由之翼",
    effect: "受控时间缩短，免疫首次冰冻。",
    description: "通用减控宝物，克制冰冻流。",
    verified: false,
  },
];
