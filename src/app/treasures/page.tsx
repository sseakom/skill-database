"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getTreasures } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/codex/search-input";
import { EmptyState } from "@/components/codex/empty";
import { VerifiedMark } from "@/components/codex/verified-mark";
import { cn } from "@/lib/utils";

export default function TreasuresPage() {
  const treasures = getTreasures();
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return treasures;
    return treasures.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.effect.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [treasures, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">宝物图鉴</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {treasures.length} 件遗物 · 第 1/4/9 局三选一
        </p>
      </header>

      <div className="mb-6">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="按名称或效果搜索…"
          className="max-w-md"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => {
            const isOpen = expanded === t.id;
            return (
              <Card key={t.id} className="flex h-full flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    {t.verified === false && <VerifiedMark />}
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-2 text-sm">
                  <p>{t.effect}</p>
                  {isOpen && (
                    <p className="text-muted-foreground">{t.description}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : t.id)}
                    className="mt-auto inline-flex w-fit items-center gap-1 pt-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {isOpen ? "收起" : "展开说明"}
                    <ChevronDown
                      className={cn(
                        "size-3.5 transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
