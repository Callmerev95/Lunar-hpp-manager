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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { latestPrices } from "@/lib/costing/prices";
import { formatIDR, formatDate } from "@/lib/format";

export const metadata = {
  title: "Bahan - Catatan HPP",
};

const KIND_LABELS: Record<string, string> = {
  raw: "Bahan baku",
  packaging: "Kemasan",
};

export default async function MaterialsPage() {
  const supabase = await createClient();
  const { data: materials } = await supabase
    .from("materials")
    .select("id, name, kind, buy_unit")
    .order("name", { ascending: true });

  const { data: prices } = await supabase
    .from("material_prices")
    .select("id, material_id, price, qty, unit, effective_at")
    .order("effective_at", { ascending: true });

  const latest = latestPrices(prices ?? []);

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
          <Link href="/materials/new">Tambah bahan</Link>
        </Button>
      </div>

      {!materials || materials.length === 0 ? (
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
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              {materials.length} bahan
            </CardTitle>
            <CardDescription>
              Harga yang dipakai adalah yang paling baru.
            </CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Unit beli</TableHead>
                  <TableHead className="text-right">Harga terakhir</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((m) => {
                  const p = latest.get(m.id);
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {KIND_LABELS[m.kind] ?? m.kind}
                        </span>
                      </TableCell>
                      <TableCell>{m.buy_unit}</TableCell>
                      <TableCell className="text-right">
                        {p ? (
                          <span className="flex flex-col">
                            <span className="tabular-nums">
                              {formatIDR(p.price)} / {p.qty} {p.unit}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              sejak {formatDate(p.effective_at)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Belum ada harga
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/materials/${m.id}/edit`}
                          className="text-sm underline underline-offset-4 hover:text-foreground"
                        >
                          Ubah
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}