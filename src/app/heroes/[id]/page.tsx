import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronRight } from "lucide-react";
import {
  FACTION_NAME_MAP,
  getHeroById,
  getHeroes,
  getSkillsByFaction,
} from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FactionBadge } from "@/components/faction-badge";
import { HeroTierBadge, SkillTierBadge } from "@/components/codex/tier-badge";
import { DamageTypeBadge } from "@/components/codex/damage-type-badge";
import { StatBar } from "@/components/codex/stat-bar";
import { VerifiedMark } from "@/components/codex/verified-mark";

export function generateStaticParams() {
  return getHeroes().map((h) => ({ id: h.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const hero = getHeroById(id);
  if (!hero) return { title: "英雄不存在" };
  return {
    title: `${hero.name} · 英雄图鉴`,
    description: `${hero.name}${hero.title ? `（${hero.title}）` : ""}：${hero.description}`,
  };
}

export default async function HeroDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hero = getHeroById(id);
  if (!hero) notFound();

  const stats = hero.baseStats;

  // 相关技能：该英雄各流派下的技能（去重）
  const seen = new Set<string>();
  const relatedSkills = hero.factions
    .flatMap((fid) => getSkillsByFaction(fid))
    .filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/heroes" className="hover:text-foreground">
          英雄
        </Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">{hero.name}</span>
      </nav>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">{hero.name}</CardTitle>
              {hero.title && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {hero.title}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {hero.tier && <HeroTierBadge tier={hero.tier} />}
                {hero.verified === false && <VerifiedMark />}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {hero.description}
          </p>

          {/* 基础属性 */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">基础属性</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <StatBar label="生命" value={stats.hp} max={1500} />
              <StatBar label="攻击" value={stats.attack} max={120} />
              <StatBar
                label="攻速"
                value={stats.attackSpeed}
                max={1.5}
                display={stats.attackSpeed.toFixed(2)}
              />
              <StatBar label="回蓝" value={stats.energy} max={12} />
              {stats.dodge !== undefined && (
                <StatBar label="闪避" value={stats.dodge} max={75} />
              )}
              {stats.crit !== undefined && (
                <StatBar label="暴击" value={stats.crit} max={75} />
              )}
              {stats.critDamage !== undefined && (
                <StatBar
                  label="爆伤"
                  value={stats.critDamage}
                  max={4}
                  display={stats.critDamage.toFixed(1)}
                />
              )}
            </div>
          </section>

          {/* 天赋 */}
          <section className="space-y-1.5">
            <h2 className="text-sm font-semibold">天赋</h2>
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <p className="font-medium">{hero.passive.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hero.passive.description}
              </p>
            </div>
          </section>

          {/* 大招 */}
          <section className="space-y-1.5">
            <h2 className="text-sm font-semibold">大招</h2>
            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{hero.ultimate.name}</p>
                {hero.ultimate.damageType && (
                  <DamageTypeBadge type={hero.ultimate.damageType} />
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {hero.ultimate.description}
              </p>
            </div>
          </section>

          {/* 流派倾向 */}
          <section className="space-y-2">
            <h2 className="text-sm font-semibold">流派倾向</h2>
            <div className="flex flex-wrap gap-1.5">
              {hero.factions.map((fid) => (
                <FactionBadge key={fid} factionId={fid} />
              ))}
            </div>
          </section>

          {/* 禁用流派 */}
          {hero.banFactions && hero.banFactions.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold">禁用流派</h2>
              <div className="flex flex-wrap gap-1.5">
                {hero.banFactions.map((fid) => (
                  <Badge key={fid} variant="destructive">
                    禁用 {FACTION_NAME_MAP[fid] ?? fid}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </CardContent>
      </Card>

      {/* 相关技能 */}
      {relatedSkills.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">相关技能</h2>
          <div className="space-y-2">
            {relatedSkills.map((s) => (
              <Link key={s.id} href={`/skills/${s.id}`} className="block">
                <Card className="transition-colors hover:border-primary/60">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <FactionBadge factionId={s.faction} clickable={false} />
                      <span className="font-medium">{s.name}</span>
                      <SkillTierBadge tier={s.tier} />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {s.effect}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
