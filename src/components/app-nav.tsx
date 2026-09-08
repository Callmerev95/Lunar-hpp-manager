"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Resep", icon: "📋" },
  { href: "/materials", label: "Bahan", icon: "🥄" },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Menu utama"
      className="flex items-center gap-1 rounded-full border border-border/60 bg-card p-1"
    >
      {TABS.map((tab) => {
        const active =
          tab.href === "/"
            ? pathname === "/" || pathname.startsWith("/recipes")
            : pathname.startsWith("/materials");
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span aria-hidden="true" className="mr-1.5">
              {tab.icon}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}