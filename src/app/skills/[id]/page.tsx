import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Coins, Sparkles, Star } from "lucide-react";
import { getSkillById, getSkills } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FactionBadge } from "@/components/faction-badge";
import { SkillTierBadge } from "@/components/codex/tier-badge";
import { VerifiedMark } from "@/components/codex/verified-mark";

export function generateStaticParams() {
  return getSkills().map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const skill = getSkillById(id);
  if (!skill) return { title: "技能不存在" };
  return {
    title: `${skill.name} · 技能图鉴`,
    description: skill.effect,
  };
}

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const skill = getSkillById(id);
  if (!skill) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/skills" className="hover:text-foreground">
          技能
        </Link>
        <span className="mx-1">/</span>
        <span className="text-foreground">{skill.name}</span>
      </nav>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">{skill.name}</CardTitle>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <SkillTierBadge tier={skill.tier} />
                <FactionBadge factionId={skill.faction} clickable={false} />
                {skill.verified === false && <VerifiedMark />}
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Coins className="size-4" /> {skill.cost} 金
              </span>
              <span className="inline-flex items-center gap-1 text-muted-foreground">
                <Sparkles className="size-4" /> +{skill.exp} 经验
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-1.5">
            <h2 className="text-sm font-semibold">效果</h2>
            <p className="text-sm">{skill.effect}</p>
          </section>

          {skill.starBonuses && skill.starBonuses.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold">升星加成</h2>
              <ul className="space-y-1.5">
                {skill.starBonuses.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-lg border border-border bg-secondary/30 p-2.5 text-sm"
                  >
                    <Star className="mt-0.5 size-4 shrink-0 text-amber-400" />
                    <span>
                      <span className="font-medium">{i + 1} 星</span>
                      <span className="text-muted-foreground"> — {b}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="space-y-1.5">
            <h2 className="text-sm font-semibold">说明</h2>
            <p className="text-sm text-muted-foreground">{skill.description}</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
