import type { EventListItem } from "@/features/events/types";
import type { OrganizerListFilter } from "@/features/organizer/types";

export function summarizeOrganizerEvents(events: EventListItem[]) {
  return events.reduce(
    (acc, event) => {
      if (event.status === "PUBLISHED") acc.publishedCount += 1;
      acc.ticketsSold += event.ticketsSold ?? 0;
      acc.revenueCents += event.revenueCents ?? 0;
      acc.ticketsUsed += event.ticketsUsed ?? 0;
      return acc;
    },
    {
      publishedCount: 0,
      ticketsSold: 0,
      revenueCents: 0,
      ticketsUsed: 0,
    },
  );
}

export function filterOrganizerEvents(
  events: EventListItem[],
  filter: OrganizerListFilter,
  now = Date.now(),
) {
  const sorted = [...events].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === "DRAFT" ? -1 : 1;
  });

  if (filter === "all") return sorted;
  if (filter === "draft") {
    return sorted.filter((event) => event.status === "DRAFT");
  }
  if (filter === "published") {
    return sorted.filter((event) => event.status === "PUBLISHED");
  }
  return sorted.filter(
    (event) =>
      event.status === "PUBLISHED" &&
      new Date(event.startsAt).getTime() > now,
  );
}
