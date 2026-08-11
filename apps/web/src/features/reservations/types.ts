export type CreateReservationBody =
  | { eventId: string; seatIds: string[] }
  | { eventId: string; sectorId: string; quantity: number };

export type PayOutcome = "APPROVED" | "REJECTED";

export type ReservationCreated = {
  id: string;
  status: string;
  expiresAt: string | null;
  eventId: string;
};

export type ReservationEvent = {
  id: string;
  title: string;
  venue: string;
  startsAt: string;
  priceCents: number;
  inventoryMode: "SEAT_MAP" | "GA_SECTOR";
  status: string;
};

export type ReservationItem = {
  id: string;
  quantity: number | null;
  seat: {
    id: string;
    label: string;
    row: string;
    number: number;
    status: string;
  } | null;
  sector: {
    id: string;
    name: string;
    capacity: number;
    availableCount: number;
    priceCents: number | null;
  } | null;
};

export type ReservationTicket = {
  id: string;
  code: string;
  status: string;
};

export type ReservationDetail = {
  id: string;
  status: string;
  expiresAt: string | null;
  eventId: string;
  event: ReservationEvent;
  items: ReservationItem[];
  tickets: ReservationTicket[];
};

export type ReservationsListResponse = {
  items: ReservationDetail[];
};
