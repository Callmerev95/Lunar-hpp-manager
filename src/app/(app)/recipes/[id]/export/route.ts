import { type NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx-js-style";
import { createClient } from "@/lib/supabase/server";
import { calculateRecipeCost } from "@/lib/costing/recipe";

type RecipeForExport = {
  id: string;
  name: string;
  output_qty: number;
  output_unit: string;
  margin_pct: number;
};

type Cell = string | number;
type Row = { cells: Cell[]; style?: "title" | "meta" | "thead" | "tbody" | "warn" | "total" | "highlight" };

const CARAMEL = "FF7B5138";
const CREAM = "FFFFF6EC";
const SOFT = "FFF3E5D5";
const GREY = "FF8A8378";
const BORDER = { style: "thin", color: { rgb: "FFD9CFC2" } } as const;

function styleFor(kind: Row["style"], col: number): XLSX.CellStyle {
  switch (kind) {
    case "title":
      return {
        font: { bold: true, sz: 14, color: { rgb: CARAMEL } },
        alignment: { horizontal: "left", vertical: "center" },
      };
    case "meta":
      return {
        font: { sz: 11, color: { rgb: GREY } },
        alignment: { horizontal: "left", vertical: "center" },
      };
    case "thead":
      return {
        font: { bold: true, color: { rgb: CREAM } },
        fill: { fgColor: { rgb: CARAMEL } },
        alignment: { horizontal: col >= 1 && col <= 4 ? "right" : "left", vertical: "center" },
        border: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
      };
    case "tbody":
      return {
        alignment: { horizontal: col === 0 || col === 5 ? "left" : "right", vertical: "center" },
        border: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
        numFmt: col === 1 ? "#,##0.##" : col === 3 || col === 4 ? "#,##0" : undefined,
      };
    case "warn":
      return {
        font: { italic: true, color: { rgb: GREY } },
        alignment: { horizontal: "left", vertical: "center" },
        border: { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER },
      };
    case "total":
      return {
        font: { bold: true },
        alignment: {
          horizontal: col === 4 ? "right" : "left",
          vertical: "center",
        },
        numFmt: col === 4 ? "#,##0.##" : undefined,
      };
    case "highlight":
      return {
        font: { bold: true, color: { rgb: CARAMEL } },
        fill: { fgColor: { rgb: SOFT } },
        alignment: {
          horizontal: col === 4 ? "right" : "left",
          vertical: "center",
        },
        numFmt: col === 4 ? "#,##0.##" : undefined,
      };
    default:
      return {};
  }
}

function buildRows(
  recipe: RecipeForExport,
  cost: ReturnType<typeof calculateRecipeCost>,
  materialNameById: Map<string, string>,
): Row[] {
  const rows: Row[] = [
    { cells: [recipe.name], style: "title" },
    {
      cells: [
        `Hasil: ${recipe.output_qty} ${recipe.output_unit} · Margin: ${recipe.margin_pct}% · HPP memakai harga bahan terbaru`,
      ],
      style: "meta",
    },
    { cells: [] },
    {
      cells: ["Bahan", "Qty", "Unit", "Harga satuan", "Subtotal", "Jenis"],
      style: "thead",
    },
    ...cost.items.map(
      (item): Row => ({
        cells: [
          item.name,
          item.qty,
          item.unit,
          item.unitCost,
          item.cost,
          item.kind === "packaging" ? "Kemasan" : "Bahan baku",
        ],
        style: "tbody",
      }),
    ),
    ...cost.unresolvedUnits.map(
      (u): Row => ({
        cells: [
          materialNameById.get(u.materialId) ?? "Bahan",
          "",
          u.unit,
          "belum ada harga",
          "",
          "",
        ],
        style: "warn",
      }),
    ),
    { cells: [] },
    { cells: ["Total bahan baku", "", "", "", cost.totalMaterials], style: "total" },
    { cells: ["Total kemasan", "", "", "", cost.totalPackaging], style: "total" },
    { cells: ["HPP total", "", "", "", cost.totalCost], style: "total" },
    {
      cells: [`HPP per ${recipe.output_unit}`, "", "", "", cost.perUnit],
      style: "highlight",
    },
    {
      cells: ["Harga jual saran", "", "", "", cost.suggestedPrice],
      style: "highlight",
    },
  ];
  return rows;
}

function buildXlsx(rows: Row[]): Uint8Array {
  const maxCols = Math.max(...rows.map((r) => r.cells.length), 6);
  const aoa: (Cell | null)[][] = rows.map((r) => {
    const padded = [...r.cells];
    while (padded.length < maxCols) padded.push("");
    return padded;
  });
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  rows.forEach((row, ri) => {
    for (let ci = 0; ci < maxCols; ci++) {
      const addr = XLSX.utils.encode_cell({ r: ri, c: ci });
      if (!ws[addr]) ws[addr] = { t: "s", v: "" };
      if (row.style) (ws[addr] as XLSX.CellObject).s = styleFor(row.style, ci);
    }
  });

  ws["!cols"] = [
    { wch: 26 },
    { wch: 10 },
    { wch: 9 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
  ];

  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "HPP");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return new Uint8Array(buf);
}

function csvCell(v: Cell): string {
  if (typeof v === "number") {
    return v.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return /[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function buildCsv(rows: Row[]): string {
  const lines = rows
    .filter((r) => r.cells.length > 0)
    .map((r) => r.cells.map(csvCell).join(";"));
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

  const [{ data: recipe }, { data: recipeMaterials }, { data: materials }, { data: prices }] =
    await Promise.all([
      supabase
        .from("recipes")
        .select("id, name, output_qty, output_unit, margin_pct")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("recipe_materials")
        .select("id, recipe_id, material_id, qty, unit, sort_order")
        .eq("recipe_id", id),
      supabase.from("materials").select("id, name, kind, buy_unit"),
      supabase
        .from("material_prices")
        .select("id, material_id, price, qty, unit, effective_at"),
    ]);

  if (!recipe) {
    return NextResponse.json(
      { error: "Resep tidak ditemukan." },
      { status: 404 },
    );
  }

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

  return new NextResponse(new Uint8Array(buildXlsx(rows)), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="hpp-${slug}.xlsx"`,
    },
  });
}