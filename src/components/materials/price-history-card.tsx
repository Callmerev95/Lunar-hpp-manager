"use client";

import { useActionState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UNIT_OPTIONS, UNIT_LABELS } from "@/lib/costing/units";
import type { PriceRow } from "@/lib/costing/prices";
import { formatIDR, formatDate } from "@/lib/format";
import {
  addMaterialPriceAction,
  deleteMaterialPriceAction,
  type MaterialFormError,
} from "@/app/(app)/materials/actions";

export function PriceHistoryCard({
  materialId,
  buyUnit,
  prices,
  usedInRecipes,
}: {
  materialId: string;
  buyUnit: string;
  prices: PriceRow[];
  usedInRecipes: boolean;
}) {
  const [error, formAction, pending] = useActionState<
    MaterialFormError | undefined,
    FormData
  >(addMaterialPriceAction, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Riwayat harga</CardTitle>
        <CardDescription>
          HPP memakai entri dengan tanggal berlaku paling baru.
          {usedInRecipes
            ? " Bahan ini dipakai di resep — perubahan harga langsung memengaruhi HPP resep."
            : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {prices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada harga tercatat. Tambahkan lewat form di bawah.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Harga</TableHead>
                  <TableHead>Berlaku sejak</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prices.map((p, i) => (
                  <TableRow key={p.id}>
                    <TableCell className="tabular-nums">
                      {formatIDR(p.price)} / {p.qty} {p.unit}
                    </TableCell>
                    <TableCell>
                      {formatDate(p.effective_at)}
                      {i === 0 ? (
                        <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          terbaru
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={deleteMaterialPriceAction}>
                        <input type="hidden" name="price_id" value={p.id} />
                        <input type="hidden" name="material_id" value={materialId} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                        >
                          Hapus
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <form action={formAction} className="grid gap-4 sm:grid-cols-4 sm:items-end">
          <input type="hidden" name="material_id" value={materialId} />
          <div className="space-y-2">
            <Label htmlFor="new-price">Harga (Rp)</Label>
            <Input
              id="new-price"
              name="price"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              required
              aria-invalid={error?.field === "price"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-qty">Untuk berapa unit</Label>
            <Input
              id="new-qty"
              name="qty"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              placeholder="Default: 1"
              aria-invalid={error?.field === "qty"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-unit">Unit</Label>
            <input type="hidden" name="unit" value={UNIT_OPTIONS.includes(buyUnit as never) ? buyUnit : "gram"} />
            <Select defaultValue={UNIT_OPTIONS.includes(buyUnit as never) ? buyUnit : "gram"} name="unit">
              <SelectTrigger id="new-unit" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {UNIT_LABELS[u]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-effective">Berlaku sejak</Label>
            <Input id="new-effective" name="effective_at" type="date" />
          </div>
          <Button type="submit" disabled={pending} className="sm:col-span-4 sm:w-fit">
            {pending ? "Menyimpan..." : "Tambah harga"}
          </Button>
          {error ? (
            <p role="alert" className="text-sm text-destructive sm:col-span-4">
              {error.message}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}