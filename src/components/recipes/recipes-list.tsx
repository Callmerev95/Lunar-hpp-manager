"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Search } from "lucide-react";
import { formatIDR } from "@/lib/format";

export type RecipeCardItem = {
  id: string;
  name: string;
  output_qty: number;
  output_unit: string;
  margin_pct: number;
  perUnit: number;
  suggested: number;
};

export function RecipesList({
  recipes,
}: {
  recipes: RecipeCardItem[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter((r) => r.name.toLowerCase().includes(q));
  }, [recipes, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari resep…"
          aria-label="Cari resep"
          className="rounded-full border-border/60 bg-card pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {recipes.length === 0
              ? "Belum ada resep. Tambahkan resep pertama untuk mulai."
              : `Tidak ada resep yang cocok dengan “${query}”.`}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((r, i) => (
            <Link key={r.id} href={`/recipes/${r.id}`} className="group block">
              <Card
                className="rounded-2xl border-border/60 motion-safe:animate-[fadeInUp_0.4s_ease-out_both] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-medium">{r.name}</p>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                      {r.output_qty} {r.output_unit}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">HPP / unit</p>
                      <p className="truncate text-base font-semibold tabular-nums">
                        {formatIDR(r.perUnit)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Harga saran</p>
                      <p className="truncate text-base font-semibold text-primary tabular-nums">
                        {formatIDR(r.suggested)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Klik untuk lihat rincian →
                    </p>
                    <span className="shrink-0 rounded-full border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                      {r.margin_pct}% margin
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
