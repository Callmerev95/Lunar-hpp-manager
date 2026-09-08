import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculateRecipeCost } from "@/lib/costing/recipe";
import { formatIDR, formatDate } from "@/lib/format";

export const metadata = {
  title: "Resep - Catatan HPP",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, name, output_qty, output_unit, margin_pct, created_at")
    .order("created_at", { ascending: false });
  const { data: materials } = await supabase
    .from("materials")
    .select("id, name, kind, buy_unit");
  const { data: prices } = await supabase
    .from("material_prices")
    .select("id, material_id, price, qty, unit, effective_at");
  const { data: recipeMaterials } = await supabase
    .from("recipe_materials")
    .select("id, recipe_id, material_id, qty, unit, sort_order");

  const byRecipe = new Map<string, typeof recipeMaterials>();
  for (const rm of recipeMaterials ?? []) {
    const list = byRecipe.get(rm.recipe_id) ?? [];
    list.push(rm);
    byRecipe.set(rm.recipe_id, list);
  }

  const rows = (recipes ?? []).map((r) => {
    const cost = calculateRecipeCost({
      recipe: r,
      materials: materials ?? [],
      recipeMaterials: byRecipe.get(r.id) ?? [],
      prices: prices ?? [],
    });
    return { ...r, perUnit: cost.perUnit, suggested: cost.suggestedPrice };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Resep</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Daftar resep dan harga pokok produksinya.
          </p>
        </div>
        <Button asChild>
          <Link href="/recipes/new">Resep baru</Link>
        </Button>
      </div>

      {!recipes || recipes.length === 0 ? (
        <EmptyState />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              {recipes.length} resep
            </CardTitle>
            <CardDescription>
              Harga jual saran mengikuti margin tiap resep.
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Hasil</TableHead>
                  <TableHead className="text-right">HPP per unit</TableHead>
                  <TableHead className="text-right">Harga saran</TableHead>
                  <TableHead>Dibuat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link
                        href={`/recipes/${r.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {r.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {r.output_qty} {r.output_unit}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatIDR(r.perUnit)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatIDR(r.suggested)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(r.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center gap-2 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <BookOpen className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>
        <CardTitle className="font-heading text-xl">Belum ada resep</CardTitle>
        <CardDescription>
          Tambahkan resep pertama untuk mulai menghitung biaya produksi.
        </CardDescription>
        <Button asChild className="mt-2">
          <Link href="/recipes/new">Buat resep pertama</Link>
        </Button>
      </CardHeader>
    </Card>
  );
}