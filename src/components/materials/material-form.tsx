"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
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
import { UNIT_OPTIONS, UNIT_LABELS } from "@/lib/costing/units";
import {
  createMaterialAction,
  updateMaterialAction,
  type MaterialFormError,
} from "@/app/(app)/materials/actions";

const KIND_OPTIONS = [
  { value: "raw", label: "Bahan baku" },
  { value: "packaging", label: "Kemasan" },
] as const;

export type MaterialInitial = {
  id: string;
  name: string;
  kind: string;
  buy_unit: string;
  notes: string | null;
};

export function MaterialForm({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: MaterialInitial;
}) {
  const action = mode === "edit" ? updateMaterialAction : createMaterialAction;
  const [error, formAction, pending] = useActionState<
    MaterialFormError | undefined,
    FormData
  >(action, undefined);
  const [kind, setKind] = useState<string>(initial?.kind ?? "raw");
  const [buyUnit, setBuyUnit] = useState<string>(initial?.buy_unit ?? "gram");

  return (
    <form action={formAction} className="space-y-6">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">
            {mode === "edit" ? "Ubah bahan" : "Bahan baru"}
          </CardTitle>
          <CardDescription>
            {mode === "edit"
              ? "Perbarui detail bahan. Kelola harganya di daftar riwayat di bawah."
              : "Catat bahan yang kamu beli. Harga boleh diisi nanti, tapi resep baru bisa dihitung kalau bahan sudah punya harga."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama bahan</Label>
              <Input
                id="name"
                name="name"
                defaultValue={initial?.name}
                placeholder="Contoh: Tepung terigu"
                required
                aria-invalid={error?.field === "name"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kind">Jenis</Label>
              <Select value={kind} onValueChange={setKind} name="kind">
                <SelectTrigger id="kind" className="w-full">
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  {KIND_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="buy_unit">Unit beli</Label>
              <Select value={buyUnit} onValueChange={setBuyUnit} name="buy_unit">
                <SelectTrigger id="buy_unit" className="w-full">
                  <SelectValue placeholder="Pilih unit" />
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
              <Label htmlFor="notes">Catatan</Label>
              <Input
                id="notes"
                name="notes"
                defaultValue={initial?.notes ?? undefined}
                placeholder="Opsional"
                aria-invalid={error?.field === "notes"}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {mode === "create" ? (
        <PriceCard error={error} />
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error.message}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button asChild variant="outline" type="button">
          <Link href="/materials">Batal</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending
            ? "Menyimpan..."
            : mode === "edit"
              ? "Simpan perubahan"
              : "Simpan bahan"}
        </Button>
      </div>
    </form>
  );
}

function PriceCard({ error }: { error?: MaterialFormError }) {
  const [withPrice, setWithPrice] = useState(true);
  const [priceUnit, setPriceUnit] = useState<string>("");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-xl">Harga awal</CardTitle>
        <CardDescription>
          Isi kalau kamu tahu harganya sekarang. Boleh dilewati, harga bisa
          ditambahkan lagi nanti.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={withPrice}
            onChange={(e) => setWithPrice(e.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          Isi harga sekarang
        </label>

        {withPrice ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                placeholder="Contoh: 15000"
                aria-invalid={error?.field === "price"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="qty">Untuk berapa unit</Label>
              <Input
                id="qty"
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
              <Label htmlFor="unit">Unit harga</Label>
              <Select value={priceUnit} onValueChange={setPriceUnit} name="unit">
                <SelectTrigger id="unit" className="w-full">
                  <SelectValue placeholder="Default: unit beli" />
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
              <Label htmlFor="effective_at">Berlaku sejak</Label>
              <Input
                id="effective_at"
                name="effective_at"
                type="date"
                aria-invalid={error?.field === "effective_at"}
              />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}