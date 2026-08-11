"use client";

import { CircleNotchIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { PageState } from "@/components/page-state";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/scroll-reveal";
import { EventKindFilter } from "@/features/events/components/event-kind-filter";
import { EventSection } from "@/features/events/components/event-section";
import { listEvents } from "@/features/events/api/events-api";
import {
  parseKind,
  sourceFromKind,
  type CatalogKind,
} from "@/features/events/catalog-kind";
import { popularEvents, upcomingEvents } from "@/features/events/split-catalog";
import type { EventListItem } from "@/features/events/types";
import { glassSubtle } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 350;

export function EventsHome() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchId = useId();
  const initialQ = searchParams.get("q") ?? "";
  const initialKind = parseKind(searchParams.get("kind"));

  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ.trim());
  const [kind, setKind] = useState<CatalogKind | null>(initialKind);
  const [focused, setFocused] = useState(false);
  const [items, setItems] = useState<EventListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    setDebouncedQuery((searchParams.get("q") ?? "").trim());
    setKind(parseKind(searchParams.get("kind")));
  }, [searchParams]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (kind) params.set("kind", kind);
    const qs = params.toString();
    const next = qs ? `/?${qs}` : "/";
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== next) {
      router.replace(next, { scroll: false });
    }
  }, [debouncedQuery, kind, router]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    void listEvents({
      q: debouncedQuery || undefined,
      source: kind ? sourceFromKind(kind) : undefined,
    })
      .then((data) => {
        if (!cancelled) setItems(data.items);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Não foi possível carregar os eventos.",
          );
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, kind]);

  const waitingDebounce = query.trim() !== debouncedQuery;
  const searching = isLoading || waitingDebounce;
  const showSkeleton = isLoading && items.length === 0;
  const hasQuery = query.length > 0;
  const isSearch = Boolean(debouncedQuery);
  const upcoming = upcomingEvents(items);
  const popular = popularEvents(items);

  return (
    <div className="relative z-10 flex-1">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-10 pb-16 md:px-6 lg:px-8 lg:pt-12 lg:pb-24">
        <ScrollReveal className="flex flex-col gap-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Em cartaz
              </p>
              <h1 className="hero-title text-balance">
                O que está em cartaz
              </h1>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                Cinema e palco no mesmo lugar. Escolha uma sessão e reserve.
              </p>
            </div>

            <HomeSearch
              searchId={searchId}
              query={query}
              focused={focused}
              searching={searching}
              hasQuery={hasQuery}
              onQuery={setQuery}
              onFocus={setFocused}
            />
          </div>

          <EventKindFilter value={kind} onChange={setKind} />
        </ScrollReveal>

        {error ? <PageState title="Não foi possível carregar" body={error} /> : null}

        {showSkeleton ? <HomeSkeleton /> : null}

        {!showSkeleton && !error && items.length === 0 ? (
          <EmptyCatalog
            query={debouncedQuery}
            kind={kind}
            onClear={() => {
              setQuery("");
              setKind(null);
            }}
          />
        ) : null}

        {!showSkeleton && !error && isSearch && items.length > 0 ? (
          <EventSection
            title="Resultados"
            subtitle={`Para “${debouncedQuery}”.`}
            events={items}
            searching={searching}
          />
        ) : null}

        {!showSkeleton && !error && !isSearch && items.length > 0 ? (
          <div className="flex flex-col gap-14">
            <EventSection
              title="Próximos"
              subtitle={
                kind === "filme"
                  ? "Filmes com sessão mais perto."
                  : kind === "show"
                    ? "Shows com data mais perto."
                    : "As sessões com data mais perto."
              }
              events={upcoming}
              searching={searching}
            />
            <EventSection
              title="Populares"
              subtitle={
                kind === "filme"
                  ? "Filmes com mais ingressos vendidos."
                  : kind === "show"
                    ? "Shows com mais ingressos vendidos."
                    : "O que mais vendeu ingresso."
              }
              events={popular}
              searching={searching}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function HomeSearch({
  searchId,
  query,
  focused,
  searching,
  hasQuery,
  onQuery,
  onFocus,
}: {
  searchId: string;
  query: string;
  focused: boolean;
  searching: boolean;
  hasQuery: boolean;
  onQuery: (value: string) => void;
  onFocus: (value: boolean) => void;
}) {
  return (
    <div className="w-full max-w-sm shrink-0 space-y-2">
      <label htmlFor={searchId} className="sr-only">
        Buscar eventos pelo título
      </label>
      <div
        className={cn(
          glassSubtle,
          "relative transition-[box-shadow,border-color,background-color] duration-200",
          focused &&
            "border-primary/50 bg-white/[0.06] shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_28%,transparent)]",
        )}
      >
        <MagnifyingGlassIcon
          size={18}
          weight="bold"
          className={cn(
            "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 transition-colors",
            focused ? "text-primary" : "text-muted-foreground",
          )}
        />
        <Input
          id={searchId}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onFocus={() => onFocus(true)}
          onBlur={() => onFocus(false)}
          placeholder="Ex.: Duna, Interestelar..."
          className="h-12 border-0 bg-transparent pr-11 pl-10 shadow-none focus-visible:ring-0"
          aria-label="Buscar eventos pelo título"
          aria-describedby={`${searchId}-hint`}
          autoComplete="off"
          spellCheck={false}
        />
        {searching && hasQuery ? (
          <CircleNotchIcon
            size={16}
            weight="bold"
            className="absolute top-1/2 right-3.5 -translate-y-1/2 animate-spin text-primary"
            aria-hidden
          />
        ) : null}
        {!searching && hasQuery ? (
          <button
            type="button"
            onClick={() => onQuery("")}
            className="absolute top-1/2 right-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
            aria-label="Limpar busca"
          >
            <XIcon size={14} weight="bold" />
          </button>
        ) : null}
      </div>
      <p
        id={`${searchId}-hint`}
        className="px-1 text-xs text-muted-foreground"
        aria-live="polite"
      >
        {searching && hasQuery
          ? "Buscando..."
          : focused || hasQuery
            ? "A lista atualiza enquanto você digita."
            : "Busque pelo nome."}
      </p>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="h-56 animate-pulse rounded-2xl bg-white/4 ring-1 ring-white/10"
        />
      ))}
    </div>
  );
}

function EmptyCatalog({
  query,
  kind,
  onClear,
}: {
  query: string;
  kind: CatalogKind | null;
  onClear: () => void;
}) {
  const body = query
    ? `Não achamos nada para “${query}”. Tente outro nome.`
    : kind === "filme"
      ? "Nenhum filme publicado neste filtro."
      : kind === "show"
        ? "Nenhum show publicado neste filtro."
        : "Tente outro termo ou volte mais tarde.";

  return (
    <PageState title="Nenhum evento encontrado" body={body}>
      {query || kind ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex h-9 items-center rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground hover:opacity-90"
        >
          Limpar filtros
        </button>
      ) : null}
    </PageState>
  );
}
