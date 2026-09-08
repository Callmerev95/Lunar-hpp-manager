import { createClient } from "@/lib/supabase/server";
import { Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { latestPrices } from "@/lib/costing/prices";
import { MaterialsList, type MaterialCardItem } from "@/components/materials/materials-list";

export const metadata = {
  title: "Bahan - Catatan HPP",
};

export default async function MaterialsPage() {
  const supabase = await createClient();
  const [{ data: materials }, { data: prices }] = await Promise.all([
    supabase
      .from("materials")
      .select("id, name, kind, buy_unit")
      .order("name", { ascending: true }),
    supabase
      .from("material_prices")
      .select("id, material_id, price, qty, unit, effective_at")
      .order("effective_at", { ascending: true }),
  ]);

  const latest = latestPrices(prices ?? []);

  const items: MaterialCardItem[] = (materials ?? []).map((m) => {
    const p = latest.get(m.id) ?? null;
    return {
      id: m.id,
      name: m.name,
      kind: m.kind,
      buy_unit: m.buy_unit,
      price: p ? p.price : null,
      qty: p ? p.qty : null,
      unit: p ? p.unit : null,
      effective_at: p ? p.effective_at : null,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Bahan</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Daftar bahan baku dan kemasan beserta harganya.
          </p>
        </div>
        <Button asChild>
          <Link href="/materials/new">+ Tambah Bahan</Link>
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="items-center gap-2 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Package className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <CardTitle className="font-heading text-xl">
              Bahan belum ada
            </CardTitle>
            <CardDescription>
              Catat dulu bahan dan kemasan yang kamu pakai, baru susun resep.
            </CardDescription>
            <Button asChild className="mt-2">
              <Link href="/materials/new">Tambah bahan pertama</Link>
            </Button>
          </CardHeader>
        </Card>
      ) : (
        <MaterialsList materials={items} />
      )}
    </div>
  );
}
