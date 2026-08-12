import { describe, expect, it } from "vitest";
import {
  centsToReaisFilterInput,
  dateInputToFromIso,
  dateInputToToIso,
  dateInputValue,
  hasAdvancedFilters,
  parseAdvancedFilters,
  reaisFilterToCents,
} from "@/features/events/advanced-filters";

describe("advanced-filters", () => {
  it("parses URL params", () => {
    const params = new URLSearchParams(
      "from=2026-09-01&priceMin=1000&venue=Arena",
    );
    expect(parseAdvancedFilters(params)).toEqual({
      from: "2026-09-01",
      priceMin: 1000,
      venue: "Arena",
    });
  });

  it("ignores invalid price params", () => {
    const params = new URLSearchParams("priceMin=abc&priceMax=-10&priceMin2=1");
    expect(parseAdvancedFilters(params)).toEqual({});
  });

  it("trims empty venue and dates", () => {
    const params = new URLSearchParams("from=%20&venue=%20&to=2026-10-01");
    expect(parseAdvancedFilters(params)).toEqual({ to: "2026-10-01" });
  });

  it("detects active filters", () => {
    expect(hasAdvancedFilters({})).toBe(false);
    expect(hasAdvancedFilters({ venue: "X" })).toBe(true);
    expect(hasAdvancedFilters({ priceMin: 0 })).toBe(true);
  });

  it("converts reais to cents", () => {
    expect(reaisFilterToCents("35,50")).toBe(3550);
    expect(reaisFilterToCents("10")).toBe(1000);
    expect(reaisFilterToCents("")).toBeUndefined();
    expect(reaisFilterToCents("-1")).toBeNull();
    expect(reaisFilterToCents("abc")).toBeNull();
  });

  it("formats cents for filter inputs", () => {
    expect(centsToReaisFilterInput(undefined)).toBe("");
    expect(centsToReaisFilterInput(3550)).toBe("35,50");
  });

  it("builds day bounds from date input", () => {
    expect(dateInputToFromIso("2026-09-01")).toMatch(/2026-09-0/);
    expect(dateInputToToIso("2026-09-01")).toMatch(/2026-09-0/);
    expect(dateInputToFromIso("")).toBeUndefined();
    expect(dateInputToFromIso("not-a-date")).toBeUndefined();
  });

  it("normalizes date input values", () => {
    expect(dateInputValue(undefined)).toBe("");
    expect(dateInputValue("2026-09-01")).toBe("2026-09-01");
    expect(dateInputValue("2026-09-01T15:00:00.000Z")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dateInputValue("invalid")).toBe("");
  });
});
