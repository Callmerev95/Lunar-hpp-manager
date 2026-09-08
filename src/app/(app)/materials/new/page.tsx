import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Bahan baru - Catatan HPP",
};

export default function NewMaterialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Bahan baru</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Formulir lengkap datang di tahap berikutnya.
        </p>
      </div>
      <Card className="border-dashed">
        <CardHeader className="gap-2">
          <CardTitle className="font-heading text-xl">
            Formulir menyusul
          </CardTitle>
          <CardDescription>
            Sementara ini cek halaman Bahan untuk daftar yang sudah tersimpan.
          </CardDescription>
          <div className="mt-2">
            <Button asChild variant="outline">
              <Link href="/materials">Kembali ke Bahan</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}