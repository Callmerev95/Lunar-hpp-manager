"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteMaterialAction, type DeleteResult } from "@/app/(app)/materials/actions";

export function DeleteMaterialButton({
  materialId,
  materialName,
}: {
  materialId: string;
  materialName: string;
}) {
  const [result, formAction, pending] = useActionState<
    DeleteResult | undefined,
    FormData
  >(deleteMaterialAction, undefined);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-destructive">
          Hapus bahan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading">Hapus “{materialName}”?</DialogTitle>
          <DialogDescription>
            Riwayat harganya juga akan terhapus. Bahan yang dipakai di resep
            tidak bisa dihapus sebelum dikeluarkan dari resepnya.
          </DialogDescription>
        </DialogHeader>
        {result && !result.ok ? (
          <p role="alert" className="text-sm text-destructive">
            {result.message}
          </p>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Batal
            </Button>
          </DialogClose>
          <form action={formAction}>
            <input type="hidden" name="id" value={materialId} />
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Menghapus..." : "Ya, hapus"}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}