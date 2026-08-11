import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/features/auth/lib/safe-next-path";

describe("safeNextPath", () => {
  it("returns / when value is missing", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath(undefined)).toBe("/");
    expect(safeNextPath("")).toBe("/");
  });

  it("keeps an internal path", () => {
    expect(safeNextPath("/tickets")).toBe("/tickets");
    expect(safeNextPath("/events/abc/checkout")).toBe("/events/abc/checkout");
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeNextPath("//evil.example")).toBe("/");
    expect(safeNextPath("https://evil.example")).toBe("/");
    expect(safeNextPath("/ok?redirect=https://evil.example")).toBe("/");
  });
});
