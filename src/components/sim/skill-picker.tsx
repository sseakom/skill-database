"use client";

import { Check } from "lucide-react";
import { FactionBadge } from "@/components/faction-badge";
import { TierBadge } from "@/components/sim/tier-badge";
import { cn } from "@/lib/utils";
import type { Faction, Skill } from "@/lib/types";

/**
 * 技能多选器：按流派分组展示可选项，点击切换选中。
 * 达到 maxSkills 上限时未选项禁用。
 */
export function SkillPicker({
  groups,
  selectedIds,
  onToggle,
  maxSkills,
}: {
  groups: { faction: Faction; skills: Skill[] }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxSkills: number;
}) {
  const atLimit = selectedIds.length >= maxSkills;

  return (
    <div className="space-y-4">
      {groups.map(({ faction, skills }) => {
        const selectedInFaction = skills.filter((s) =>
          selectedIds.includes(s.id)
        ).length;
        return (
          <div key={faction.id}>
            <div className="mb-2 flex items-center justify-between">
              <FactionBadge factionId={faction.id} clickable={false} />
              <span className="text-xs text-muted-foreground">
                {selectedInFaction}/{skills.length}
              </span>
            </div>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {skills.map((skill) => {
                const selected = selectedIds.includes(skill.id);
                const disabled = !selected && atLimit;
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => !disabled && onToggle(skill.id)}
                    disabled={disabled}
                    className={cn(
                      "flex items-center justify-between rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-secondary/60",
                      disabled && "cursor-not-allowed opacity-40"
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <Check
                        className={cn(
                          "size-3.5 shrink-0",
                          selected ? "text-primary" : "text-transparent"
                        )}
                      />
                      <span className="truncate font-medium">
                        {skill.name}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <TierBadge tier={skill.tier} />
                      <span className="text-xs text-muted-foreground">
                        {skill.cost}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
