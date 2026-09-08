"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Search, Pencil } from "lucide-react";
import { formatIDR, formatDate } from "@/lib/format";

export type MaterialCardItem = {
  id: string;
  name: string;
  kind: string;
  buy_unit: string;
  price: number | null;
  qty: number | null;
  unit: string | null;
  effective_at: string | null;
};

const KIND_LABELS: Record<string, string> = {
  raw: "Bahan baku",
  packaging: "Kemasan",
};

export function MaterialsList({
  materials,
}: {
  materials: MaterialCardItem[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return materials;
    return materials.filter((m) => m.name.toLowerCase().includes(q));
  }, [materials, query]);

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
          placeholder="Cari bahan…"
          aria-label="Cari bahan"
          className="rounded-full border-border/60 bg-card pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {materials.length === 0
              ? "Belum ada bahan. Tambahkan bahan pertama untuk mulai."
              : `Tidak ada bahan yang cocok dengan “${query}”.`}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((m, i) => {
            const initial = m.name.trim().charAt(0).toUpperCase();
            const unitLabel =
              m.unit && m.qty ? `per ${m.qty === 1 ? "" : `${m.qty} `}${m.unit}` : `per ${m.buy_unit}`;
            return (
              <Card
                key={m.id}
                className="group rounded-2xl border-border/60 motion-safe:animate-[fadeInUp_0.4s_ease-out_both] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              >
                <CardContent className="flex items-center gap-3 py-4">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-lg font-semibold text-primary"
                  >
                    {initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {KIND_LABELS[m.kind] ?? m.kind} · {unitLabel}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    {m.price !== null ? (
                      <>
                        <span className="font-semibold text-primary tabular-nums">
                          {formatIDR(m.price)}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {m.unit ? `/ ${m.unit}` : `/ ${m.buy_unit}`}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Belum ada harga
                      </span>
                    )}
                    {m.effective_at ? (
                      <span className="text-[11px] text-muted-foreground/80">
                        sejak {formatDate(m.effective_at)}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button asChild variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" aria-label={`Ubah ${m.name}`}>
                      <Link href={`/materials/${m.id}/edit`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}