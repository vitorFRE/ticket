"use client";

import Link from "next/link";
import { formatDate, modeLabel } from "@/features/events/format";
import type { EventListItem } from "@/features/events/types";
import { eventStatusLabel } from "@/features/organizer/event-status";
import { cn } from "@/lib/utils";

type OrganizerEventTileProps = {
  event: EventListItem;
  publishing: boolean;
  onPublish: (id: string) => void;
};

export function OrganizerEventTile({
  event,
  publishing,
  onPublish,
}: OrganizerEventTileProps) {
  const draft = event.status === "DRAFT";

  return (
    <article>
      <Link
        href={`/organizer/events/${event.id}`}
        className="group block"
      >
        <div className="relative aspect-16/9 overflow-hidden rounded-lg bg-muted">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt=""
              className={cn(
                "h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]",
                draft && "opacity-60",
              )}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-xl font-semibold tracking-tight text-muted-foreground">
                {event.title.slice(0, 1)}
              </span>
            </div>
          )}
        </div>

        <h2 className="mt-2.5 text-[15px] font-semibold leading-snug tracking-[-0.02em] text-balance transition-colors group-hover:text-primary">
          {event.title}
        </h2>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {formatDate(event.startsAt)}
          <span className="mx-1.5 text-white/20">/</span>
          {event.venue}
        </p>
      </Link>

      <div className="mt-2 flex items-baseline justify-between gap-3">
        <p className="text-xs text-white/45">
          {eventStatusLabel(event.status)}
          <span className="mx-2 text-white/20">/</span>
          {modeLabel(event.inventoryMode)}
        </p>
        {draft ? (
          <button
            type="button"
            disabled={publishing}
            onClick={() => onPublish(event.id)}
            className="shrink-0 text-sm font-medium text-foreground underline-offset-4 transition-opacity hover:underline disabled:opacity-40"
          >
            {publishing ? "Publicando..." : "Publicar"}
          </button>
        ) : null}
      </div>
    </article>
  );
}
