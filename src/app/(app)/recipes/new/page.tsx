import { createClient } from "@/lib/supabase/server";
import { RecipeForm } from "@/components/recipes/recipe-form";

export const metadata = {
  title: "Resep baru - Lunar HPP",
};

export default async function NewRecipePage() {
  const supabase = await createClient();
  const [{ data: materials }, { data: prices }] = await Promise.all([
    supabase
      .from("materials")
      .select("id, name, kind, buy_unit")
      .order("name", { ascending: true }),
    supabase
      .from("material_prices")
      .select("id, material_id, price, qty, unit, effective_at"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Resep baru</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Susun bahan resep, HPP dihitung otomatis.
        </p>
      </div>
      <RecipeForm materials={materials ?? []} prices={prices ?? []} />
    </div>
  );
}