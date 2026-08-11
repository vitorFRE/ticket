import { describe, expect, it } from "vitest";
import {
  formatCountdown,
  reservationLineItems,
  reservationTotalCents,
} from "@/features/reservations/reservation-summary";
import { makeReservation } from "@/test/fixtures";

describe("reservation-summary", () => {
  it("joins seat labels", () => {
    const reservation = makeReservation({
      items: [
        {
          id: "i1",
          quantity: null,
          seat: {
            id: "s1",
            label: "A1",
            row: "A",
            number: 1,
            status: "HELD",
          },
          sector: null,
        },
        {
          id: "i2",
          quantity: null,
          seat: {
            id: "s2",
            label: "A2",
            row: "A",
            number: 2,
            status: "HELD",
          },
          sector: null,
        },
      ],
    });
    expect(reservationLineItems(reservation)).toBe("A1, A2");
    expect(reservationTotalCents(reservation)).toBe(6400);
  });

  it("formats sector lines as Name x qty and uses sector price", () => {
    const reservation = makeReservation({
      event: {
        id: "evt-2",
        title: "Show seed",
        venue: "Allianz",
        startsAt: "2026-10-01T00:00:00.000Z",
        priceCents: 9000,
        inventoryMode: "GA_SECTOR",
        status: "PUBLISHED",
      },
      items: [
        {
          id: "i1",
          quantity: 2,
          seat: null,
          sector: {
            id: "sec-1",
            name: "Camarote",
            capacity: 30,
            availableCount: 28,
            priceCents: 16000,
          },
        },
      ],
    });
    expect(reservationLineItems(reservation)).toBe("Camarote x 2");
    expect(reservationTotalCents(reservation)).toBe(32000);
  });

  it("formats the hold countdown as MM:SS and never goes negative", () => {
    expect(formatCountdown(125_000)).toBe("02:05");
    expect(formatCountdown(0)).toBe("00:00");
    expect(formatCountdown(-4_000)).toBe("00:00");
  });
});
