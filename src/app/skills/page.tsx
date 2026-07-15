"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Coins, Sparkles } from "lucide-react";
import { getFactions, getSkills } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/codex/search-input";
import { ChipFilter, type Chip } from "@/components/codex/chip-filter";
import { EmptyState } from "@/components/codex/empty";
import { SkillTierBadge } from "@/components/codex/tier-badge";
import { FactionBadge } from "@/components/faction-badge";

const TIER_CHIPS: Chip[] = [
  { id: null, label: "全部品阶" },
  { id: "normal", label: "普通" },
  { id: "rare", label: "稀有" },
  { id: "legendary", label: "传奇" },
];

export default function SkillsPage() {
  const skills = getSkills();
  const factions = getFactions();

  const [query, setQuery] = useState("");
  const [faction, setFaction] = useState<string | null>(null);
  const [tier, setTier] = useState<string | null>(null);

  const factionChips: Chip[] = [
    { id: null, label: "全部流派" },
    ...factions.map((f) => ({ id: f.id, label: f.name })),
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((s) => {
      if (faction && s.faction !== faction) return false;
      if (tier && s.tier !== tier) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.effect.toLowerCase().includes(q)
      );
    });
  }, [skills, query, faction, tier]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">技能图鉴</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {skills.length} 个技能 · 品阶 / 效果 / 升星加成
        </p>
      </header>

      <div className="mb-6 space-y-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="按名称或效果搜索…"
          className="max-w-md"
        />
        <ChipFilter
          chips={factionChips}
          active={faction}
          onChange={setFaction}
          ariaLabel="流派筛选"
        />
        <ChipFilter
          chips={TIER_CHIPS}
          active={tier}
          onChange={setTier}
          ariaLabel="品阶筛选"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/skills/${s.id}`}
              className="block h-full"
            >
              <Card className="h-full transition-colors hover:border-primary/60">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{s.name}</CardTitle>
                    <SkillTierBadge tier={s.tier} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <FactionBadge factionId={s.faction} clickable={false} />
                  <p className="text-muted-foreground">{s.effect}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Coins className="size-3.5" /> {s.cost} 金币
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Sparkles className="size-3.5" /> +{s.exp} 经验
                    </span>
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
