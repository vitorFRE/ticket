export type CatalogKind = "filme" | "show";

export function parseKind(value: string | null): CatalogKind | null {
  if (value === "filme" || value === "show") return value;
  return null;
}

export function sourceFromKind(kind: CatalogKind) {
  return kind === "filme" ? "tmdb" : "ticketmaster";
}

export function kindFromSource(source: "TMDB" | "TICKETMASTER"): CatalogKind {
  return source === "TMDB" ? "filme" : "show";
}

export function kindLabel(kind: CatalogKind) {
  return kind === "filme" ? "Filme" : "Show";
}

export function kindLabelFromSource(source: "TMDB" | "TICKETMASTER") {
  return kindLabel(kindFromSource(source));
}
