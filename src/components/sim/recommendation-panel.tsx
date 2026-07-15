"use client";

import { useState } from "react";
import { Sparkles, Plus, Check, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FactionBadge } from "@/components/faction-badge";
import { TierBadge } from "@/components/sim/tier-badge";
import { cn } from "@/lib/utils";
import {
  recommend,
  type Playstyle,
  type RecommendationResult,
} from "@/lib/recommender";
import type { Faction } from "@/lib/types";

const PLAYSTYLES: { id: Playstyle; label: string }[] = [
  { id: "aggressive", label: "进攻型" },
  { id: "defensive", label: "防守型" },
  { id: "economic", label: "经济型" },
];

/**
 * 推荐构筑面板：选择主流派 + 打法风格，调用推荐器生成技能/宝物，
 * 可一键加入构筑。推荐相关状态自洽于本组件，构筑状态由父级管理。
 */
export function RecommendationPanel({
  factions,
  addedSkillIds,
  addedTreasureIds,
  canAddMoreSkills,
  canAddMoreTreasures,
  onAddSkill,
  onAddTreasure,
  onAddAllSkills,
}: {
  factions: Faction[];
  addedSkillIds: string[];
  addedTreasureIds: string[];
  canAddMoreSkills: boolean;
  canAddMoreTreasures: boolean;
  onAddSkill: (id: string) => void;
  onAddTreasure: (id: string) => void;
  onAddAllSkills: (ids: string[]) => void;
}) {
  const [primaryFaction, setPrimaryFaction] = useState<string>(
    factions[0]?.id ?? ""
  );
  const [playstyle, setPlaystyle] = useState<Playstyle | null>(null);
  const [rec, setRec] = useState<RecommendationResult | null>(null);

  const generate = () => {
    setRec(recommend({ primaryFaction, playstyle: playstyle ?? undefined }));
  };

  const hasUnaddedSkills =
    rec?.recommendedSkills.some((s) => !addedSkillIds.includes(s.id)) ?? false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-4 text-primary" /> 推荐构筑
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          选择主流派与打法风格，生成推荐技能与宝物，可一键加入构筑。
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 主流派 chips */}
        <div className="flex flex-wrap gap-1.5">
          {factions.map((f) => {
            const active = f.id === primaryFaction;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setPrimaryFaction(f.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs transition-colors",
                  active
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border hover:bg-secondary"
                )}
              >
                {f.name}
              </button>
            );
          })}
        </div>

        {/* 打法风格 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">打法：</span>
          {PLAYSTYLES.map((p) => {
            const active = playstyle === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlaystyle(active ? null : p.id)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs transition-colors",
                  active
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border hover:bg-secondary"
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={generate}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Wand2 className="size-4" /> 生成推荐
        </button>

        {rec && (
          <div className="mt-2 space-y-3 border-t border-border pt-3">
            {/* 推荐技能 */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <h4 className="text-sm font-semibold">
                  推荐技能
                  <span className="font-normal text-muted-foreground">
                    （{rec.recommendedSkills.length}）
                  </span>
                </h4>
                {canAddMoreSkills && hasUnaddedSkills && (
                  <button
                    type="button"
                    onClick={() =>
                      onAddAllSkills(rec.recommendedSkills.map((s) => s.id))
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    全部加入
                  </button>
                )}
              </div>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {rec.recommendedSkills.map((skill) => {
                  const added = addedSkillIds.includes(skill.id);
                  return (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between rounded-md border border-border px-2.5 py-1.5 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <FactionBadge
                          factionId={skill.faction}
                          clickable={false}
                        />
                        <span className="truncate font-medium">
                          {skill.name}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1.5">
                        <TierBadge tier={skill.tier} />
                        {added ? (
                          <Check className="size-3.5 text-primary" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAddSkill(skill.id)}
                            disabled={!canAddMoreSkills}
                            className={cn(
                              "rounded p-0.5 hover:bg-secondary",
                              !canAddMoreSkills &&
                                "cursor-not-allowed opacity-40"
                            )}
                          >
                            <Plus className="size-3.5" />
                          </button>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 推荐宝物 */}
            <div>
              <h4 className="mb-1.5 text-sm font-semibold">推荐宝物</h4>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {rec.recommendedTreasures.map((treasure) => {
                  const added = addedTreasureIds.includes(treasure.id);
                  return (
                    <div
                      key={treasure.id}
                      className="flex items-center justify-between rounded-md border border-border px-2.5 py-1.5 text-sm"
                    >
                      <span className="min-w-0">
                        <span className="block font-medium">
                          {treasure.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {treasure.effect}
                        </span>
                      </span>
                      {added ? (
                        <Check className="size-3.5 shrink-0 text-primary" />
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddTreasure(treasure.id)}
                          disabled={!canAddMoreTreasures}
                          className={cn(
                            "shrink-0 rounded p-0.5 hover:bg-secondary",
                            !canAddMoreTreasures &&
                              "cursor-not-allowed opacity-40"
                          )}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 推荐理由 */}
            <div>
              <h4 className="mb-1.5 text-sm font-semibold">推荐理由</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {rec.notes.map((note, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="text-primary">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
