export type CatalogSource = "tmdb" | "ticketmaster";

export type CatalogItem = {
  source: CatalogSource;
  externalId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  venue: string | null;
  startsAt: string | null;
};

export type CatalogSearchResponse = {
  items: CatalogItem[];
};

export type CreateEventBody = {
  source: CatalogSource;
  externalId: string;
  venue: string;
  startsAt: string;
  gateOpensHoursBefore: number | null;
  priceCents: number;
  inventoryMode: "SEAT_MAP" | "GA_SECTOR";
  title?: string;
  description?: string;
  imageUrl?: string;
  seatMap?: { rows?: string[]; seatsPerRow?: number };
  sectors?: Array<{ name: string; capacity: number; priceCents?: number }>;
};

export type UpdateEventBody = {
  title?: string;
  description?: string | null;
  venue?: string;
  startsAt?: string;
  gateOpensHoursBefore?: number | null;
  priceCents?: number;
  imageUrl?: string | null;
};

export type EventStats = {
  eventId: string;
  ticketsSold: number;
  capacity: number;
  occupancyPct: number;
  revenueCents: number;
  ticketsUsed: number;
  pendingHolds: number;
  byStatus: { valid: number; used: number; void: number };
  seats?: { available: number; held: number; sold: number };
  sectors?: Array<{
    id: string;
    name: string;
    capacity: number;
    availableCount: number;
    sold: number;
    revenueCents: number;
  }>;
};

export type OrganizerTicketItem = {
  id: string;
  code: string;
  status: "VALID" | "USED" | "VOID";
  seatLabel: string | null;
  sectorName: string | null;
  createdAt: string;
  validatedAt: string | null;
};

export type OrganizerTicketsResponse = {
  items: OrganizerTicketItem[];
};

export type OrganizerListFilter =
  | "all"
  | "draft"
  | "published"
  | "upcoming";

