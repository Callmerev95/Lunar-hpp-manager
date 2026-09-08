"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isConvertible } from "@/lib/costing/unit";

export type RecipeFormError = {
  field?: "name" | "output_qty" | "output_unit" | "margin_pct" | "items";
  message: string;
};

const materialLine = z.object({
  material_id: z.string().uuid("Bahan tidak valid."),
  qty: z.number().positive("Qty harus lebih dari nol."),
  unit: z.string().min(1, "Unit wajib dipilih."),
});

const schema = z.object({
  name: z.string().trim().min(1, "Nama resep wajib diisi."),
  output_qty: z.number().positive("Hasil harus lebih dari nol."),
  output_unit: z.string().trim().min(1, "Unit hasil wajib diisi."),
  margin_pct: z.number().min(0, "Margin tidak boleh negatif."),
  notes: z.string().trim().max(500).optional(),
  items: z.array(materialLine).min(1, "Tambahkan minimal satu bahan."),
});

function num(formData: FormData, key: string): number {
  return Number(String(formData.get(key) ?? "").replace(",", "."));
}

export async function createRecipeAction(
  _prev: RecipeFormError | undefined,
  formData: FormData,
): Promise<RecipeFormError | undefined> {
  const items: z.infer<typeof materialLine>[] = [];
  const rawItems = String(formData.get("items") ?? "[]");
  try {
    const parsedItems = JSON.parse(rawItems);
    if (!Array.isArray(parsedItems)) throw new Error("bukan array");
    for (const item of parsedItems) {
      items.push({
        material_id: String(item.material_id),
        qty: Number(item.qty),
        unit: String(item.unit),
      });
    }
  } catch {
    return { field: "items", message: "Data bahan tidak valid." };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    output_qty: num(formData, "output_qty"),
    output_unit: formData.get("output_unit"),
    margin_pct: formData.get("margin_pct") === "" ? 30 : num(formData, "margin_pct"),
    notes: formData.get("notes") || undefined,
    items,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      field: issue.path[0] as RecipeFormError["field"],
      message: issue.message,
    };
  }
  const data = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // validasi kepemilikan bahan + dimensi unit harga
  const materialIds = [...new Set(data.items.map((i) => i.material_id))];
  const { data: materials } = await supabase
    .from("materials")
    .select("id, name, buy_unit")
    .in("id", materialIds);
  const { data: prices } = await supabase
    .from("material_prices")
    .select("material_id, unit")
    .in("material_id", materialIds);

  const ownedIds = new Set((materials ?? []).map((m) => m.id));
  const priceUnits = new Map<string, string>();
  for (const p of prices ?? []) {
    if (!priceUnits.has(p.material_id)) priceUnits.set(p.material_id, p.unit);
  }

  for (const item of data.items) {
    if (!ownedIds.has(item.material_id)) {
      return { field: "items", message: "Ada bahan yang tidak ditemukan." };
    }
    const priceUnit = priceUnits.get(item.material_id);
    if (!priceUnit) {
      const m = (materials ?? []).find((m) => m.id === item.material_id);
      return {
        field: "items",
        message: `${m?.name ?? "Bahan"} belum punya harga. Tambahkan harga dulu di halaman Bahan.`,
      };
    }
    if (!isConvertible(priceUnit, item.unit)) {
      const m = (materials ?? []).find((m) => m.id === item.material_id);
      return {
        field: "items",
        message: `${m?.name ?? "Bahan"} dihargai per ${priceUnit}, tidak bisa dipakai dalam ${item.unit}.`,
      };
    }
  }

  const { data: recipe, error: recipeError } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
      name: data.name,
      output_qty: data.output_qty,
      output_unit: data.output_unit,
      margin_pct: data.margin_pct,
      notes: data.notes || null,
    })
    .select("id")
    .single();

  if (recipeError || !recipe) {
    return { message: "Gagal menyimpan resep. Coba lagi." };
  }

  const { error: itemsError } = await supabase.from("recipe_materials").insert(
    data.items.map((item, i) => ({
      recipe_id: recipe.id,
      material_id: item.material_id,
      qty: item.qty,
      unit: item.unit,
      sort_order: i,
    })),
  );

  if (itemsError) {
    await supabase.from("recipes").delete().eq("id", recipe.id);
    return { message: "Gagal menyimpan bahan resep. Coba lagi." };
  }

  revalidatePath("/");
  revalidatePath("/materials");
  redirect(`/recipes/${recipe.id}`);
}

export async function deleteRecipeAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  await supabase.from("recipes").delete().eq("id", id);
  revalidatePath("/");
  redirect("/");
}

export async function updateMarginAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  const margin = num(formData, "margin_pct");
  if (!Number.isFinite(margin) || margin < 0) return;

  const supabase = await createClient();
  await supabase.from("recipes").update({ margin_pct: margin }).eq("id", id);
  revalidatePath(`/recipes/${id}`);
}