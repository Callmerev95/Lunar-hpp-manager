import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MaterialForm } from "@/components/materials/material-form";
import { PriceHistoryCard } from "@/components/materials/price-history-card";
import { DeleteMaterialButton } from "@/components/materials/delete-material-button";

export const metadata = {
  title: "Ubah bahan - Catatan HPP",
};

export default async function EditMaterialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: material } = await supabase
    .from("materials")
    .select("id, name, kind, buy_unit, notes")
    .eq("id", id)
    .maybeSingle();

  if (!material) notFound();

  const { data: prices } = await supabase
    .from("material_prices")
    .select("id, material_id, price, qty, unit, effective_at")
    .eq("material_id", id)
    .order("effective_at", { ascending: false });

  const { count: usageCount } = await supabase
    .from("recipe_materials")
    .select("id", { count: "exact", head: true })
    .eq("material_id", id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Ubah bahan</h1>
          <p className="mt-1 text-sm text-muted-foreground">{material.name}</p>
        </div>
        <DeleteMaterialButton
          materialId={material.id}
          materialName={material.name}
        />
      </div>

      <MaterialForm mode="edit" initial={material} />

      <PriceHistoryCard
        materialId={material.id}
        buyUnit={material.buy_unit}
        prices={prices ?? []}
        usedInRecipes={usageCount !== null && usageCount > 0}
      />
    </div>
  );
}