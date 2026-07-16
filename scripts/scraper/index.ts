/**
 * 爬虫 CLI 入口
 *
 * 流程：targets → fetch → segment →（有 OPENAI_API_KEY 则 LLM 提取，否则降级）→ map
 * → 写 draft/heroes-draft.json + draft/segments/*.txt + draft/run-report.json
 *
 * 用法：npx tsx scripts/scraper/index.ts
 */

import { fileURLToPath } from "node:url";
import path from "node:path";
import { promises as fs } from "node:fs";

import { targets } from "./targets";
import { fetchAll, type FetchResult } from "./fetcher";
import { segmentText, type Segment } from "./segmenter";
import {
  extractSegments,
  getLlmConfig,
  type ExtractionResult,
} from "./llm-extractor";
import { mapToHeroes } from "./mapper";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRAFT_DIR = path.join(__dirname, "draft");
const SEGMENTS_DIR = path.join(DRAFT_DIR, "segments");

interface SourceReport {
  id: string;
  url: string;
  kind: string;
  status: "ok" | "failed";
  error?: string;
  httpStatus?: number;
  durationMs: number;
  segmentCount: number;
  heroCount: number;
}

interface RunReport {
  startedAt: string;
  finishedAt: string;
  totalDurationMs: number;
  llmEnabled: boolean;
  degraded: boolean;
  sources: SourceReport[];
  totalSegments: number;
  totalHeroes: number;
  draftPath: string;
  segmentsDir: string;
}

function sanitizeFilename(s: string): string {
  return s.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "") || "x";
}

async function writeSegments(segments: Segment[]): Promise<void> {
  await fs.mkdir(SEGMENTS_DIR, { recursive: true });
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    const hero = s.hero ? sanitizeFilename(s.hero) : "mechanics";
    const file = path.join(
      SEGMENTS_DIR,
      `${hero}__${sanitizeFilename(s.sourceId)}__${String(i).padStart(3, "0")}.txt`,
    );
    const header =
      `# source: ${s.sourceUrl}\n` +
      `# sourceId: ${s.sourceId}\n` +
      `# hero: ${s.hero ?? "(mechanics)"}\n\n`;
    await fs.writeFile(file, header + s.text, "utf8");
  }
}

async function main(): Promise<void> {
  const startedAt = new Date();
  const t0 = Date.now();
  const llmConfig = getLlmConfig();

  console.log("=== 选技大乱斗 爬虫启动 ===");
  console.log(
    `目标源 ${targets.length} 个，LLM 模式：${llmConfig.enabled ? `开启 (${llmConfig.model})` : "关闭（将降级）"}`,
  );

  await fs.mkdir(DRAFT_DIR, { recursive: true });

  const fetchResults: FetchResult[] = await fetchAll(targets, (r) => {
    console.log(
      `  抓取 [${r.ok ? "ok" : "fail"}] ${r.targetId} ${r.durationMs}ms${r.error ? ` — ${r.error}` : ""}`,
    );
  });

  // 按抓取结果分段
  const segsBySource = new Map<string, Segment[]>();
  const allSegments: Segment[] = [];
  for (const fr of fetchResults) {
    const segs: Segment[] = [];
    if (fr.ok && fr.text) {
      segs.push(...segmentText(fr.text, fr.url, fr.targetId));
    }
    segsBySource.set(fr.targetId, segs);
    allSegments.push(...segs);
  }

  if (allSegments.length) {
    await writeSegments(allSegments);
    console.log(`切段完成：共 ${allSegments.length} 段 → ${SEGMENTS_DIR}`);
  } else {
    console.warn("未切出任何段落（所有源可能均抓取失败）。");
  }

  // LLM 提取（或降级）
  const extractions: ExtractionResult[] = await extractSegments(allSegments);

  // 映射为 Hero 草稿
  const heroes = mapToHeroes(extractions);

  // 写 heroes-draft.json
  const draftPath = path.join(DRAFT_DIR, "heroes-draft.json");
  await fs.writeFile(draftPath, JSON.stringify(heroes, null, 2), "utf8");

  // 组装 source 报告
  const sourceReports: SourceReport[] = targets.map((t) => {
    const fr = fetchResults.find((r) => r.targetId === t.id);
    const segs = segsBySource.get(t.id) ?? [];
    const heroSet = new Set<string>();
    for (const s of segs) if (s.hero) heroSet.add(s.hero);
    return {
      id: t.id,
      url: t.url,
      kind: t.kind,
      status: fr?.ok ? "ok" : "failed",
      error: fr?.error,
      httpStatus: fr?.status,
      durationMs: fr?.durationMs ?? 0,
      segmentCount: segs.length,
      heroCount: heroSet.size,
    };
  });

  const finishedAt = new Date();
  const report: RunReport = {
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    totalDurationMs: Date.now() - t0,
    llmEnabled: llmConfig.enabled,
    degraded: !llmConfig.enabled || extractions.some((e) => e.degraded),
    sources: sourceReports,
    totalSegments: allSegments.length,
    totalHeroes: heroes.length,
    draftPath,
    segmentsDir: SEGMENTS_DIR,
  };
  await fs.writeFile(
    path.join(DRAFT_DIR, "run-report.json"),
    JSON.stringify(report, null, 2),
    "utf8",
  );

  // 总结
  console.log("\n=== 总结 ===");
  const okCount = sourceReports.filter((s) => s.status === "ok").length;
  console.log(`抓取：${okCount}/${sourceReports.length} 源成功`);
  for (const s of sourceReports) {
    console.log(
      `  - [${s.status}] ${s.id} | ${s.durationMs}ms | 段=${s.segmentCount} 英雄=${s.heroCount}${s.error ? ` | ${s.error}` : ""}`,
    );
  }
  console.log(`切段：${allSegments.length} 段`);
  console.log(
    `LLM：${llmConfig.enabled ? "已提取" : "降级（仅文本草稿）"}${llmConfig.enabled && report.degraded ? "（部分段降级）" : ""}`,
  );
  console.log(`Hero 草稿：${heroes.length} 个`);
  console.log(`草稿文件：${draftPath}`);
  console.log(`原文段目录：${SEGMENTS_DIR}`);
  console.log(`运行报告：${path.join(DRAFT_DIR, "run-report.json")}`);
  if (heroes.length) {
    console.log("英雄列表：" + heroes.map((h) => h.name).join("、"));
  }
}

main().catch((e) => {
  console.error("爬虫异常退出：", e);
  process.exit(1);
});
