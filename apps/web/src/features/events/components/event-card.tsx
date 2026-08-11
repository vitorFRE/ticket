import Link from "next/link";
import { kindLabelFromSource } from "@/features/events/catalog-kind";
import type { EventListItem } from "@/features/events/types";
import { formatCardDate, formatPrice } from "@/features/events/format";

export const EVENT_CARD_ROW =
  "flex gap-4 overflow-x-auto snap-x snap-mandatory overscroll-x-contain [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

export function EventCard({ event }: { event: EventListItem }) {
  const kind = kindLabelFromSource(event.externalSource);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block w-62 shrink-0 snap-start sm:w-68"
    >
      <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-muted">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xl font-semibold tracking-tight text-muted-foreground">
              {event.title.slice(0, 1)}
            </span>
          </div>
        )}
      </div>

      <div className="mt-2.5 space-y-0.5">
        <h2 className="line-clamp-2 text-[15px] leading-snug font-semibold tracking-[-0.02em]">
          {event.title}
        </h2>
        <p className="truncate text-sm text-muted-foreground">
          {kind} · {event.venue}
        </p>
        <p className="text-sm text-muted-foreground">{formatCardDate(event.startsAt)}</p>
        <p className="pt-0.5 text-sm text-muted-foreground">
          a partir de{" "}
          <span className="font-semibold text-foreground">
            {formatPrice(event.priceCents)}
          </span>
        </p>
      </div>
    </Link>
  );
}
