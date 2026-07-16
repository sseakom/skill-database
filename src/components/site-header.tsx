"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Menu, Swords, X } from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // 路由变化时关闭移动端菜单，避免导航后菜单残留。
    // 这是合理的同步场景：pathname 来自 Next.js，菜单开合是响应式状态。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        toggleRef.current &&
        !toggleRef.current.contains(target)
      ) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <header className="relative sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Swords className="size-5 text-primary" />
          <span className="hidden sm:inline">选技大乱斗</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">数据库</span>
        </Link>
        <button
          ref={toggleRef}
          type="button"
          className="ml-auto inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
        <nav className="ml-auto hidden flex-wrap items-center gap-1 text-sm md:flex">
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
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div
        ref={menuRef}
        className={cn(
          "absolute left-0 right-0 top-14 border-b border-border/80 bg-background/95 shadow-lg backdrop-blur transition-all duration-200 md:hidden",
          mobileMenuOpen
            ? "visible opacity-100"
            : "invisible opacity-0 pointer-events-none"
        )}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-secondary",
                  active
                    ? "bg-secondary font-medium text-foreground"
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
