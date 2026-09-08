import { conversionFactor, type Unit } from "./unit";

export type PriceRow = {
  id: string;
  material_id: string;
  price: number;
  qty: number;
  unit: string;
  effective_at: string;
};

/**
 * Memilih harga terakhir per bahan berdasarkan effective_at.
 * Harga dengan tanggal paling akhir menang.
 */
export function latestPrices(prices: PriceRow[]): Map<string, PriceRow> {
  const byMaterial = new Map<string, PriceRow>();
  for (const p of prices) {
    const current = byMaterial.get(p.material_id);
    if (!current || p.effective_at >= current.effective_at) {
      byMaterial.set(p.material_id, p);
    }
  }
  return byMaterial;
}

/**
 * Harga per satu satuan unitTarget.
 * Beli: price untuk qty dalam unit beli, lalu dikonversi ke unit target.
 * Contoh: Rp 12.000 / 1 kg -> per gram = 12.000 / (1 * 1000) = Rp 12.
 */
export function pricePerUnit(
  priceRow: PriceRow,
  unitTarget: Unit,
): number | undefined {
  const factor = conversionFactor(priceRow.unit, unitTarget);
  if (factor === undefined) return undefined;
  if (priceRow.qty <= 0) return undefined;
  return priceRow.price / (priceRow.qty * factor);
}