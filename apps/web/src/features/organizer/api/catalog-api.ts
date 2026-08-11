import { authorizedFetch } from "@/features/auth/lib/authorized-fetch";
import type {
  CatalogItem,
  CatalogSearchResponse,
  CatalogSource,
} from "@/features/organizer/types";
import { parseApiJson } from "@/shared/api/parse-api-json";
import { getApiBaseUrl } from "@/shared/config/api-base";

export async function searchCatalog(
  source: CatalogSource,
  q: string,
): Promise<CatalogSearchResponse> {
  const path =
    source === "tmdb" ? "/catalog/tmdb/search" : "/catalog/ticketmaster/search";
  const url = new URL(`${getApiBaseUrl()}${path}`);
  url.searchParams.set("q", q);
  const res = await authorizedFetch(url.toString());
  return parseApiJson<CatalogSearchResponse>(res);
}

export async function getCatalogDetail(
  source: CatalogSource,
  externalId: string,
): Promise<CatalogItem> {
  const res = await authorizedFetch(
    `${getApiBaseUrl()}/catalog/${source}/${encodeURIComponent(externalId)}`,
  );
  return parseApiJson<CatalogItem>(res);
}
