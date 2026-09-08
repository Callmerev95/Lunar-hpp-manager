import { describe, expect, it } from "vitest";
import {
  conversionFactor,
  isConvertible,
  normalizeUnit,
} from "./unit";

describe("conversionFactor", () => {
  it("mengembalikan 1 untuk unit identik", () => {
    expect(conversionFactor("kg", "kg")).toBe(1);
    expect(conversionFactor("ml", "ml")).toBe(1);
  });

  it("mengonversi dalam satu dimensi massa", () => {
    expect(conversionFactor("kg", "gram")).toBe(1000);
    expect(conversionFactor("gram", "kg")).toBe(0.001);
    expect(conversionFactor("g", "gram")).toBe(1);
  });

  it("mengonversi dalam satu dimensi volume", () => {
    expect(conversionFactor("liter", "ml")).toBe(1000);
    expect(conversionFactor("ml", "liter")).toBe(0.001);
  });

  it("mengembalikan undefined antar dimensi berbeda", () => {
    expect(conversionFactor("kg", "ml")).toBeUndefined();
    expect(conversionFactor("gram", "pcs")).toBeUndefined();
  });

  it("mengembalikan undefined untuk unit tak dikenal", () => {
    expect(conversionFactor("kg", "lonceng")).toBeUndefined();
    expect(conversionFactor("porsi", "kg")).toBeUndefined();
  });
});

describe("isConvertible", () => {
  it("benar untuk unit sedimensi", () => {
    expect(isConvertible("kg", "gram")).toBe(true);
    expect(isConvertible("L", "ml")).toBe(true);
  });

  it("salah untuk unit beda dimensi", () => {
    expect(isConvertible("kg", "L")).toBe(false);
    expect(isConvertible("gram", "pcs")).toBe(false);
  });

  it("benar untuk unit tak dikenal bila sama persis", () => {
    expect(isConvertible("porsi", "porsi")).toBe(true);
  });
});

describe("normalizeUnit", () => {
  it("meratakan alias umum", () => {
    expect(normalizeUnit("gr")).toBe("g");
    expect(normalizeUnit("Gram")).toBe("g");
    expect(normalizeUnit("L")).toBe("L");
    expect(normalizeUnit("liter")).toBe("L");
    expect(normalizeUnit("mililiter")).toBe("ml");
  });

  it("mengembalikan unit tak dikenal apa adanya", () => {
    expect(normalizeUnit("bungkus")).toBe("bungkus");
  });
});