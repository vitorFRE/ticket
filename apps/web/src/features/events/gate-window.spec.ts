import { describe, expect, it } from "vitest";
import {
  gateHoursLabel,
  gateLimitNotice,
  gateOpensAtIso,
  isGateOpen,
  parseGateHours,
} from "@/features/events/gate-window";

describe("gate-window", () => {
  it("parses whole hours in 0–48", () => {
    expect(parseGateHours("2")).toBe(2);
    expect(parseGateHours("0")).toBe(0);
    expect(parseGateHours("48")).toBe(48);
    expect(parseGateHours("2.5")).toBeNull();
    expect(parseGateHours("49")).toBeNull();
    expect(parseGateHours("")).toBeNull();
  });

  it("computes open time and window", () => {
    const startsAt = "2026-09-01T20:00:00.000Z";
    expect(gateOpensAtIso(startsAt, 2)).toBe("2026-09-01T18:00:00.000Z");
    expect(isGateOpen(startsAt, 2, new Date("2026-09-01T17:59:59.000Z"))).toBe(
      false,
    );
    expect(isGateOpen(startsAt, 2, new Date("2026-09-01T18:00:00.000Z"))).toBe(
      true,
    );
    expect(
      isGateOpen(startsAt, null, new Date("2020-01-01T00:00:00.000Z")),
    ).toBe(true);
  });

  it("labels hours", () => {
    expect(gateHoursLabel(null)).toBe("sem limite");
    expect(gateHoursLabel(0)).toBe("no horário do evento");
    expect(gateHoursLabel(1)).toBe("1h antes");
    expect(gateHoursLabel(2)).toBe("2h antes");
  });

  it("writes a public notice only when there is a limit", () => {
    expect(gateLimitNotice(null)).toBeNull();
    expect(gateLimitNotice(0)).toBe("Portaria no horário do evento");
    expect(gateLimitNotice(1)).toBe("Portaria abre 1h antes");
    expect(gateLimitNotice(2)).toBe("Portaria abre 2h antes");
  });
});
