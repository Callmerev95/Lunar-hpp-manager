import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Card,
  CardContent,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatIDR, formatDate } from "@/lib/format";
import { calculateRecipeCost } from "@/lib/costing/recipe";
import { deleteRecipeAction, updateMarginAction } from "../actions";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, name, output_qty, output_unit, margin_pct, notes, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!recipe) notFound();

  const { data: recipeMaterials } = await supabase
    .from("recipe_materials")
    .select("id, recipe_id, material_id, qty, unit, sort_order")
    .eq("recipe_id", id)
    .order("sort_order", { ascending: true });

  const { data: materials } = await supabase
    .from("materials")
    .select("id, name, kind, buy_unit")
    .order("name", { ascending: true });

  const { data: prices } = await supabase
    .from("material_prices")
    .select("id, material_id, price, qty, unit, effective_at");

  const cost = calculateRecipeCost({
    recipe,
    materials: materials ?? [],
    recipeMaterials: recipeMaterials ?? [],
    prices: prices ?? [],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">{recipe.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {recipe.output_qty} {recipe.output_unit} per batch · dibuat{" "}
            {formatDate(recipe.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/recipes/${recipe.id}/edit`}>Ubah</Link>
          </Button>
          <form action={deleteRecipeAction}>
            <input type="hidden" name="id" value={recipe.id} />
            <Button type="submit" variant="outline" className="text-destructive">
              Hapus resep
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Bahan</CardTitle>
          {cost.unresolvedUnits.length > 0 ? (
            <CardDescription className="text-amber-700 dark:text-amber-400">
              Ada bahan tanpa harga — item itu tidak dihitung.
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bahan</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Harga satuan</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cost.items.map((item) => (
                  <TableRow key={item.materialId}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.qty} {item.unit}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatIDR(item.unitCost)} / {item.unit}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatIDR(item.cost)}
                    </TableCell>
                  </TableRow>
                ))}
                {cost.unresolvedUnits.map((u) => {
                  const m = (materials ?? []).find((x) => x.id === u.materialId);
                  return (
                    <TableRow key={`un-${u.materialId}`} className="text-muted-foreground">
                      <TableCell>{m?.name ?? "Bahan"}</TableCell>
                      <TableCell className="text-right tabular-nums">—</TableCell>
                      <TableCell className="text-right">belum ada harga</TableCell>
                      <TableCell className="text-right">—</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Hasil HPP</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total bahan baku</dt>
                <dd className="tabular-nums">{formatIDR(cost.totalMaterials)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total kemasan</dt>
                <dd className="tabular-nums">{formatIDR(cost.totalPackaging)}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium">
                <dt>HPP total</dt>
                <dd className="tabular-nums">{formatIDR(cost.totalCost)}</dd>
              </div>
              <div className="flex justify-between font-medium">
                <dt>HPP per {recipe.output_unit}</dt>
                <dd className="tabular-nums">{formatIDR(cost.perUnit)}</dd>
              </div>
              <div className="flex justify-between font-medium text-primary">
                <dt>Harga jual saran</dt>
                <dd className="tabular-nums">{formatIDR(cost.suggestedPrice)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Margin</CardTitle>
            <CardDescription>
              Ubah margin untuk melihat harga jual saran baru.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateMarginAction} className="flex items-end gap-3">
              <input type="hidden" name="id" value={recipe.id} />
              <div className="space-y-2">
                <Label htmlFor="margin_pct">Margin (%)</Label>
                <Input
                  id="margin_pct"
                  name="margin_pct"
                  type="number"
                  min={0}
                  step="any"
                  inputMode="decimal"
                  defaultValue={recipe.margin_pct}
                  className="w-32"
                />
              </div>
              <Button type="submit" variant="outline">
                Perbarui
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}