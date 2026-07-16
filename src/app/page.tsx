import Link from "next/link";
import { getFactions, getHeroes, getSkills, getTreasures } from "@/lib/data";
import { FACTION_COLOR_MAP } from "@/lib/data";
import { Swords, ChevronRight } from "lucide-react";

export default function HomePage() {
  const factions = getFactions();
  const heroes = getHeroes();
  const skills = getSkills();
  const treasures = getTreasures();

  const features = [
    {
      href: "/heroes",
      title: "英雄图鉴",
      desc: `${heroes.length} 位英雄的天赋、大招、属性与流派倾向`,
    },
    {
      href: "/skills",
      title: "技能图鉴",
      desc: `${skills.length} 个技能的品阶、效果与升星加成`,
    },
    {
      href: "/treasures",
      title: "宝物图鉴",
      desc: `${treasures.length} 件遗物宝物的效果与适配`,
    },
    {
      href: "/factions",
      title: "流派图鉴",
      desc: `${factions.length} 大流派的机制、优势与劣势`,
    },
    {
      href: "/counter-chart",
      title: "克制图谱",
      desc: "可视化流派间的克制与协同关系",
    },
    {
      href: "/simulator",
      title: "搭配模拟器",
      desc: "模拟构筑，实时计算流派星级与属性面板",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Hero */}
      <section className="mb-12 flex flex-col items-center text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Swords className="size-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          选技大乱斗数据库
        </h1>
        <p className="mt-3 max-w-2xl text-balance text-muted-foreground sm:text-lg">
          Skill Legends Royale 社区数据图鉴 — 英雄、技能、宝物、流派克制关系与搭配模拟器。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
          <Link
            href="/counter-chart"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            查看克制图谱
          </Link>
          <Link
            href="/simulator"
            className="rounded-md border border-border px-4 py-2 hover:bg-secondary"
          >
            打开模拟器
          </Link>
        </div>
      </section>

      {/* 流派色环 */}
      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold">13 大流派</h2>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {factions.map((f) => (
            <Link
              key={f.id}
              href={`/factions#${f.id}`}
              className="group flex items-center gap-2 rounded-lg border border-border bg-card p-2.5 transition-colors hover:border-primary/60"
            >
              <span
                className="size-3 shrink-0 rounded-full"
                style={{
                  backgroundColor: FACTION_COLOR_MAP[f.id] ?? "#888",
                }}
              />
              <span className="truncate text-sm group-hover:text-primary">
                {f.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 功能入口 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold">功能入口</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/60 hover:bg-card/60"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-semibold">{f.title}</h3>
                <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
