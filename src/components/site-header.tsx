"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Swords } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/heroes", label: "英雄" },
  { href: "/skills", label: "技能" },
  { href: "/treasures", label: "宝物" },
  { href: "/factions", label: "流派" },
  { href: "/counter-chart", label: "克制图谱" },
  { href: "/simulator", label: "模拟器" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Swords className="size-5 text-primary" />
          <span className="hidden sm:inline">选技大乱斗</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">数据库</span>
        </Link>
        <nav className="ml-auto flex flex-wrap items-center gap-1 text-sm">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 transition-colors hover:bg-secondary",
                  active
                    ? "bg-secondary text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
