import { type NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";
import { calculateRecipeCost } from "@/lib/costing/recipe";

type RecipeForExport = {
  id: string;
  name: string;
  output_qty: number;
  output_unit: string;
  margin_pct: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function buildRows(
  recipe: RecipeForExport,
  cost: ReturnType<typeof calculateRecipeCost>,
  materialNameById: Map<string, string>,
): (string | number)[][] {
  return [
    ["Nama resep", recipe.name],
    ["Hasil", recipe.output_qty],
    ["Unit hasil", recipe.output_unit],
    ["Margin (%)", recipe.margin_pct],
    [],
    ["Bahan", "Qty", "Unit", "Harga satuan", "Subtotal", "Jenis"],
    ...cost.items.map((item) => [
      item.name,
      round2(item.qty),
      item.unit,
      round2(item.unitCost),
      round2(item.cost),
      item.kind === "packaging" ? "Kemasan" : "Bahan baku",
    ]),
    ...cost.unresolvedUnits.map((u) => [
      materialNameById.get(u.materialId) ?? "Bahan",
      "",
      u.unit,
      "belum ada harga",
      "",
      "",
    ]),
    [],
    ["Total bahan baku", round2(cost.totalMaterials)],
    ["Total kemasan", round2(cost.totalPackaging)],
    ["HPP total", round2(cost.totalCost)],
    [`HPP per ${recipe.output_unit}`, round2(cost.perUnit)],
    ["Harga jual saran", round2(cost.suggestedPrice)],
  ];
}

function buildXlsxBuffer(
  rows: (string | number)[][],
): Uint8Array {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 28 }, { wch: 10 }, { wch: 8 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "HPP");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return new Uint8Array(buf);
}

function csvCell(v: string | number): string {
  if (typeof v === "number") {
    return v.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return /[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function buildCsv(rows: (string | number)[][]): string {
  const lines = rows.map((r) => r.map(csvCell).join(";"));
  return "\uFEFF" + lines.join("\n");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const format = request.nextUrl.searchParams.get("format") ?? "xlsx";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  }

  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, name, output_qty, output_unit, margin_pct")
    .eq("id", id)
    .maybeSingle();

  if (!recipe) {
    return NextResponse.json(
      { error: "Resep tidak ditemukan." },
      { status: 404 },
    );
  }

  const { data: recipeMaterials } = await supabase
    .from("recipe_materials")
    .select("id, recipe_id, material_id, qty, unit, sort_order")
    .eq("recipe_id", id);
  const { data: materials } = await supabase
    .from("materials")
    .select("id, name, kind, buy_unit");
  const { data: prices } = await supabase
    .from("material_prices")
    .select("id, material_id, price, qty, unit, effective_at");

  const cost = calculateRecipeCost({
    recipe,
    materials: materials ?? [],
    recipeMaterials: recipeMaterials ?? [],
    prices: prices ?? [],
  });

  const materialNameById = new Map(
    (materials ?? []).map((m) => [m.id as string, m.name as string]),
  );
  const rows = buildRows(recipe, cost, materialNameById);

  const slug =
    recipe.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "resep";

  if (format === "csv") {
    return new NextResponse(buildCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="hpp-${slug}.csv"`,
      },
    });
  }

  return new NextResponse(new Uint8Array(buildXlsxBuffer(rows)), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="hpp-${slug}.xlsx"`,
    },
  });
}