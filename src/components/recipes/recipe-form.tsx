"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UNIT_OPTIONS, UNIT_LABELS, type UnitOption } from "@/lib/costing/units";
import { isConvertible } from "@/lib/costing/unit";
import { latestPrices } from "@/lib/costing/prices";
import type { PriceRow } from "@/lib/costing/prices";
import { calculateRecipeCost, type MaterialRow } from "@/lib/costing/recipe";
import { formatIDR } from "@/lib/format";
import {
  createRecipeAction,
  updateRecipeAction,
  type RecipeFormError,
} from "@/app/(app)/recipes/actions";

type MaterialOption = Pick<MaterialRow, "id" | "name" | "kind" | "buy_unit">;

type ItemRow = {
  key: number;
  material_id: string;
  qty: string;
  unit: string;
};

export type RecipeInitial = {
  recipe: {
    id: string;
    name: string;
    output_qty: number;
    output_unit: string;
    margin_pct: number;
    notes: string | null;
  };
  items: { material_id: string; qty: number; unit: string }[];
};

const OUTPUT_UNIT_OPTIONS = ["porsi", "pcs", "bungkus", "toples", "loaf"] as const;

export function RecipeForm({
  materials,
  prices,
  mode = "create",
  initial,
}: {
  materials: MaterialOption[];
  prices: PriceRow[];
  mode?: "create" | "edit";
  initial?: RecipeInitial;
}) {
  const action = mode === "edit" ? updateRecipeAction : createRecipeAction;
  const [error, formAction, pending] = useActionState<
    RecipeFormError | undefined,
    FormData
  >(action, undefined);

  const [name, setName] = useState(initial?.recipe.name ?? "");
  const [outputQty, setOutputQty] = useState(
    initial ? String(initial.recipe.output_qty) : "",
  );
  const [outputUnit, setOutputUnit] = useState(
    initial?.recipe.output_unit ?? "porsi",
  );
  const [marginPct, setMarginPct] = useState(
    initial ? String(initial.recipe.margin_pct) : "30",
  );
  const [items, setItems] = useState<ItemRow[]>(
    initial
      ? initial.items.map((item, i) => ({
          key: i,
          material_id: item.material_id,
          qty: String(item.qty),
          unit: item.unit,
        }))
      : [],
  );

  const latest = useMemo(() => latestPrices(prices), [prices]);

  const materialById = useMemo(
    () => new Map(materials.map((m) => [m.id, m])),
    [materials],
  );

  const pricedMaterials = useMemo(
    () => materials.filter((m) => latest.has(m.id)),
    [materials, latest],
  );

  const preview = useMemo(() => {
    const validItems = items
      .filter((i) => i.material_id && Number(i.qty) > 0 && i.unit)
      .map((i) => ({
        id: `preview-${i.key}`,
        recipe_id: "preview",
        material_id: i.material_id,
        qty: Number(i.qty),
        unit: i.unit,
        sort_order: 0,
      }));

    return calculateRecipeCost({
      recipe: {
        id: "preview",
        name: name || "Resep",
        output_qty: Number(outputQty) || 0,
        output_unit: outputUnit,
        margin_pct: Number(marginPct) || 0,
      },
      materials: [...materialById.values()],
      recipeMaterials: validItems,
      prices,
    });
  }, [items, name, outputQty, outputUnit, marginPct, materialById, prices]);

  const hasNoPriceItems = items.some(
    (i) => i.material_id && !latest.has(i.material_id),
  );

  function addItem() {
    setItems((prev) => [
      ...prev,
      { key: Date.now(), material_id: "", qty: "", unit: "" },
    ]);
  }

  function updateItem(key: number, patch: Partial<ItemRow>) {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, ...patch } : i)),
    );
  }

  function removeItem(key: number) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          items.map((i) => ({
            material_id: i.material_id,
            qty: Number(i.qty) || 0,
            unit: i.unit,
          })),
        )}
      />
      {mode === "edit" ? (
        <input type="hidden" name="id" value={initial?.recipe.id} />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Identitas resep</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama resep</Label>
            <Input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Brownies kukus cokelat"
              required
              aria-invalid={error?.field === "name"}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="output_qty">Hasil</Label>
              <Input
                id="output_qty"
                name="output_qty"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={outputQty}
                onChange={(e) => setOutputQty(e.target.value)}
                placeholder="Contoh: 12"
                required
                aria-invalid={error?.field === "output_qty"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="output_unit">Unit hasil</Label>
              <Select value={outputUnit} onValueChange={setOutputUnit} name="output_unit">
                <SelectTrigger id="output_unit" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OUTPUT_UNIT_OPTIONS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin_pct">Margin (%)</Label>
              <Input
                id="margin_pct"
                name="margin_pct"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={marginPct}
                onChange={(e) => setMarginPct(e.target.value)}
                required
                aria-invalid={error?.field === "margin_pct"}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan</Label>
            <Input
              id="notes"
              name="notes"
              defaultValue={initial?.recipe.notes ?? undefined}
              placeholder="Opsional"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1.5">
            <CardTitle className="font-heading text-xl">Bahan resep</CardTitle>
            <CardDescription>
              Pilih bahan, isi takarannya. Unit diambil sesuai harga bahan.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" onClick={addItem}>
            Tambah bahan
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada bahan. Klik “Tambah bahan” untuk mulai.
            </p>
          ) : null}

          {items.map((item) => {
            const material = materialById.get(item.material_id);
            const priceRow = item.material_id ? latest.get(item.material_id) : undefined;
            const baseUnit = priceRow?.unit ?? material?.buy_unit ?? "";
            const allowedUnits = baseUnit
              ? UNIT_OPTIONS.filter((u) => isConvertible(baseUnit, u))
              : [];

            return (
              <div
                key={item.key}
                className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_7rem_8rem_2rem] sm:items-end"
              >
                <div className="space-y-1.5">
                  <Label htmlFor={`material-${item.key}`}>Bahan</Label>
                  <Select
                    value={item.material_id}
                    onValueChange={(v) => {
                      const m = materialById.get(v);
                      const p = latest.get(v);
                      const u = p?.unit ?? m?.buy_unit ?? "";
                      updateItem(item.key, {
                        material_id: v,
                        unit: u && UNIT_OPTIONS.includes(u as UnitOption) ? u : "",
                      });
                    }}
                  >
                    <SelectTrigger id={`material-${item.key}`} className="w-full">
                      <SelectValue placeholder="Pilih bahan" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                          {latest.has(m.id) ? "" : " (belum ada harga)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`qty-${item.key}`}>Qty</Label>
                  <Input
                    id={`qty-${item.key}`}
                    type="number"
                    min={0}
                    step="any"
                    inputMode="decimal"
                    value={item.qty}
                    onChange={(e) => updateItem(item.key, { qty: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`unit-${item.key}`}>Unit</Label>
                  <Select
                    value={item.unit}
                    onValueChange={(v) => updateItem(item.key, { unit: v })}
                  >
                    <SelectTrigger id={`unit-${item.key}`} className="w-full">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {allowedUnits.map((u) => (
                        <SelectItem key={u} value={u}>
                          {UNIT_LABELS[u]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.key)}
                  className="text-muted-foreground"
                  aria-label={`Hapus bahan baris ${item.key}`}
                >
                  ✕
                </Button>
              </div>
            );
          })}

          {pricedMaterials.length === 0 ? (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Belum ada bahan dengan harga. Tambahkan harga di halaman Bahan
              dulu supaya bisa dipakai di resep.
            </p>
          ) : null}
          {hasNoPriceItems ? (
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Ada bahan tanpa harga — item itu belum dihitung.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Perkiraan HPP</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:max-w-md">
            <dt className="text-muted-foreground">Total bahan baku</dt>
            <dd className="text-right tabular-nums">{formatIDR(preview.totalMaterials)}</dd>
            <dt className="text-muted-foreground">Total kemasan</dt>
            <dd className="text-right tabular-nums">{formatIDR(preview.totalPackaging)}</dd>
            <dt className="font-medium">HPP total</dt>
            <dd className="text-right font-medium tabular-nums">{formatIDR(preview.totalCost)}</dd>
            <dt className="font-medium">HPP per {outputUnit || "unit"}</dt>
            <dd className="text-right font-medium tabular-nums">
              {formatIDR(preview.perUnit)}
            </dd>
            <dt className="font-medium">Harga jual saran</dt>
            <dd className="text-right font-medium tabular-nums">
              {formatIDR(preview.suggestedPrice)}
            </dd>
          </dl>
        </CardContent>
      </Card>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="submit" disabled={pending}>
          {pending
            ? "Menyimpan..."
            : mode === "edit"
              ? "Simpan perubahan"
              : "Simpan resep"}
        </Button>
      </div>
    </form>
  );
}