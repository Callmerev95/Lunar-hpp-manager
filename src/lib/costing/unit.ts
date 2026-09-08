export type Unit = string;

type UnitDef = {
  name: Unit;
  factor: number; // nilai per unit basis dimensi
};

type Dimension = {
  base: Unit;
  units: UnitDef[];
};

const MASS: Dimension = {
  base: "kg",
  units: [
    { name: "kg", factor: 1 },
    { name: "gram", factor: 1000 },
    { name: "g", factor: 1000 },
  ],
};

const VOLUME: Dimension = {
  base: "liter",
  units: [
    { name: "liter", factor: 1 },
    { name: "L", factor: 1 },
    { name: "l", factor: 1 },
    { name: "ml", factor: 1000 },
  ],
};

const COUNT: Dimension = {
  base: "pcs",
  units: [{ name: "pcs", factor: 1 }],
};

const DIMENSIONS: Dimension[] = [MASS, VOLUME, COUNT];

export function dimensionOf(unit: Unit): Dimension | undefined {
  return DIMENSIONS.find((d) => d.units.some((u) => u.name === unit));
}

export function isConvertible(from: Unit, to: Unit): boolean {
  if (from === to) return true;
  const d = dimensionOf(from);
  return d !== undefined && d.units.some((u) => u.name === to);
}

/**
 * Faktor yang mengalikan nilai dalam unit `from` agar setara di unit `to`.
 * Contoh: kg -> gram = 1000, ml -> liter = 0.001.
 * Mengembalikan undefined bila unit tidak sedimensi.
 */
export function conversionFactor(from: Unit, to: Unit): number | undefined {
  if (from === to) return 1;
  const fromDim = dimensionOf(from);
  const toDim = dimensionOf(to);
  if (fromDim === undefined || fromDim !== toDim) return undefined;

  const fromDef = fromDim.units.find((u) => u.name === from);
  const toDef = fromDim.units.find((u) => u.name === to);
  if (!fromDef || !toDef) return undefined;

  // basis (kg) = value * factor ; probe per unit basis
  const perBasisFrom = 1 / fromDef.factor;
  return perBasisFrom * toDef.factor;
}

export function normalizeUnit(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  const alias: Record<string, string> = {
    gr: "g",
    kg: "kg",
    gram: "g",
    grams: "g",
    liter: "L",
    litre: "L",
    l: "L",
    ml: "ml",
    mililiter: "ml",
    pcs: "pcs",
    porsi: "porsi",
  };
  return alias[trimmed] ?? trimmed;
}