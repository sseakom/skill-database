/**
 * HTTP 抓取
 *
 * - Node 内置 fetch + 自定义 UA
 * - 超时 15s（AbortController）
 * - 失败重试 2 次（共 3 次尝试）
 * - 每源间隔 1-2s 限流（礼貌抓取）
 * - cheerio 去除 script/style/nav/header/footer/iframe 等，提取正文文本
 *   优先 article / main，退化取 body，保留段落换行
 */

import { load } from "cheerio";
import type { Target } from "./targets";

export interface FetchResult {
  url: string;
  targetId: string;
  ok: boolean;
  status?: number;
  text?: string;
  error?: string;
  durationMs: number;
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 skill-database-scraper/1.0";

const TIMEOUT_MS = 15000;
const MAX_ATTEMPTS = 3; // 1 + 2 重试

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export async function fetchOne(target: Target): Promise<FetchResult> {
  const start = Date.now();
  let lastErr: string | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(target.url, {
        signal: controller.signal,
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        },
        redirect: "follow",
      });
      clearTimeout(timer);

      if (!res.ok) {
        lastErr = `HTTP ${res.status} ${res.statusText}`;
        if (attempt < MAX_ATTEMPTS) {
          await sleep(rand(1000, 2000));
          continue;
        }
        return {
          url: target.url,
          targetId: target.id,
          ok: false,
          status: res.status,
          error: lastErr,
          durationMs: Date.now() - start,
        };
      }

      const html = await res.text();
      const text = extractText(html);
      if (!text || text.trim().length < 50) {
        lastErr = "正文为空或过短（可能是 JS 渲染或被拦截）";
        if (attempt < MAX_ATTEMPTS) {
          await sleep(rand(1000, 2000));
          continue;
        }
        return {
          url: target.url,
          targetId: target.id,
          ok: false,
          status: res.status,
          error: lastErr,
          durationMs: Date.now() - start,
        };
      }

      return {
        url: target.url,
        targetId: target.id,
        ok: true,
        status: res.status,
        text,
        durationMs: Date.now() - start,
      };
    } catch (e: unknown) {
      clearTimeout(timer);
      const msg =
        e instanceof Error
          ? e.name === "AbortError"
            ? `超时(${TIMEOUT_MS}ms)`
            : e.message
          : String(e);
      lastErr = msg;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(rand(1000, 2000));
        continue;
      }
    }
  }

  return {
    url: target.url,
    targetId: target.id,
    ok: false,
    error: lastErr ?? "未知错误",
    durationMs: Date.now() - start,
  };
}

export async function fetchAll(
  list: Target[],
  onResult?: (r: FetchResult) => void,
): Promise<FetchResult[]> {
  const results: FetchResult[] = [];
  for (let i = 0; i < list.length; i++) {
    if (i > 0) await sleep(rand(1000, 2000)); // 源间限流
    const r = await fetchOne(list[i]);
    results.push(r);
    onResult?.(r);
  }
  return results;
}

/** 从 HTML 提取正文文本，保留段落换行 */
function extractText(html: string): string {
  const $ = load(html);
  $(
    "script,style,noscript,nav,header,footer,iframe,aside,form,svg,button,select",
  ).remove();

  let $main = $("article").first();
  if (!$main.length) $main = $("main").first();
  if (!$main.length) $main = $("body").first();
  if (!$main.length) $main = $.root() as unknown as typeof $main;

  const blockTags =
    "p,div,li,h1,h2,h3,h4,h5,h6,section,article,header,footer,nav,aside,td,th,tr,blockquote,br,ul,ol";
  $main.find(blockTags).each((_, el) => {
    $(el).append("\n");
  });

  let text = $main.text();
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}
