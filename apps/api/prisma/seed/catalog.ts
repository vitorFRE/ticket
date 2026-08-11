export type CatalogSnapshot = {
  source: "tmdb" | "ticketmaster";
  externalId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  venue: string | null;
  startsAt: string | null;
  raw: unknown;
};

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE = "https://image.tmdb.org/t/p/w780";
const TM_BASE = "https://app.ticketmaster.com/discovery/v2";

const MOVIE_IDS = ["157336", "693134", "872585", "496243", "244786"] as const;

type TmdbMovie = {
  id: number;
  title?: string;
  overview?: string;
  poster_path?: string | null;
};

type TmImage = { url?: string; width?: number; ratio?: string };
type TmEvent = {
  id: string;
  name?: string;
  info?: string;
  pleaseNote?: string;
  description?: string;
  images?: TmImage[];
  dates?: { start?: { dateTime?: string; localDate?: string } };
  _embedded?: { venues?: Array<{ name?: string; city?: { name?: string } }> };
};

export async function loadCatalogSnapshots(): Promise<{
  movies: CatalogSnapshot[];
  shows: CatalogSnapshot[];
}> {
  const movies = await loadMovies();
  const shows = await loadShows();
  return { movies, shows };
}

async function loadMovies(): Promise<CatalogSnapshot[]> {
  const items: CatalogSnapshot[] = [];
  for (const id of MOVIE_IDS) {
    const live = await fetchTmdbMovie(id);
    items.push(live ?? fallbackMovie(id));
  }
  return items;
}

async function loadShows(): Promise<CatalogSnapshot[]> {
  const live = await fetchTicketmasterShows();
  if (live.length > 0) return live.slice(0, 2);
  return [];
}

async function fetchTmdbMovie(id: string): Promise<CatalogSnapshot | null> {
  const apiKey = process.env.TMDB_API_KEY?.trim();
  const token = process.env.TMDB_ACCESS_TOKEN?.trim();
  if (!apiKey && !token) return null;

  const url = new URL(`${TMDB_BASE}/movie/${id}`);
  url.searchParams.set("language", "pt-BR");
  if (apiKey) url.searchParams.set("api_key", apiKey);

  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) return null;
    const data = (await response.json()) as TmdbMovie;
    return {
      source: "tmdb",
      externalId: `movie:${data.id}`,
      title: data.title?.trim() || `Filme ${id}`,
      description: data.overview?.trim() || null,
      imageUrl: data.poster_path ? `${TMDB_IMAGE}${data.poster_path}` : null,
      venue: null,
      startsAt: null,
      raw: data,
    };
  } catch {
    return null;
  }
}

async function fetchTicketmasterShows(): Promise<CatalogSnapshot[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY?.trim();
  if (!apiKey) return [];

  const batches = await Promise.all([
    searchTicketmaster(apiKey, { countryCode: "BR" }),
    searchTicketmaster(apiKey, { countryCode: "US" }),
  ]);
  const seen = new Set<string>();
  const ranked: CatalogSnapshot[] = [];

  for (const mapped of batches.flat()) {
    if (!isUsableShow(mapped) || seen.has(mapped.title)) continue;
    seen.add(mapped.title);
    ranked.push(mapped);
  }

  ranked.sort((a, b) => showScore(b) - showScore(a));
  return ranked.slice(0, 2);
}

async function searchTicketmaster(
  apiKey: string,
  opts: { countryCode: string },
): Promise<CatalogSnapshot[]> {
  const url = new URL(`${TM_BASE}/events.json`);
  url.searchParams.set("apikey", apiKey);
  url.searchParams.set("countryCode", opts.countryCode);
  url.searchParams.set("classificationName", "Music");
  url.searchParams.set("size", "20");
  url.searchParams.set("sort", "date,asc");
  url.searchParams.set(
    "startDateTime",
    new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
  );

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];
    const data = (await response.json()) as {
      _embedded?: { events?: TmEvent[] };
    };
    return (data._embedded?.events ?? []).map(mapTicketmaster);
  } catch {
    return [];
  }
}

function showScore(item: CatalogSnapshot): number {
  let score = 0;
  if (/tour|festival|lollapalooza/i.test(item.title)) score += 8;
  if (item.imageUrl) score += 1;
  return score;
}

function isUsableShow(item: CatalogSnapshot): boolean {
  const title = item.title.trim();
  if (!item.imageUrl || !item.venue) return false;
  if (title.length < 8 || title.length > 48) return false;
  if (
    /performing on|tribute|cover band|ultimate |revisited|canta |ticket \+ hotel/i.test(
      title,
    )
  ) {
    return false;
  }
  return true;
}

function mapTicketmaster(event: TmEvent): CatalogSnapshot {
  const venue = event._embedded?.venues?.[0];
  const venueName = [venue?.name, venue?.city?.name].filter(Boolean).join(" · ") || null;
  return {
    source: "ticketmaster",
    externalId: event.id,
    title: event.name?.trim() || "Show",
    description:
      event.info?.trim() ||
      event.pleaseNote?.trim() ||
      event.description?.trim() ||
      null,
    imageUrl: bestTicketmasterImage(event.images),
    venue: venueName,
    startsAt: event.dates?.start?.dateTime ?? event.dates?.start?.localDate ?? null,
    raw: event,
  };
}

function bestTicketmasterImage(images?: TmImage[]): string | null {
  if (!images?.length) return null;
  const wide = images.filter((image) => image.ratio === "16_9");
  const pool = wide.length > 0 ? wide : images;
  const ranked = [...pool].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return ranked[0]?.url ?? null;
}

const FALLBACK_MOVIES: Record<string, Omit<CatalogSnapshot, "source" | "raw">> = {
  "157336": {
    externalId: "movie:157336",
    title: "Interestelar",
    description:
      "As reservas naturais da Terra estão chegando ao fim. Um grupo de astronautas viaja através de um buraco de minhoca em busca de um novo lar.",
    imageUrl: `${TMDB_IMAGE}/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg`,
    venue: null,
    startsAt: null,
  },
  "693134": {
    externalId: "movie:693134",
    title: "Duna: Parte Dois",
    description:
      "Paul Atreides se une a Chani e aos Fremen enquanto busca vingança contra os conspiradores que destruíram sua família.",
    imageUrl: `${TMDB_IMAGE}/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg`,
    venue: null,
    startsAt: null,
  },
  "872585": {
    externalId: "movie:872585",
    title: "Oppenheimer",
    description:
      "A história de J. Robert Oppenheimer e o desenvolvimento da bomba atômica durante a Segunda Guerra Mundial.",
    imageUrl: `${TMDB_IMAGE}/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg`,
    venue: null,
    startsAt: null,
  },
  "496243": {
    externalId: "movie:496243",
    title: "Parasita",
    description:
      "A família Ki-taek se interessa pelos ricos Park até que um incidente inesperado abala as duas casas.",
    imageUrl: `${TMDB_IMAGE}/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg`,
    venue: null,
    startsAt: null,
  },
  "244786": {
    externalId: "movie:244786",
    title: "Whiplash: Em Busca da Perfeição",
    description:
      "Um jovem baterista entra numa conservatório de elite e enfrenta um maestro implacável.",
    imageUrl: `${TMDB_IMAGE}/7fn624j5lj3xTme2SgiLCeuedmO.jpg`,
    venue: null,
    startsAt: null,
  },
};

function fallbackMovie(id: string): CatalogSnapshot {
  const item = FALLBACK_MOVIES[id];
  if (!item) {
    throw new Error(`Sem fallback TMDb para ${id}`);
  }
  return { ...item, source: "tmdb", raw: { seedFallback: true, id } };
}
