import type {
  EventListItem,
  EventSeat,
  EventSector,
} from "@/features/events/types";
import type { GateTicketSummary } from "@/features/gate/types";
import type { ReservationDetail } from "@/features/reservations/types";

export function makeEvent(
  overrides: Partial<EventListItem> = {},
): EventListItem {
  return {
    id: "evt-1",
    title: "Filme seed",
    description: null,
    venue: "Cinemark",
    startsAt: "2026-09-01T23:00:00.000Z",
    priceCents: 3200,
    status: "PUBLISHED",
    inventoryMode: "SEAT_MAP",
    externalSource: "TMDB",
    externalId: "tmdb-1",
    imageUrl: null,
    organizerId: "org-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ticketsSold: 0,
    ...overrides,
  };
}

export function makeSeat(overrides: Partial<EventSeat> = {}): EventSeat {
  return {
    id: "seat-a1",
    label: "A1",
    row: "A",
    number: 1,
    status: "AVAILABLE",
    ...overrides,
  };
}

export function makeSector(overrides: Partial<EventSector> = {}): EventSector {
  return {
    id: "sec-camarote",
    name: "Camarote",
    capacity: 30,
    availableCount: 30,
    priceCents: 16000,
    ...overrides,
  };
}

export function makeReservation(
  overrides: Partial<ReservationDetail> = {},
): ReservationDetail {
  return {
    id: "res-1",
    status: "PENDING",
    expiresAt: "2026-09-01T23:15:00.000Z",
    eventId: "evt-1",
    event: {
      id: "evt-1",
      title: "Filme seed",
      venue: "Cinemark",
      startsAt: "2026-09-01T23:00:00.000Z",
      priceCents: 3200,
      inventoryMode: "SEAT_MAP",
      status: "PUBLISHED",
      imageUrl: null,
    },
    items: [
      {
        id: "item-1",
        quantity: null,
        seat: {
          id: "seat-a1",
          label: "A1",
          row: "A",
          number: 1,
          status: "HELD",
        },
        sector: null,
      },
    ],
    tickets: [],
    payment: null,
    ...overrides,
  };
}

export function makeGateTicket(
  overrides: Partial<GateTicketSummary> = {},
): GateTicketSummary {
  return {
    id: "tkt-1",
    code: "ticket-code",
    status: "VALID",
    eventId: "evt-1",
    seat: { label: "A1" },
    sector: null,
    user: { name: "Cliente Um" },
    event: { id: "evt-1", title: "Filme seed" },
    validatedAt: null,
    ...overrides,
  };
}
