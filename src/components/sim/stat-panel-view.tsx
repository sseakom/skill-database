"use client";

import { Crown, Heart, Coins, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FactionBadge } from "@/components/faction-badge";
import { StarBar } from "@/components/sim/star-bar";
import { cn } from "@/lib/utils";
import type { Hero, Treasure } from "@/lib/types";
import type { StatPanel } from "@/lib/game-mechanics";

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-secondary/40 px-2.5 py-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

/**
 * 结算面板：英雄等级、HP、各流派星级、基础属性、已选宝物、总花费。
 */
export function StatPanelView({
  hero,
  panel,
  factionStars,
  factionCounts,
  totalCost,
  selectedTreasures,
}: {
  hero: Hero;
  panel: StatPanel;
  factionStars: Record<string, number>;
  factionCounts: Record<string, number>;
  totalCost: number;
  selectedTreasures: Treasure[];
}) {
  const starEntries = Object.keys(factionCounts);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Crown className="size-4 text-primary" /> {hero.name}
          {hero.title && (
            <span className="text-sm font-normal text-muted-foreground">
              · {hero.title}
            </span>
          )}
        </CardTitle>
        <Badge className="text-base">Lv.{panel.level}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* HP */}
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
          <Heart className="size-4 text-destructive" />
          <span className="text-sm text-muted-foreground">生命值</span>
          <span className="ml-auto text-lg font-bold">{panel.hp}</span>
        </div>

        {/* 流派星级 */}
        <div>
          <h4 className="mb-2 text-sm font-semibold">流派星级</h4>
          {starEntries.length === 0 ? (
            <p className="text-xs text-muted-foreground">尚未选择技能。</p>
          ) : (
            <div className="space-y-1.5">
              {starEntries.map((factionId) => {
                const stars = factionStars[factionId] ?? 0;
                const count = factionCounts[factionId] ?? 0;
                return (
                  <div
                    key={factionId}
                    className={cn(
                      "flex items-center justify-between rounded-md px-2.5 py-1.5",
                      stars > 0 ? "bg-secondary/60" : "bg-secondary/20"
                    )}
                  >
                    <FactionBadge
                      factionId={factionId}
                      clickable={false}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {count} 个
                      </span>
                      <StarBar stars={stars} />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          stars > 0
                            ? "text-yellow-400"
                            : "text-muted-foreground/50"
                        )}
                      >
                        {stars}★
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 基础属性 */}
        <div>
          <h4 className="mb-2 text-sm font-semibold">基础属性</h4>
          <div className="grid gap-1.5 sm:grid-cols-2">
            <StatRow label="攻击力" value={`${panel.attack}`} />
            <StatRow label="攻速" value={`${panel.attackSpeed}`} />
            <StatRow label="回蓝" value={`${panel.energy}`} />
            <StatRow label="闪避" value={`${panel.dodge}%`} />
            <StatRow label="暴击" value={`${panel.crit}%`} />
            <StatRow label="爆伤" value={`${panel.critDamage}x`} />
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs text-yellow-500/80">
            <Info className="size-3.5" />
            技能加成待实现，攻击/攻速等暂为基础值。
          </p>
        </div>

        {/* 已选宝物 */}
        {selectedTreasures.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-semibold">已选宝物</h4>
            <div className="space-y-1">
              {selectedTreasures.map((treasure) => (
                <div
                  key={treasure.id}
                  className="rounded-md border border-border px-2.5 py-1.5 text-sm"
                >
                  <span className="font-medium">{treasure.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {treasure.effect}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 总花费 */}
        <div className="flex items-center gap-2 border-t border-border pt-3">
          <Coins className="size-4 text-yellow-400" />
          <span className="text-sm text-muted-foreground">技能总花费</span>
          <span className="ml-auto text-base font-bold text-yellow-400">
            {totalCost}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
