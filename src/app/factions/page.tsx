import { Sparkles, Swords, TrendingDown, TrendingUp } from "lucide-react";
import { FACTION_COLOR_MAP, getFactions } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FactionBadge } from "@/components/faction-badge";
import { VerifiedMark } from "@/components/codex/verified-mark";

export default function FactionsPage() {
  const factions = getFactions();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">流派图鉴</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {factions.length} 大流派 · 机制 / 优势 / 劣势 / 克制关系
        </p>
      </header>

      <div className="space-y-4">
        {factions.map((f) => {
          const color = f.color ?? FACTION_COLOR_MAP[f.id];
          return (
            <section key={f.id} id={f.id} className="scroll-mt-20">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="size-3 rounded-full"
                      style={{ backgroundColor: color ?? "#888" }}
                    />
                    <CardTitle className="text-lg">{f.name}</CardTitle>
                    {f.verified === false && <VerifiedMark />}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="text-muted-foreground">{f.description}</p>

                  <section className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      机制
                    </h3>
                    <p className="text-muted-foreground">{f.mechanics}</p>
                  </section>

                  {f.strengths.length > 0 && (
                    <section className="space-y-1.5">
                      <h3 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <TrendingUp className="size-3.5" /> 优势
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {f.strengths.map((s) => (
                          <Badge
                            key={s}
                            className="bg-emerald-500/15 text-emerald-400"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}

                  {f.weaknesses.length > 0 && (
                    <section className="space-y-1.5">
                      <h3 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <TrendingDown className="size-3.5" /> 劣势
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {f.weaknesses.map((s) => (
                          <Badge key={s} variant="destructive">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </section>
                  )}

                  {f.counters.length > 0 && (
                    <section className="space-y-1.5">
                      <h3 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Swords className="size-3.5" /> 克制 →
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {f.counters.map((fid) => (
                          <FactionBadge key={fid} factionId={fid} />
                        ))}
                      </div>
                    </section>
                  )}

                  {f.counteredBy.length > 0 && (
                    <section className="space-y-1.5">
                      <h3 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <TrendingDown className="size-3.5" /> 被克 ←
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {f.counteredBy.map((fid) => (
                          <FactionBadge key={fid} factionId={fid} />
                        ))}
                      </div>
                    </section>
                  )}

                  {f.synergy.length > 0 && (
                    <section className="space-y-1.5">
                      <h3 className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Sparkles className="size-3.5" /> 协同
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {f.synergy.map((fid) => (
                          <FactionBadge key={fid} factionId={fid} />
                        ))}
                      </div>
                    </section>
                  )}
                </CardContent>
              </Card>
            </section>
          );
        })}
      </div>
    </div>
  );
}
