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
  priceCents?: number;
  imageUrl?: string | null;
};
