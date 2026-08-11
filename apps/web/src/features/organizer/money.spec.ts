import { describe, expect, it } from "vitest";
import {
  centsToReaisInput,
  fromDatetimeLocal,
  reaisToCents,
  toDatetimeLocal,
} from "@/features/organizer/money";

describe("money", () => {
  it("parses reais with comma or dot", () => {
    expect(reaisToCents("32,00")).toBe(3200);
    expect(reaisToCents("16.5")).toBe(1650);
    expect(reaisToCents("-1")).toBeNull();
    expect(reaisToCents("abc")).toBeNull();
  });

  it("formats cents for the input", () => {
    expect(centsToReaisInput(3200)).toBe("32,00");
  });

  it("round-trips datetime-local values", () => {
    expect(toDatetimeLocal(null)).toBe("");
    expect(toDatetimeLocal("not-a-date")).toBe("");
    const local = toDatetimeLocal("2026-09-01T23:00:00.000Z");
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(fromDatetimeLocal(local)).toBe(new Date(local).toISOString());
    expect(fromDatetimeLocal("")).toBe("");
  });
});
