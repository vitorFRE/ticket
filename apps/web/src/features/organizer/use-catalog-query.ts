import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { searchCatalog } from "@/features/organizer/api/catalog-api";
import type { CatalogSource } from "@/features/organizer/types";
import { queryKeys } from "@/shared/query/keys";

export function useCatalogSearch(source: CatalogSource, q: string) {
  const query = q.trim();
  return useQuery({
    queryKey: queryKeys.catalog.search(source, query),
    queryFn: () => searchCatalog(source, query),
    enabled: query.length > 0,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
