"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react";
import { EventCardSkeletonGrid } from "@/components/skeletons/event-card-skeleton";
import { EventCardCarousel } from "@/features/events/components/event-card-carousel";
import { kindFromSource } from "@/features/events/catalog-kind";
import { moreInCartaz } from "@/features/events/split-catalog";
import type { EventListItem } from "@/features/events/types";
import { useEventsList } from "@/features/events/use-events-query";

export function MoreEvents({
  currentId,
  source,
}: {
  currentId: string;
  source: EventListItem["externalSource"];
}) {
  const { data, isPending } = useEventsList();
  const items = data ? moreInCartaz(data.items, currentId, source) : [];

  if (isPending) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6 md:pb-24 lg:px-8">
        <EventCardSkeletonGrid />
      </section>
    );
  }

  if (items.length === 0) return null;

  const kind = kindFromSource(source);
  const subtitle =
    kind === "filme"
      ? "Outros filmes e sessões ainda em cartaz."
      : "Outros shows e sessões ainda em cartaz.";

  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 md:px-6 md:pb-24 lg:px-8">
      <EventCardCarousel
        title="Também em cartaz"
        subtitle={subtitle}
        events={items}
        headerRight={
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver cartaz
            <ArrowRightIcon size={14} weight="bold" />
          </Link>
        }
      />
    </section>
  );
}
