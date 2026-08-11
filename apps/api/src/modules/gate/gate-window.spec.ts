import { gateOpensAt, isGateOpen } from "./gate-window";

describe("gate-window", () => {
  const startsAt = new Date("2026-09-01T20:00:00.000Z");

  it("opens N hours before start", () => {
    expect(gateOpensAt(startsAt, 2).toISOString()).toBe(
      "2026-09-01T18:00:00.000Z",
    );
  });

  it("treats 0 as opening at start", () => {
    expect(gateOpensAt(startsAt, 0).getTime()).toBe(startsAt.getTime());
  });

  it("is closed before the window and open at/after it", () => {
    expect(isGateOpen(startsAt, 2, new Date("2026-09-01T17:59:59.000Z"))).toBe(
      false,
    );
    expect(isGateOpen(startsAt, 2, new Date("2026-09-01T18:00:00.000Z"))).toBe(
      true,
    );
    expect(isGateOpen(startsAt, 2, new Date("2026-09-01T21:00:00.000Z"))).toBe(
      true,
    );
  });

  it("is always open when there is no hour limit", () => {
    expect(
      isGateOpen(startsAt, null, new Date("2020-01-01T00:00:00.000Z")),
    ).toBe(true);
  });
});
