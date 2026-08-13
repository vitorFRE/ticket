"use client";

import { useEffect, useState } from "react";
import { EventImage } from "@/components/event-image";
import type { CatalogItem, CatalogSource } from "@/features/organizer/types";
import { useCatalogSearch } from "@/features/organizer/use-catalog-query";
import { queryErrorMessage } from "@/shared/api/query-error";

const DEBOUNCE_MS = 350;

export function WizardSourceStep({
  source,
  query,
  onSource,
  onQuery,
  onPick,
}: {
  source: CatalogSource;
  query: string;
  onSource: (source: CatalogSource) => void;
  onQuery: (query: string) => void;
  onPick: (item: CatalogItem) => void;
}) {
  const [debounced, setDebounced] = useState(query.trim());

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  const search = useCatalogSearch(source, debounced);
  const items = debounced.length > 0 ? search.data?.items ?? [] : [];
  const loading = search.isFetching && debounced.length > 0;
  const error = search.isError
    ? queryErrorMessage(search.error, "Busca indisponível.")
    : null;

  return (
    <div className='max-w-xl space-y-8'>
      <div className='flex gap-4 text-sm'>
        <SourceButton
          active={source === "tmdb"}
          onClick={() => onSource("tmdb")}
          label='TMDb'
        />
        <SourceButton
          active={source === "ticketmaster"}
          onClick={() => onSource("ticketmaster")}
          label='Ticketmaster'
        />
      </div>

      <label className='block'>
        <span className='text-[13px] text-muted-foreground'>Buscar</span>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={source === "tmdb" ? "Filme ou série" : "Show ou evento"}
          className='mt-1.5 w-full border-0 border-b border-border bg-transparent px-0 py-2 text-sm outline-none placeholder:text-foreground/25'
        />
      </label>

      {loading ? <p className='text-sm text-muted-foreground'>Buscando...</p> : null}
      {error ? <p className='text-sm text-destructive'>{error}</p> : null}

      {items.length > 0 ? (
        <ul className='divide-y divide-border'>
          {items.map((item) => (
            <li key={`${item.source}-${item.externalId}`}>
              <button
                type='button'
                onClick={() => onPick(item)}
                className='flex w-full items-start gap-4 py-4 text-left transition-colors hover:text-primary'
              >
                {item.imageUrl ? (
                  <EventImage
                    src={item.imageUrl}
                    alt=""
                    sizes="44px"
                    className="h-16 w-11 shrink-0 rounded-sm"
                  />
                ) : (
                  <div className='h-16 w-11 shrink-0 rounded-sm bg-accent' />
                )}
                <span className='min-w-0'>
                  <span className='block font-medium tracking-tight'>{item.title}</span>
                  {item.venue ? (
                    <span className='mt-1 block text-sm text-muted-foreground'>{item.venue}</span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function SourceButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={
        active
          ? "text-foreground underline underline-offset-4"
          : "text-muted-foreground hover:text-muted-foreground"
      }
    >
      {label}
    </button>
  );
}
