"use client";

import { useMemo, useRef, useState } from "react";
import { getFactions } from "@/lib/data";
import type { Faction } from "@/lib/types";
import { CounterGraph } from "@/components/chart/counter-graph";
import { FactionBadge } from "@/components/faction-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CounterChartPage() {
  const factions = useMemo(() => getFactions(), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const selected = selectedId
    ? factions.find((f) => f.id === selectedId)
    : undefined;

  // 入边源（真正克制选中流派的列表），从 counters[] 推导以与图谱保持一致
  const inCounterIds = useMemo(() => {
    if (!selectedId) return [] as string[];
    return factions
      .filter((f) => f.counters.includes(selectedId))
      .map((f) => f.id);
  }, [factions, selectedId]);

  function handleSelect(id: string) {
    setSelectedId(id);
    // 点击节点后温和滚动到下方信息面板（仅在不可见时滚动）
    requestAnimationFrame(() => {
      infoRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          流派克制图谱
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          13 大流派的有向克制关系。箭头 A → B 表示 A 克制 B。点击节点高亮其克制（红）与被克（橙）关系，并查看详情。
        </p>
      </header>

      {/* 图谱（正方形响应式；小屏给最小宽度 + 横向滚动，保证节点文字可读） */}
      <div className="mx-auto w-full max-w-[640px] overflow-x-auto">
        <div className="aspect-square min-w-[480px]">
          <CounterGraph
            factions={factions}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>
      </div>

      {/* 图例 */}
      <div className="mx-auto mt-4 flex max-w-[640px] flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <LegendSwatch color="#ef4444" label="克制（出边）" />
        <LegendSwatch color="#f97316" label="被克（入边）" />
        <span className="inline-flex items-center gap-1">
          <ArrowGlyph />
          箭头方向 = 克制方向
        </span>
        <span>点击节点查看详情</span>
      </div>

      {/* 信息面板 */}
      <div ref={infoRef} className="mt-6 scroll-mt-20">
        {selected ? (
          <InfoPanel
            faction={selected}
            inCounterIds={inCounterIds}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            点击上方节点查看克制关系
          </div>
        )}
      </div>
    </main>
  );
}

/** 图例色块 */
function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-0.5 w-4 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

/** 图例里的迷你箭头 */
function ArrowGlyph() {
  return (
    <svg width="20" height="10" viewBox="0 0 20 10" aria-hidden="true">
      <path
        d="M1 5 H16"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M14 1 L19 5 L14 9 z" fill="currentColor" />
    </svg>
  );
}

/** 关系行：标签 + 一组流派徽章 */
function RelationRow({
  label,
  items,
  variant,
}: {
  label: string;
  items: string[];
  variant: "destructive" | "accent" | "primary";
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={variant}>{label}</Badge>
      <div className="flex flex-wrap gap-1.5">
        {items.length > 0 ? (
          items.map((id) => <FactionBadge key={id} factionId={id} />)
        ) : (
          <span className="text-xs text-muted-foreground">无</span>
        )}
      </div>
    </div>
  );
}

function InfoPanel({
  faction,
  inCounterIds,
}: {
  faction: Faction;
  inCounterIds: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span
            className="size-4 shrink-0 rounded-full"
            style={{ backgroundColor: faction.color ?? "#888888" }}
          />
          <CardTitle className="text-lg">{faction.name}</CardTitle>
          {faction.verified === false && (
            <Badge variant="outline">数据待校对</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{faction.description}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* 优势 / 劣势 */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-400">
              优势
            </h4>
            <ul className="space-y-1 text-sm">
              {faction.strengths.map((s) => (
                <li key={s} className="flex gap-1.5">
                  <span className="text-emerald-500">+</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-red-400">
              劣势
            </h4>
            <ul className="space-y-1 text-sm">
              {faction.weaknesses.map((s) => (
                <li key={s} className="flex gap-1.5">
                  <span className="text-red-500">−</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 克制关系徽章 */}
        <div className="space-y-2 border-t border-border pt-4">
          <RelationRow
            label="克制"
            items={faction.counters}
            variant="destructive"
          />
          <RelationRow
            label="被克"
            items={inCounterIds}
            variant="accent"
          />
          <RelationRow
            label="协同"
            items={faction.synergy}
            variant="primary"
          />
        </div>
      </CardContent>
    </Card>
  );
}
