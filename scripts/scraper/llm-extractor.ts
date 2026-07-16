/**
 * LLM 提取
 *
 * 调 OpenAI 兼容 chat/completions 接口（默认指向 DeepSeek）。
 * - 环境变量：OPENAI_API_BASE（默认 https://api.deepseek.com/v1）、
 *   OPENAI_API_KEY（无则降级）、OPENAI_MODEL（默认 deepseek-chat）
 * - System prompt 说明任务 + Hero schema 字段
 * - 要求模型只输出 ```json 代码块，用正则提取首个代码块解析
 *   （DeepSeek 默认不支持 response_format json mode，故用此法）
 * - 无 KEY 时降级：跳过 LLM，把切段文本作为草稿输出
 * - 单段 LLM 调用失败 try/catch 降级为该段的文本草稿，不中断整体流程
 * - API key 仅从环境变量读取，绝不硬编码
 */

import type { Segment } from "./segmenter";

export interface ExtractionResult {
  hero?: string;
  /** 解析出的 LLM JSON，null 表示降级/失败 */
  raw: Record<string, unknown> | null;
  /** 原始切段文本（降级时作为草稿内容） */
  text: string;
  sourceUrl: string;
  degraded: boolean;
  error?: string;
}

export interface LlmConfig {
  enabled: boolean;
  apiBase: string;
  apiKey: string;
  model: string;
}

const DEFAULT_API_BASE = "https://api.deepseek.com/v1";
const DEFAULT_MODEL = "deepseek-chat";

export function getLlmConfig(): LlmConfig {
  const apiKey = process.env.OPENAI_API_KEY ?? "";
  const apiBase = process.env.OPENAI_API_BASE || DEFAULT_API_BASE;
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  return { enabled: Boolean(apiKey), apiBase, apiKey, model };
}

const SYSTEM_PROMPT = `你是一个游戏数据抽取助手。游戏是《选技大乱斗》。
任务：阅读用户给出的散文式攻略片段，提取其中关于某个英雄的结构化数据，输出一个 JSON 对象。

JSON schema（字段说明）：
- name: 英雄名（字符串，必填；无法确定则 null）
- title: 头衔/定位（字符串或 null）
- passive: { name: 天赋名, description: 天赋描述 } 或 null
- ultimate: { name: 大招名, description: 大招描述, damageType: "physical"|"magical"|"pure"|"mixed" } 或 null
- factions: 流派 id 数组（如 summon/poison/frost/crit/dodge/ultimate/fury/shield/normal-attack 等），无则 []
- banFactions: 禁用流派 id 数组，无则 []
- tier: "T0"|"T1"|"T2"|"T3" 或 null
- baseStats: { hp, attack, attackSpeed, energy, dodge?, crit?, critDamage? }，数值未知填 null
- description: 一句话英雄定位总结（字符串或 null）
- sourceUrl: 来源 URL（由用户消息提供）
- verified: 恒为 false

规则：
1. 缺失字段一律填 null（数组填空 []）。
2. verified 恒为 false。
3. 只根据文本提取，绝不编造数值；数值未提及就填 null。
4. 输出只能是单个 \`\`\`json 代码块，不要任何其它解释文字。`;

export async function extractSegments(
  segments: Segment[],
): Promise<ExtractionResult[]> {
  const config = getLlmConfig();
  if (!config.enabled) {
    console.warn("[降级] 未配置 OPENAI_API_KEY，仅输出文本切段草稿。");
    return segments.map((s) => ({
      hero: s.hero,
      raw: null,
      text: s.text,
      sourceUrl: s.sourceUrl,
      degraded: true,
    }));
  }
  console.log(`[LLM] 模型 ${config.model}，共 ${segments.length} 段（仅对识别到英雄名的段调用）。`);

  const results: ExtractionResult[] = [];
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    // mechanics 段（未识别英雄名）不调 LLM，直接降级为文本
    if (!seg.hero) {
      results.push({
        hero: seg.hero,
        raw: null,
        text: seg.text,
        sourceUrl: seg.sourceUrl,
        degraded: true,
        error: "mechanics 段，跳过 LLM",
      });
      continue;
    }
    process.stdout.write(
      `[LLM] (${i + 1}/${segments.length}) ${seg.hero} ... `,
    );
    try {
      const raw = await callLlm(seg, config);
      if (raw) {
        console.log("ok");
      } else {
        console.log("空结果（降级为文本）");
      }
      results.push({
        hero: seg.hero,
        raw,
        text: seg.text,
        sourceUrl: seg.sourceUrl,
        degraded: false,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`失败→降级 (${msg})`);
      results.push({
        hero: seg.hero,
        raw: null,
        text: seg.text,
        sourceUrl: seg.sourceUrl,
        degraded: true,
        error: msg,
      });
    }
  }
  return results;
}

async function callLlm(
  seg: Segment,
  config: LlmConfig,
): Promise<Record<string, unknown> | null> {
  const userPrompt = `来源 URL: ${seg.sourceUrl}
关联英雄: ${seg.hero ?? "(未识别)"}

攻略原文：
"""
${seg.text}
"""

请按 schema 输出一个 JSON 代码块。`;

  const url = `${config.apiBase.replace(/\/$/, "")}/chat/completions`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`LLM HTTP ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data?.choices?.[0]?.message?.content ?? "";
    return parseJsonBlock(content);
  } finally {
    clearTimeout(timer);
  }
}

/** 从 LLM 输出中提取首个 ```json 代码块并解析；退化尝试整体 JSON */
export function parseJsonBlock(
  content: string,
): Record<string, unknown> | null {
  if (!content) return null;
  const fence = content.match(/```json\s*([\s\S]*?)```/i);
  const raw = fence ? fence[1] : content;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}
