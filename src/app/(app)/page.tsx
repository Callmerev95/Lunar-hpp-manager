import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, name, output_qty, output_unit, margin_pct")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
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
              Tabel hasil lengkap datang di tahap berikutnya.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader className="items-center gap-2 text-center">
        <CardTitle className="font-heading text-xl">
          Belum ada resep
        </CardTitle>
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