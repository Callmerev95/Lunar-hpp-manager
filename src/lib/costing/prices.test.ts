import { describe, expect, it } from "vitest";
import { pricePerUnit } from "./prices";

describe("pricePerUnit", () => {
  describe("dengan satuan pcs", () => {
    it("harga per pcs ke pcs tetap", () => {
      const p = {
        id: "p1",
        material_id: "m1",
        price: 2500,
        qty: 1,
        unit: "pcs",
        effective_at: "2026-01-01",
      };
      expect(pricePerUnit(p, "pcs")).toBe(2500);
    });

    it("harga per 10 pcs ke per pcs", () => {
      const p = {
        id: "p1",
        material_id: "m1",
        price: 25000,
        qty: 10,
        unit: "pcs",
        effective_at: "2026-01-01",
      };
      expect(pricePerUnit(p, "pcs")).toBe(2500);
    });
  });
});