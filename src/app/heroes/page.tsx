"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FACTION_COLOR_MAP,
  getFactions,
  getHeroes,
} from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/codex/search-input";
import { ChipFilter, type Chip } from "@/components/codex/chip-filter";
import { EmptyState } from "@/components/codex/empty";
import { HeroTierBadge } from "@/components/codex/tier-badge";
import { FactionBadge } from "@/components/faction-badge";

export default function HeroesPage() {
  const heroes = getHeroes();
  const factions = getFactions();

  const [query, setQuery] = useState("");
  const [faction, setFaction] = useState<string | null>(null);

  const chips: Chip[] = [
    { id: null, label: "全部" },
    ...factions.map((f) => ({
      id: f.id,
      label: f.name,
      color: FACTION_COLOR_MAP[f.id],
    })),
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return heroes.filter((h) => {
      if (faction && !h.factions.includes(faction)) return false;
      if (!q) return true;
      return (
        h.name.toLowerCase().includes(q) ||
        (h.title?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [heroes, query, faction]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">英雄图鉴</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {heroes.length} 位英雄 · 天赋 / 大招 / 属性 / 流派倾向
        </p>
      </header>

      <div className="mb-6 space-y-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="按名称或头衔搜索…"
          className="max-w-md"
        />
        <ChipFilter
          chips={chips}
          active={faction}
          onChange={setFaction}
          ariaLabel="流派筛选"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((h) => (
            <Link key={h.id} href={`/heroes/${h.id}`} className="block h-full">
              <Card className="h-full transition-colors hover:border-primary/60">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{h.name}</CardTitle>
                      {h.title && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {h.title}
                        </p>
                      )}
                    </div>
                    {h.tier && <HeroTierBadge tier={h.tier} />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex flex-wrap gap-1.5">
                    {h.factions.map((fid) => (
                      <FactionBadge
                        key={fid}
                        factionId={fid}
                        clickable={false}
                      />
                    ))}
                  </div>
                  <div className="space-y-1">
                    <p>
                      <span className="text-muted-foreground">天赋：</span>
                      {h.passive.name}
                    </p>
                    <p>
                      <span className="text-muted-foreground">大招：</span>
                      {h.ultimate.name}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
