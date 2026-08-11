"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollReveal } from "@/components/scroll-reveal";
import type { EventListItem } from "@/features/events/types";
import {
  listMyEvents,
  publishEvent,
} from "@/features/organizer/api/organizer-events-api";
import { OrganizerEventTile } from "@/features/organizer/components/organizer-event-tile";
import { OrganizerEventsSkeleton } from "@/features/organizer/components/organizer-events-skeleton";
import { OrganizerShell } from "@/features/organizer/components/organizer-shell";
import { useOrganizerGuard } from "@/features/organizer/use-organizer-guard";

export function OrganizerEventsListPage() {
  const { ready } = useOrganizerGuard("/organizer/events");
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listMyEvents();
      setEvents(data.items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível carregar.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    void load();
  }, [ready, load]);

  const sorted = useMemo(() => {
    return [...events].sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === "DRAFT" ? -1 : 1;
    });
  }, [events]);

  const draftCount = events.filter((event) => event.status === "DRAFT").length;

  async function onPublish(id: string) {
    setPublishingId(id);
    setError(null);
    try {
      await publishEvent(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível publicar.");
    } finally {
      setPublishingId(null);
    }
  }

  return (
    <OrganizerShell>
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon size={16} weight="bold" />
        Eventos
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
            Meus eventos
          </h1>
          {!isLoading && events.length > 0 ? (
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              {events.length === 1 ? "1 evento" : `${events.length} eventos`}
              {draftCount > 0
                ? `. ${draftCount === 1 ? "1 ainda em rascunho" : `${draftCount} ainda em rascunho`}.`
                : "."}
            </p>
          ) : null}
        </div>
        <Link
          href="/organizer/events/new"
          className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-[transform,opacity] hover:opacity-90 active:scale-[0.98]"
        >
          Novo evento
        </Link>
      </div>

      {error ? <p className="mt-8 text-sm text-destructive">{error}</p> : null}

      {!ready || isLoading ? (
        <div className="mt-12">
          <OrganizerEventsSkeleton />
        </div>
      ) : null}

      {ready && !isLoading && events.length === 0 ? (
        <p className="mt-16 max-w-sm text-lg leading-relaxed text-muted-foreground">
          Nenhum evento ainda. Use Novo evento para puxar um título do catálogo.
        </p>
      ) : null}

      {ready && !isLoading && sorted.length > 0 ? (
        <ul className="mt-10 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((event, index) => (
            <li key={event.id}>
              <ScrollReveal delayMs={Math.min(index, 5) * 70}>
                <OrganizerEventTile
                  event={event}
                  publishing={publishingId === event.id}
                  onPublish={onPublish}
                />
              </ScrollReveal>
            </li>
          ))}
        </ul>
      ) : null}
    </OrganizerShell>
  );
}
