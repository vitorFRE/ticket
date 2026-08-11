import type { EventListItem } from "@/features/events/types";

const UPCOMING_LIMIT = 8;
const POPULAR_LIMIT = 4;

export function upcomingEvents(items: EventListItem[]) {
  return [...items]
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
    .slice(0, UPCOMING_LIMIT);
}

export function popularEvents(items: EventListItem[]) {
  return [...items]
    .filter((event) => (event.ticketsSold ?? 0) > 0)
    .sort((a, b) => (b.ticketsSold ?? 0) - (a.ticketsSold ?? 0))
    .slice(0, POPULAR_LIMIT);
}

export function moreInCartaz(
  items: EventListItem[],
  currentId: string,
  source: EventListItem["externalSource"],
  limit = 4,
) {
  const others = items.filter((event) => event.id !== currentId);
  const same = others.filter((event) => event.externalSource === source);
  const rest = others.filter((event) => event.externalSource !== source);
  return [...same, ...rest].slice(0, limit);
}
