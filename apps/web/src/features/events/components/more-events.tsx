"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { EventCard } from "@/features/events/components/event-card";
import { listEvents } from "@/features/events/api/events-api";
import { kindFromSource } from "@/features/events/catalog-kind";
import { moreInCartaz } from "@/features/events/split-catalog";
import type { EventListItem } from "@/features/events/types";

export function MoreEvents({
  currentId,
  source,
}: {
  currentId: string;
  source: EventListItem["externalSource"];
}) {
  const [items, setItems] = useState<EventListItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    void listEvents()
      .then((data) => {
        if (!cancelled) {
          setItems(moreInCartaz(data.items, currentId, source));
        }
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [currentId, source]);

  if (items.length === 0) return null;

  const kind = kindFromSource(source);
  const subtitle =
    kind === "filme"
      ? "Outros filmes e sessões ainda em cartaz."
      : "Outros shows e sessões ainda em cartaz.";

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6 md:pb-24 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl space-y-1">
          <h2 className="text-xl font-semibold tracking-[-0.03em] md:text-2xl">
            Também em cartaz
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver cartaz
          <ArrowRightIcon size={14} weight="bold" />
        </Link>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
