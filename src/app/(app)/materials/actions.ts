"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type MaterialFormError = {
  field?:
    | "name"
    | "kind"
    | "buy_unit"
    | "notes"
    | "price"
    | "qty"
    | "unit"
    | "effective_at";
  message: string;
};

const schema = z.object({
  name: z.string().trim().min(1, "Nama bahan wajib diisi."),
  kind: z.enum(["raw", "packaging"]),
  buy_unit: z.string().trim().min(1, "Unit beli wajib dipilih."),
  notes: z.string().trim().max(500).optional(),
  price: z.string().trim().optional(),
  qty: z.string().trim().optional(),
  unit: z.string().trim().optional(),
  effective_at: z.string().trim().optional(),
});

function parsePositiveNumber(
  raw: string | undefined,
): { value?: number; error?: string } {
  if (raw === undefined || raw === "") return {};
  const n = Number(raw.replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return { error: "Angka tidak valid." };
  return { value: n };
}

export async function createMaterialAction(
  _prev: MaterialFormError | undefined,
  formData: FormData,
): Promise<MaterialFormError | undefined> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    kind: formData.get("kind"),
    buy_unit: formData.get("buy_unit"),
    notes: formData.get("notes") || undefined,
    price: formData.get("price") || undefined,
    qty: formData.get("qty") || undefined,
    unit: formData.get("unit") || undefined,
    effective_at: formData.get("effective_at") || undefined,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      field: issue.path[0] as MaterialFormError["field"],
      message: issue.message,
    };
  }

  const data = parsed.data;

  const price = parsePositiveNumber(data.price);
  if (price.error) return { field: "price", message: price.error };
  const qty = parsePositiveNumber(data.qty);
  if (qty.error) return { field: "qty", message: qty.error };

  const hasPrice = price.value !== undefined;
  const priceUnit = data.unit || data.buy_unit;
  const priceQty = qty.value ?? 1;
  if (hasPrice && priceQty <= 0) {
    return { field: "qty", message: "Qty harus lebih dari nol." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: material, error: materialError } = await supabase
    .from("materials")
    .insert({
      user_id: user.id,
      name: data.name,
      kind: data.kind,
      buy_unit: data.buy_unit,
      notes: data.notes || null,
    })
    .select("id")
    .single();

  if (materialError || !material) {
    return { message: "Gagal menyimpan bahan. Coba lagi." };
  }

  if (hasPrice) {
    const effective = data.effective_at
      ? new Date(`${data.effective_at}T00:00:00`).toISOString()
      : new Date().toISOString();

    const { error: priceError } = await supabase.from("material_prices").insert({
      material_id: material.id,
      price: price.value,
      qty: priceQty,
      unit: priceUnit,
      effective_at: effective,
    });

    if (priceError) {
      return { message: "Bahan tersimpan, tetapi gagal menyimpan harga." };
    }
  }

  revalidatePath("/materials");
  redirect("/materials");
}