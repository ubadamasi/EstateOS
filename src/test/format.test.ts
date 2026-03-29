import { describe, it, expect } from "vitest";
import { formatNaira, nairaToKobo, DOUBLE_CONFIRM_THRESHOLD_KOBO } from "@/lib/format";

describe("formatNaira", () => {
  it("formats whole naira amounts", () => {
    expect(formatNaira(2_500_000)).toBe("₦25,000");
    expect(formatNaira(100)).toBe("₦1");
    expect(formatNaira(0)).toBe("₦0");
  });

  it("formats amounts with kobo remainder", () => {
    expect(formatNaira(150)).toBe("₦1.50");
    expect(formatNaira(101)).toBe("₦1.01");
  });

  it("formats negative amounts (corrections)", () => {
    expect(formatNaira(-2_500_000)).toBe("-₦25,000");
  });

  it("formats large amounts with commas", () => {
    expect(formatNaira(325_000_000)).toBe("₦3,250,000");
  });
});

describe("nairaToKobo", () => {
  it("converts naira string to kobo", () => {
    expect(nairaToKobo("25000")).toBe(2_500_000);
    expect(nairaToKobo("25,000")).toBe(2_500_000);
    expect(nairaToKobo("1")).toBe(100);
  });

  it("handles decimal naira", () => {
    expect(nairaToKobo("1.50")).toBe(150);
  });

  it("throws on invalid input", () => {
    expect(() => nairaToKobo("abc")).toThrow();
  });
});

describe("DOUBLE_CONFIRM_THRESHOLD_KOBO", () => {
  it("is ₦200,000 in kobo", () => {
    expect(DOUBLE_CONFIRM_THRESHOLD_KOBO).toBe(20_000_000);
  });
});
