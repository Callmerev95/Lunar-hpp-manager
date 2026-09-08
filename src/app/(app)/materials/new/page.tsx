import { MaterialForm } from "@/components/materials/material-form";

export const metadata = {
  title: "Bahan baru - Catatan HPP",
};

export default function NewMaterialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Tambah bahan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Simpan bahan atau kemasan yang sering kamu pakai.
        </p>
      </div>
      <MaterialForm mode="create" />
    </div>
  );
}