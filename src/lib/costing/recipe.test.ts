import { describe, expect, it } from "vitest";
import { latestPrices, pricePerUnit } from "./prices";
import type { PriceRow } from "./prices";
import { calculateRecipeCost } from "./recipe";
import type { RecipeRow } from "./recipe";

const material = (id: string, name: string, kind: "raw" | "packaging" = "raw") =>
  ({ id, name, kind, buy_unit: "" });

const price = (
  materialId: string,
  price: number,
  qty: number,
  unit: string,
  effective: string,
): PriceRow => ({
  id: `${materialId}-${effective}`,
  material_id: materialId,
  price,
  qty,
  unit,
  effective_at: effective,
});

describe("latestPrices", () => {
  it("memilih harga dengan effective_at terakhir per bahan", () => {
    const rows = [
      price("m1", 10000, 1, "kg", "2026-01-01"),
      price("m1", 12000, 1, "kg", "2026-06-01"),
      price("m2", 5000, 1, "kg", "2026-03-01"),
    ];
    const latest = latestPrices(rows);
    expect(latest.get("m1")?.price).toBe(12000);
    expect(latest.get("m2")?.price).toBe(5000);
  });

  it("menangani bahan tanpa harga", () => {
    expect(latestPrices([]).size).toBe(0);
  });
});

describe("pricePerUnit", () => {
  it("harga per kg ke per gram", () => {
    const p = price("m1", 12000, 1, "kg", "2026-01-01");
    expect(pricePerUnit(p, "gram")).toBe(12);
  });

  it("harga per 500g ke per gram", () => {
    const p = price("m1", 10000, 500, "g", "2026-01-01");
    expect(pricePerUnit(p, "gram")).toBe(20);
  });

  it("undefined bila unit tidak sedimensi", () => {
    const p = price("m1", 12000, 1, "kg", "2026-01-01");
    expect(pricePerUnit(p, "pcs")).toBeUndefined();
  });

  it("undefined bila qty nol", () => {
    const p = price("m1", 12000, 0, "kg", "2026-01-01");
    expect(pricePerUnit(p, "gram")).toBeUndefined();
  });
});

describe("calculateRecipeCost", () => {
  const recipe: RecipeRow = {
    id: "r1",
    name: "Brownies",
    output_qty: 12,
    output_unit: "porsi",
    margin_pct: 30,
  };

  it("menghitung total, per unit, dan harga jual saran", () => {
    const result = calculateRecipeCost({
      recipe,
      materials: [
        material("m-tepung", "Tepung"),
        material("m-telur", "Telur"),
      ],
      recipeMaterials: [
        {
          id: "rm1",
          recipe_id: "r1",
          material_id: "m-tepung",
          qty: 250,
          unit: "gram",
          sort_order: 0,
        },
        {
          id: "rm2",
          recipe_id: "r1",
          material_id: "m-telur",
          qty: 4,
          unit: "pcs",
          sort_order: 1,
        },
      ],
      prices: [
        price("m-tepung", 15000, 1, "kg", "2026-01-01"),
        price("m-telur", 2000, 1, "pcs", "2026-01-01"),
      ],
    });

    expect(result.totalCost).toBeCloseTo(11750);
    expect(result.totalMaterials).toBeCloseTo(11750);
    expect(result.totalPackaging).toBe(0);
    expect(result.perUnit).toBeCloseTo(979.17, 2);
    expect(result.suggestedPrice).toBeCloseTo(1272.92, 2);
    expect(result.marginPct).toBe(30);
    expect(result.unresolvedUnits).toHaveLength(0);
  });

  it("memisahkan packaging dari bahan baku", () => {
    const result = calculateRecipeCost({
      recipe,
      materials: [
        material("m-tepung", "Tepung"),
        material("m-box", "Box", "packaging"),
      ],
      recipeMaterials: [
        {
          id: "rm1",
          recipe_id: "r1",
          material_id: "m-tepung",
          qty: 250,
          unit: "gram",
          sort_order: 0,
        },
        {
          id: "rm2",
          recipe_id: "r1",
          material_id: "m-box",
          qty: 12,
          unit: "pcs",
          sort_order: 1,
        },
      ],
      prices: [
        price("m-tepung", 15000, 1, "kg", "2026-01-01"),
        price("m-box", 500, 1, "pcs", "2026-01-01"),
      ],
    });

    expect(result.totalMaterials).toBeCloseTo(3750);
    expect(result.totalPackaging).toBe(6000);
    expect(result.totalCost).toBeCloseTo(9750);
  });

  it("tidak menghitung bahan tanpa harga, mencatat unresolved", () => {
    const result = calculateRecipeCost({
      recipe,
      materials: [material("m-tepung", "Tepung")],
      recipeMaterials: [
        {
          id: "rm1",
          recipe_id: "r1",
          material_id: "m-tepung",
          qty: 250,
          unit: "gram",
          sort_order: 0,
        },
      ],
      prices: [],
    });

    expect(result.totalCost).toBe(0);
    expect(result.items).toHaveLength(0);
    expect(result.unresolvedUnits).toEqual([
      { materialId: "m-tepung", unit: "gram" },
    ]);
  });

  it("output_qty nol menghasilkan perUnit 0 tanpa crash", () => {
    const result = calculateRecipeCost({
      recipe: { ...recipe, output_qty: 0 },
      materials: [material("m-tepung", "Tepung")],
      recipeMaterials: [
        {
          id: "rm1",
          recipe_id: "r1",
          material_id: "m-tepung",
          qty: 250,
          unit: "gram",
          sort_order: 0,
        },
      ],
      prices: [price("m-tepung", 15000, 1, "kg", "2026-01-01")],
    });

    expect(result.perUnit).toBe(0);
    expect(result.suggestedPrice).toBe(0);
  });

  it("mengurutkan item sesuai sort_order", () => {
    const result = calculateRecipeCost({
      recipe,
      materials: [
        material("m-a", "Bahan A"),
        material("m-b", "Bahan B"),
      ],
      recipeMaterials: [
        {
          id: "rm2",
          recipe_id: "r1",
          material_id: "m-b",
          qty: 1,
          unit: "pcs",
          sort_order: 1,
        },
        {
          id: "rm1",
          recipe_id: "r1",
          material_id: "m-a",
          qty: 1,
          unit: "pcs",
          sort_order: 0,
        },
      ],
      prices: [
        price("m-a", 1000, 1, "pcs", "2026-01-01"),
        price("m-b", 2000, 1, "pcs", "2026-01-01"),
      ],
    });

    expect(result.items.map((i) => i.name)).toEqual(["Bahan A", "Bahan B"]);
  });
});