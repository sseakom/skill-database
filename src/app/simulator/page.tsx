"use client";

import { useCallback, useMemo, useState } from "react";
import { getFactions, getHeroes, getSkills, getSkillsByFaction, getTreasures } from "@/lib/data";
import {
  computeFactionStars,
  computeStatPanel,
  computeTotalCost,
  type StatPanel,
} from "@/lib/game-mechanics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FactionBadge } from "@/components/faction-badge";
import { SkillPicker } from "@/components/sim/skill-picker";
import { TreasurePicker } from "@/components/sim/treasure-picker";
import { StatPanelView } from "@/components/sim/stat-panel-view";
import { RecommendationPanel } from "@/components/sim/recommendation-panel";
import { Swords, RotateCcw, Info } from "lucide-react";
import type { Skill, Treasure } from "@/lib/types";

/** 构筑技能/宝物上限 */
const MAX_SKILLS = 10;
const MAX_TREASURES = 3;

export default function SimulatorPage() {
  const heroes = useMemo(() => getHeroes(), []);
  const factions = useMemo(() => getFactions(), []);
  const allSkills = useMemo(() => getSkills(), []);
  const allTreasures = useMemo(() => getTreasures(), []);

  // 按流派分组的可选技能（仅含有技能的流派）
  const factionSkillGroups = useMemo(
    () =>
      factions
        .map((f) => ({ faction: f, skills: getSkillsByFaction(f.id) }))
        .filter((g) => g.skills.length > 0),
    [factions]
  );

  // 构筑状态
  const [heroId, setHeroId] = useState<string | null>(null);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [selectedTreasureIds, setSelectedTreasureIds] = useState<string[]>([]);

  // 派生
  const hero = useMemo(
    () => (heroId ? heroes.find((h) => h.id === heroId) ?? null : null),
    [heroId, heroes]
  );
  const selectedSkills = useMemo(
    () =>
      selectedSkillIds
        .map((id) => allSkills.find((s) => s.id === id))
        .filter((s): s is Skill => Boolean(s)),
    [selectedSkillIds, allSkills]
  );
  const selectedTreasures = useMemo(
    () =>
      selectedTreasureIds
        .map((id) => allTreasures.find((t) => t.id === id))
        .filter((t): t is Treasure => Boolean(t)),
    [selectedTreasureIds, allTreasures]
  );

  const factionStars = useMemo(
    () => computeFactionStars(selectedSkills),
    [selectedSkills]
  );
  const factionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const skill of selectedSkills) {
      counts[skill.faction] = (counts[skill.faction] ?? 0) + 1;
    }
    return counts;
  }, [selectedSkills]);
  const statPanel: StatPanel | null = useMemo(
    () => (hero ? computeStatPanel(hero, selectedSkills) : null),
    [hero, selectedSkills]
  );
  const totalCost = useMemo(
    () => computeTotalCost(selectedSkills),
    [selectedSkills]
  );

  // 操作
  const toggleSkill = useCallback((id: string) => {
    setSelectedSkillIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SKILLS) return prev;
      return [...prev, id];
    });
  }, []);
  const toggleTreasure = useCallback((id: string) => {
    setSelectedTreasureIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_TREASURES) return prev;
      return [...prev, id];
    });
  }, []);
  const addSkill = useCallback((id: string) => {
    setSelectedSkillIds((prev) => {
      if (prev.includes(id) || prev.length >= MAX_SKILLS) return prev;
      return [...prev, id];
    });
  }, []);
  const addTreasure = useCallback((id: string) => {
    setSelectedTreasureIds((prev) => {
      if (prev.includes(id) || prev.length >= MAX_TREASURES) return prev;
      return [...prev, id];
    });
  }, []);
  const addAllSkills = useCallback((ids: string[]) => {
    setSelectedSkillIds((prev) => {
      const next = [...prev];
      for (const id of ids) {
        if (next.length >= MAX_SKILLS) break;
        if (!next.includes(id)) next.push(id);
      }
      return next;
    });
  }, []);
  const resetBuild = useCallback(() => {
    setSelectedSkillIds([]);
    setSelectedTreasureIds([]);
  }, []);

  const heroSelected = hero !== null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* 标题 */}
      <section className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Swords className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">搭配模拟器</h1>
          <p className="text-sm text-muted-foreground">
            选择英雄与技能，实时计算流派星级与属性面板。
          </p>
        </div>
      </section>

      {/* 推荐构筑 */}
      <section className="mb-6">
        <RecommendationPanel
          factions={factions}
          addedSkillIds={selectedSkillIds}
          addedTreasureIds={selectedTreasureIds}
          canAddMoreSkills={selectedSkillIds.length < MAX_SKILLS}
          canAddMoreTreasures={selectedTreasureIds.length < MAX_TREASURES}
          onAddSkill={addSkill}
          onAddTreasure={addTreasure}
          onAddAllSkills={addAllSkills}
        />
      </section>

      {/* 构筑 + 结算 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 左：构筑 */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>英雄</CardTitle>
              <div className="flex items-center gap-2">
                {hero?.verified === false && (
                  <Badge variant="outline" className="text-yellow-500/80">
                    数据待校对
                  </Badge>
                )}
                {(selectedSkillIds.length > 0 ||
                  selectedTreasureIds.length > 0) && (
                  <button
                    type="button"
                    onClick={resetBuild}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RotateCcw className="size-3.5" />
                    清空构筑
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <select
                value={heroId ?? ""}
                onChange={(e) => setHeroId(e.target.value || null)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">— 选择英雄 —</option>
                {heroes.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                    {h.title ? ` · ${h.title}` : ""}
                    {h.tier ? ` [${h.tier}]` : ""}
                  </option>
                ))}
              </select>
              {hero && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex flex-wrap gap-1">
                    {hero.factions.map((f) => (
                      <FactionBadge
                        key={f}
                        factionId={f}
                        clickable={false}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    <span className="text-foreground/80">天赋：</span>
                    {hero.passive.name} — {hero.passive.description}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="text-foreground/80">大招：</span>
                    {hero.ultimate.name} — {hero.ultimate.description}
                  </p>
                  {hero.banFactions && hero.banFactions.length > 0 && (
                    <p className="text-muted-foreground">
                      <span className="text-destructive/80">禁用：</span>
                      {hero.banFactions
                        .map(
                          (f) =>
                            factions.find((x) => x.id === f)?.name ?? f
                        )
                        .join("、")}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>
                技能
                <span className="font-normal text-muted-foreground">
                  （{selectedSkillIds.length}/{MAX_SKILLS}）
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {heroSelected ? (
                <SkillPicker
                  groups={factionSkillGroups}
                  selectedIds={selectedSkillIds}
                  onToggle={toggleSkill}
                  maxSkills={MAX_SKILLS}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  请先选择英雄开始构筑。
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>
                宝物
                <span className="font-normal text-muted-foreground">
                  （{selectedTreasureIds.length}/{MAX_TREASURES}）
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {heroSelected ? (
                <TreasurePicker
                  treasures={allTreasures}
                  selectedIds={selectedTreasureIds}
                  onToggle={toggleTreasure}
                  maxTreasures={MAX_TREASURES}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  请先选择英雄开始构筑。
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 右：结算面板 */}
        <div className="space-y-4">
          {hero && statPanel ? (
            <StatPanelView
              hero={hero}
              panel={statPanel}
              factionStars={factionStars}
              factionCounts={factionCounts}
              totalCost={totalCost}
              selectedTreasures={selectedTreasures}
            />
          ) : (
            <Card className="flex h-64 items-center justify-center">
              <CardContent className="text-center text-muted-foreground">
                <Info className="mx-auto mb-2 size-8 opacity-50" />
                <p>请选择英雄开始构筑。</p>
              </CardContent>
            </Card>
          )}
          <p className="text-xs text-muted-foreground">
            ⚠ 非官方数据，仅供参考。技能对攻击/攻速等属性的加成暂未实现，当前仅展示基础值与等级/HP。
          </p>
        </div>
      </div>
    </div>
  );
}
