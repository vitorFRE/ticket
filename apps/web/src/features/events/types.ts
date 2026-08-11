export type EventListItem = {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  startsAt: string;
  priceCents: number;
  status: string;
  inventoryMode: "SEAT_MAP" | "GA_SECTOR";
  externalSource: "TMDB" | "TICKETMASTER";
  externalId: string;
  imageUrl: string | null;
  organizerId: string;
  createdAt: string;
  updatedAt: string;
  ticketsSold?: number;
};

export type EventsListResponse = {
  items: EventListItem[];
};

export type EventDetail = EventListItem & {
  externalPayload?: unknown;
  _count?: { seats: number; sectors: number };
};

export type SeatStatus = "AVAILABLE" | "HELD" | "SOLD";

export type EventSeat = {
  id: string;
  label: string;
  row: string;
  number: number;
  status: SeatStatus;
};

export type EventSector = {
  id: string;
  name: string;
  capacity: number;
  availableCount: number;
  priceCents: number;
};

export type EventSeatsResponse = {
  eventId: string;
  items: EventSeat[];
};

export type EventSectorsResponse = {
  eventId: string;
  items: EventSector[];
};
