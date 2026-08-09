export const CATALOG_SOURCES = ["tmdb", "ticketmaster"] as const;

export type CatalogSource = (typeof CATALOG_SOURCES)[number];

export type CatalogItem = {
  source: CatalogSource;
  externalId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  venue: string | null;
  startsAt: string | null;
  raw: unknown;
};

export type CatalogSearchResult = {
  items: CatalogItem[];
};

export function isCatalogSource(value: string): value is CatalogSource {
  return (CATALOG_SOURCES as readonly string[]).includes(value);
}
