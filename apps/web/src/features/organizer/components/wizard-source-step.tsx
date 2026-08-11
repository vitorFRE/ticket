"use client";

import { useEffect, useState } from "react";
import { searchCatalog } from "@/features/organizer/api/catalog-api";
import type { CatalogItem, CatalogSource } from "@/features/organizer/types";

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
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [debounced, setDebounced] = useState(query.trim());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!debounced) {
      setItems([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void searchCatalog(source, debounced)
      .then((data) => {
        if (!cancelled) setItems(data.items);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setItems([]);
        setError(err instanceof Error ? err.message : "Busca indisponível.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [source, debounced]);

  return (
    <div className="max-w-xl space-y-8">
      <div className="flex gap-4 text-sm">
        <SourceButton
          active={source === "tmdb"}
          onClick={() => onSource("tmdb")}
          label="TMDb"
        />
        <SourceButton
          active={source === "ticketmaster"}
          onClick={() => onSource("ticketmaster")}
          label="Ticketmaster"
        />
      </div>

      <label className="block">
        <span className="text-[13px] text-white/40">Buscar</span>
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={source === "tmdb" ? "Filme ou série" : "Show ou evento"}
          className="mt-1.5 w-full border-0 border-b border-white/12 bg-transparent px-0 py-2 text-sm outline-none placeholder:text-white/25"
        />
      </label>

      {loading ? (
        <p className="text-sm text-white/40">Buscando...</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {items.length > 0 ? (
        <ul className="divide-y divide-white/10">
          {items.map((item) => (
            <li key={`${item.source}-${item.externalId}`}>
              <button
                type="button"
                onClick={() => onPick(item)}
                className="flex w-full items-start gap-4 py-4 text-left transition-colors hover:text-primary"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-16 w-11 shrink-0 rounded-sm object-cover"
                  />
                ) : (
                  <div className="h-16 w-11 shrink-0 rounded-sm bg-white/[0.06]" />
                )}
                <span className="min-w-0">
                  <span className="block font-medium tracking-tight">
                    {item.title}
                  </span>
                  {item.venue ? (
                    <span className="mt-1 block text-sm text-white/40">
                      {item.venue}
                    </span>
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
      type="button"
      onClick={onClick}
      className={
        active
          ? "text-foreground underline underline-offset-4"
          : "text-white/40 hover:text-white/70"
      }
    >
      {label}
    </button>
  );
}
