import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecipeForm } from "@/components/recipes/recipe-form";

export const metadata = {
  title: "Ubah resep - Catatan HPP",
};

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, name, output_qty, output_unit, margin_pct, notes")
    .eq("id", id)
    .maybeSingle();

  if (!recipe) notFound();

  const { data: recipeMaterials } = await supabase
    .from("recipe_materials")
    .select("material_id, qty, unit, sort_order")
    .eq("recipe_id", id)
    .order("sort_order", { ascending: true });

  const { data: materials } = await supabase
    .from("materials")
    .select("id, name, kind, buy_unit")
    .order("name", { ascending: true });

  const { data: prices } = await supabase
    .from("material_prices")
    .select("id, material_id, price, qty, unit, effective_at");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Ubah resep</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Perubahan langsung menghitung ulang HPP.
        </p>
      </div>

      <RecipeForm
        mode="edit"
        materials={materials ?? []}
        prices={prices ?? []}
        initial={{
          recipe,
          items: (recipeMaterials ?? []).map((rm) => ({
            material_id: rm.material_id,
            qty: rm.qty,
            unit: rm.unit,
          })),
        }}
      />
    </div>
  );
}
