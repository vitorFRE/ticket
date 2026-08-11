"use client";

import Link from "next/link";
import { CalendarBlankIcon, MapPinIcon } from "@phosphor-icons/react";
import { kindLabelFromSource } from "@/features/events/catalog-kind";
import type { EventListItem } from "@/features/events/types";
import { formatDate, formatPrice } from "@/features/events/format";
import { glassInnerFlushCompact, glassOuterCompact } from "@/lib/glass-styles";

export function EventCard({ event }: { event: EventListItem }) {
  return (
    <Link href={`/events/${event.id}`} className={`${glassOuterCompact} group block h-full`}>
      <div className={`${glassInnerFlushCompact} relative flex h-full flex-col`}>
        <div className="relative aspect-16/9 overflow-hidden bg-muted">
          {event.imageUrl ? (
            <>
              <img
                src={event.imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-md brightness-[0.35]"
              />
              <img
                src={event.imageUrl}
                alt=""
                className="relative z-[1] h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.03]"
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_oklch,var(--primary)_28%,transparent),transparent_55%)]">
              <span className="text-xl font-semibold tracking-tight text-muted-foreground">
                {event.title.slice(0, 1)}
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-background/90 via-background/20 to-transparent px-3 pt-10 pb-2.5">
            <span className="inline-flex rounded-md border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-foreground/90 backdrop-blur-sm">
              {kindLabelFromSource(event.externalSource)}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 px-3.5 py-3">
          <h2 className="text-[15px] font-semibold leading-snug tracking-[-0.02em] text-balance">
            {event.title}
          </h2>

          <div className="mt-auto space-y-1 text-xs text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <CalendarBlankIcon size={14} weight="bold" />
              {formatDate(event.startsAt)}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPinIcon size={14} weight="bold" />
              <span className="truncate">{event.venue}</span>
            </p>
          </div>

          <p className="pt-0.5 text-sm font-semibold tracking-tight text-foreground">
            a partir de {formatPrice(event.priceCents)}
          </p>
        </div>
      </div>
    </Link>
  );
}
