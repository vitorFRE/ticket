"use client";

import { CircleNotchIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollReveal } from "@/components/scroll-reveal";
import { EventCard } from "@/features/events/components/event-card";
import { listEvents } from "@/features/events/api/events-api";
import type { EventListItem } from "@/features/events/types";
import { glassSubtle } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 350;

export function EventsHome() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchId = useId();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ.trim());
  const [focused, setFocused] = useState(false);
  const [items, setItems] = useState<EventListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlQ = searchParams.get("q") ?? "";
    setQuery(urlQ);
    setDebouncedQuery(urlQ.trim());
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
    const qs = params.toString();
    const next = qs ? `/?${qs}` : "/";
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== next) {
      router.replace(next, { scroll: false });
    }
  }, [debouncedQuery, router]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    void listEvents(debouncedQuery || undefined)
      .then((data) => {
        if (!cancelled) setItems(data.items);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Não foi possível carregar os eventos."
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
  }, [debouncedQuery]);

  const waitingDebounce = query.trim() !== debouncedQuery;
  const searching = isLoading || waitingDebounce;
  const showSkeleton = isLoading && items.length === 0;
  const [featured, ...rest] = items;
  const hasQuery = query.length > 0;

  return (
    <div className='relative z-10 flex-1'>
      <div className='mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pt-28 pb-16 md:px-6 lg:px-8 lg:pt-32 lg:pb-24'>
        <ScrollReveal className='flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
          <div className='max-w-2xl space-y-4'>
            <p className='text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground'>
              Em cartaz
            </p>
            <h1 className='hero-title text-balance'>
              Filmes e shows para reservar agora
            </h1>
            <p className='max-w-md text-base leading-relaxed text-muted-foreground'>
              Sessões publicadas com mapa de assentos ou setores. Digite o nome do evento
              para filtrar a lista.
            </p>
          </div>

          <div className='w-full max-w-sm shrink-0 space-y-2'>
            <label htmlFor={searchId} className='sr-only'>
              Buscar eventos pelo título
            </label>
            <div
              className={cn(
                glassSubtle,
                "relative transition-[box-shadow,border-color,background-color] duration-200",
                focused &&
                  "border-primary/50 bg-white/[0.06] shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_28%,transparent)]"
              )}
            >
              <MagnifyingGlassIcon
                size={18}
                weight='bold'
                className={cn(
                  "pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 transition-colors",
                  focused ? "text-primary" : "text-muted-foreground"
                )}
              />
              <Input
                id={searchId}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder='Ex.: Duna, Interestelar...'
                className='h-12 border-0 bg-transparent pr-11 pl-10 shadow-none focus-visible:ring-0'
                aria-label='Buscar eventos pelo título'
                aria-describedby={`${searchId}-hint`}
                autoComplete='off'
                spellCheck={false}
              />
              {searching && hasQuery ? (
                <CircleNotchIcon
                  size={16}
                  weight='bold'
                  className='absolute top-1/2 right-3.5 -translate-y-1/2 animate-spin text-primary'
                  aria-hidden
                />
              ) : null}
              {!searching && hasQuery ? (
                <button
                  type='button'
                  onClick={() => setQuery("")}
                  className='absolute top-1/2 right-2.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground'
                  aria-label='Limpar busca'
                >
                  <XIcon size={14} weight='bold' />
                </button>
              ) : null}
            </div>
            <p
              id={`${searchId}-hint`}
              className='px-1 text-xs text-muted-foreground'
              aria-live='polite'
            >
              {searching && hasQuery
                ? "Buscando..."
                : focused || hasQuery
                ? "A lista atualiza sozinha enquanto você digita."
                : "Digite para filtrar."}
            </p>
          </div>
        </ScrollReveal>

        {error ? (
          <div className='rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
            {error}
          </div>
        ) : null}

        {showSkeleton ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            <div className='h-80 animate-pulse rounded-4xl bg-white/4 ring-1 ring-white/10 md:col-span-2' />
            <div className='h-80 animate-pulse rounded-4xl bg-white/4 ring-1 ring-white/10' />
            <div className='h-72 animate-pulse rounded-4xl bg-white/4 ring-1 ring-white/10' />
            <div className='h-72 animate-pulse rounded-4xl bg-white/4 ring-1 ring-white/10' />
          </div>
        ) : null}

        {!showSkeleton && !error && items.length === 0 ? (
          <div className='rounded-[2rem] border border-dashed border-white/15 px-6 py-20 text-center'>
            <p className='text-base font-medium text-foreground'>
              Nenhum evento encontrado
            </p>
            <p className='mt-2 text-sm text-muted-foreground'>
              {debouncedQuery
                ? `Não achamos nada para "${debouncedQuery}". Tente outro nome.`
                : "Tente outro termo ou volte mais tarde."}
            </p>
            {debouncedQuery ? (
              <button
                type='button'
                onClick={() => setQuery("")}
                className='mt-5 inline-flex h-9 items-center rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground hover:opacity-90'
              >
                Limpar busca
              </button>
            ) : null}
          </div>
        ) : null}

        {!showSkeleton && featured ? (
          <div
            className={cn(
              "grid gap-4 md:grid-cols-2 lg:grid-cols-3",
              searching && "opacity-70 transition-opacity"
            )}
          >
            <ScrollReveal className='md:col-span-2' delayMs={40}>
              <EventCard event={featured} featured />
            </ScrollReveal>
            {rest.map((event, index) => (
              <ScrollReveal key={event.id} delayMs={80 + index * 60}>
                <EventCard event={event} />
              </ScrollReveal>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
