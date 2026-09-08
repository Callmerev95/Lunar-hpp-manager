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

export const metadata = {
  title: "Bahan - Catatan HPP",
};

export default async function MaterialsPage() {
  const supabase = await createClient();
  const { data: materials } = await supabase
    .from("materials")
    .select("id, name, kind, buy_unit")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
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
              Tabel bahan lengkap datang di tahap berikutnya.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}