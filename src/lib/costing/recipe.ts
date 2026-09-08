import { latestPrices, pricePerUnit, type PriceRow } from "./prices";

export type MaterialKind = "raw" | "packaging";

export type MaterialRow = {
  id: string;
  name: string;
  kind: MaterialKind;
  buy_unit: string;
};

export type RecipeRow = {
  id: string;
  name: string;
  output_qty: number;
  output_unit: string;
  margin_pct: number;
};

export type RecipeMaterialRow = {
  id: string;
  recipe_id: string;
  material_id: string;
  qty: number;
  unit: string;
  sort_order: number;
};

export type CostItem = {
  materialId: string;
  name: string;
  kind: MaterialKind;
  unit: string;
  qty: number;
  buyDescription: string;
  unitCost: number;
  cost: number;
};

export type RecipeCost = {
  items: CostItem[];
  totalMaterials: number;
  totalPackaging: number;
  totalCost: number;
  perUnit: number;
  suggestedPrice: number;
  marginPct: number;
  unresolvedUnits: { materialId: string; unit: string }[];
};

type CalculateInput = {
  recipe: RecipeRow;
  materials: MaterialRow[];
  recipeMaterials: RecipeMaterialRow[];
  prices: PriceRow[];
};

/**
 * Menghitung HPP suatu resep.
 * - unit resep harus sedimensi dengan unit beli bahan
 * - item dengan unit tak ter-resolve masuk ke unresolvedUnits dan tidak dihitung
 */
export function calculateRecipeCost({
  recipe,
  materials,
  recipeMaterials,
  prices,
}: CalculateInput): RecipeCost {
  const latest = latestPrices(prices);
  const byId = new Map(materials.map((m) => [m.id, m]));
  const unresolvedUnits: RecipeCost["unresolvedUnits"] = [];

  let totalMaterials = 0;
  let totalPackaging = 0;

  const items = recipeMaterials
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((rm) => {
      const material = byId.get(rm.material_id);
      const price = latest.get(rm.material_id);
      if (!material || !price) {
        unresolvedUnits.push({ materialId: rm.material_id, unit: rm.unit });
        return null;
      }

      const unitCost = pricePerUnit(price, rm.unit);
      const qty = Number(rm.qty);
      if (unitCost === undefined || !Number.isFinite(qty) || qty < 0) {
        unresolvedUnits.push({ materialId: rm.material_id, unit: rm.unit });
        return null;
      }

      const cost = unitCost * qty;
      if (material.kind === "packaging") totalPackaging += cost;
      else totalMaterials += cost;

      return {
        materialId: material.id,
        name: material.name,
        kind: material.kind,
        unit: rm.unit,
        qty,
        buyDescription: `${price.price} / ${price.qty} ${price.unit}`,
        unitCost,
        cost,
      } satisfies CostItem;
    })
    .filter((item): item is CostItem => item !== null);

  const totalCost = totalMaterials + totalPackaging;
  const perUnit =
    recipe.output_qty > 0 ? totalCost / recipe.output_qty : 0;
  const suggestedPrice = perUnit * (1 + recipe.margin_pct / 100);

  return {
    items,
    totalMaterials,
    totalPackaging,
    totalCost,
    perUnit,
    suggestedPrice,
    marginPct: recipe.margin_pct,
    unresolvedUnits,
  };
}