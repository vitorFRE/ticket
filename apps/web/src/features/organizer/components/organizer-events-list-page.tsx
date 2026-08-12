"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageState } from "@/components/page-state";
import { ScrollReveal } from "@/components/scroll-reveal";
import { OrganizerEventTile } from "@/features/organizer/components/organizer-event-tile";
import { OrganizerEventsSkeleton } from "@/features/organizer/components/organizer-events-skeleton";
import { OrganizerListStatusFilter } from "@/features/organizer/components/organizer-list-status-filter";
import { OrganizerMetricsSummary } from "@/features/organizer/components/organizer-metrics-summary";
import { OrganizerShell } from "@/features/organizer/components/organizer-shell";
import {
  filterOrganizerEvents,
  summarizeOrganizerEvents,
} from "@/features/organizer/organizer-list-utils";
import type { OrganizerListFilter } from "@/features/organizer/types";
import {
  useOrganizerEvents,
  usePublishEvent,
} from "@/features/organizer/use-organizer-query";
import { queryErrorMessage } from "@/shared/api/query-error";

export function OrganizerEventsListPage() {
  const eventsQuery = useOrganizerEvents();
  const publish = usePublishEvent();
  const events = eventsQuery.data?.items ?? [];
  const [statusFilter, setStatusFilter] = useState<OrganizerListFilter>("all");
  const loadError = eventsQuery.isError
    ? queryErrorMessage(eventsQuery.error, "Não foi possível carregar.")
    : null;
  const actionError = publish.isError
    ? queryErrorMessage(publish.error, "Não foi possível publicar.")
    : null;

  const summary = useMemo(
    () => summarizeOrganizerEvents(events),
    [events],
  );
  const filtered = useMemo(
    () => filterOrganizerEvents(events, statusFilter),
    [events, statusFilter],
  );

  const draftCount = events.filter((event) => event.status === "DRAFT").length;

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
          {!eventsQuery.isPending && events.length > 0 ? (
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

      {!eventsQuery.isPending && events.length > 0 ? (
        <OrganizerMetricsSummary
          publishedCount={summary.publishedCount}
          ticketsSold={summary.ticketsSold}
          revenueCents={summary.revenueCents}
          ticketsUsed={summary.ticketsUsed}
        />
      ) : null}

      {!eventsQuery.isPending && events.length > 0 ? (
        <OrganizerListStatusFilter
          value={statusFilter}
          onChange={setStatusFilter}
        />
      ) : null}

      {loadError ? (
        <PageState title="Não foi possível carregar" body={loadError} />
      ) : null}

      {actionError ? (
        <p className="mt-8 text-sm text-destructive">{actionError}</p>
      ) : null}

      {eventsQuery.isPending ? (
        <div className="mt-12">
          <OrganizerEventsSkeleton />
        </div>
      ) : null}

      {!eventsQuery.isPending && !loadError && filtered.length === 0 ? (
        <PageState
          title={
            events.length === 0
              ? "Nenhum evento ainda"
              : "Nenhum evento neste filtro"
          }
          body={
            events.length === 0
              ? "Crie o primeiro a partir do catálogo TMDb ou Ticketmaster."
              : "Troque o filtro ou volte para Todos."
          }
        />
      ) : null}

      {!eventsQuery.isPending && filtered.length > 0 ? (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event, index) => (
            <ScrollReveal key={event.id} delayMs={index * 40}>
              <OrganizerEventTile
                event={event}
                publishing={
                  publish.isPending && publish.variables === event.id
                }
                onPublish={(id) => publish.mutate(id)}
              />
            </ScrollReveal>
          ))}
        </div>
      ) : null}
    </OrganizerShell>
  );
}
