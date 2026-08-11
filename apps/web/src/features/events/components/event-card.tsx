"use client";

import Link from "next/link";
import { CalendarBlankIcon, MapPinIcon } from "@phosphor-icons/react";
import type { EventListItem } from "@/features/events/types";
import {
  formatDate,
  formatPrice,
  modeLabel,
} from "@/features/events/format";
import { glassInnerFlush, glassOuter } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

export function EventCard({
  event,
  featured = false,
}: {
  event: EventListItem;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/events/${event.id}`}
      className={cn(
        glassOuter,
        "group block h-full",
        featured && "md:col-span-2",
      )}
    >
      <div className={cn(glassInnerFlush, "relative flex h-full flex-col")}>
        <div
          className={cn(
            "relative overflow-hidden bg-muted",
            featured ? "aspect-[21/9] md:aspect-[2.4/1]" : "aspect-[16/10]",
          )}
        >
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
              <span className="text-2xl font-semibold tracking-tight text-muted-foreground">
                {event.title.slice(0, 1)}
              </span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-background/90 via-background/20 to-transparent p-4 pt-16">
            <span className="inline-flex rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-foreground/90 backdrop-blur-sm">
              {modeLabel(event.inventoryMode)}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h2
            className={cn(
              "font-semibold tracking-[-0.02em] text-balance",
              featured ? "text-2xl md:text-3xl" : "text-lg",
            )}
          >
            {event.title}
          </h2>

          <div className="mt-auto space-y-1.5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <CalendarBlankIcon size={16} weight="bold" />
              {formatDate(event.startsAt)}
            </p>
            <p className="flex items-center gap-2">
              <MapPinIcon size={16} weight="bold" />
              <span className="truncate">{event.venue}</span>
            </p>
          </div>

          <p className="pt-1 text-base font-semibold tracking-tight text-foreground">
            a partir de {formatPrice(event.priceCents)}
          </p>
        </div>
      </div>
    </Link>
  );
}
