import { describe, expect, it } from "vitest";
import {
  ticketPlace,
  ticketStatusLabel,
} from "@/features/tickets/ticket-place";
import type { Ticket } from "@/features/tickets/types";

function makeTicket(overrides: Partial<Ticket> = {}): Ticket {
  return {
    id: "tkt-1",
    code: "code-1",
    qrPayload: "payload",
    status: "VALID",
    event: {
      id: "evt-1",
      title: "Filme seed",
      venue: "Cinemark",
      startsAt: "2026-09-01T23:00:00.000Z",
      priceCents: 3200,
      imageUrl: null,
    },
    seat: { id: "s1", label: "B4", row: "B", number: 4 },
    sector: null,
    share: null,
    ...overrides,
  };
}

describe("ticket-place", () => {
  it("prefers the seat label, then the sector name", () => {
    expect(ticketPlace(makeTicket())).toBe("B4");
    expect(
      ticketPlace(
        makeTicket({
          seat: null,
          sector: { id: "sec-1", name: "Pista" },
        }),
      ),
    ).toBe("Pista");
    expect(ticketPlace(makeTicket({ seat: null, sector: null }))).toBe(
      "Ingresso",
    );
  });

  it("labels ticket status", () => {
    expect(ticketStatusLabel("VALID")).toBe("Válido");
    expect(ticketStatusLabel("USED")).toBe("Usado");
    expect(ticketStatusLabel("VOID")).toBe("Anulado");
  });
});
