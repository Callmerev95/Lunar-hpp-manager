export const UNIT_OPTIONS = ["gram", "kg", "ml", "liter", "pcs"] as const;

export type UnitOption = (typeof UNIT_OPTIONS)[number];

export const UNIT_LABELS: Record<UnitOption, string> = {
  gram: "gram",
  kg: "kg",
  ml: "ml",
  liter: "liter",
  pcs: "pcs",
};