import { describe, expect, it } from "vitest";
import type { EventListItem } from "@/features/events/types";
import {
  filterOrganizerEvents,
  summarizeOrganizerEvents,
} from "@/features/organizer/organizer-list-utils";

function event(
  partial: Partial<EventListItem> & Pick<EventListItem, "id" | "status">,
): EventListItem {
  return {
    title: partial.title ?? partial.id,
    description: null,
    venue: "Arena",
    startsAt: partial.startsAt ?? "2026-12-01T20:00:00.000Z",
    gateOpensHoursBefore: null,
    priceCents: 3500,
    inventoryMode: "SEAT_MAP",
    externalSource: "TMDB",
    externalId: "1",
    imageUrl: null,
    organizerId: "org-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ticketsSold: 0,
    ...partial,
  };
}

describe("organizer-list-utils", () => {
  const draft = event({
    id: "d1",
    status: "DRAFT",
    ticketsSold: 0,
    revenueCents: 0,
    ticketsUsed: 0,
  });
  const publishedPast = event({
    id: "p1",
    status: "PUBLISHED",
    startsAt: "2020-01-01T20:00:00.000Z",
    ticketsSold: 2,
    revenueCents: 7000,
    ticketsUsed: 1,
  });
  const publishedFuture = event({
    id: "p2",
    status: "PUBLISHED",
    startsAt: "2030-01-01T20:00:00.000Z",
    ticketsSold: 5,
    revenueCents: 15000,
    ticketsUsed: 2,
  });

  it("summarizes published count and totals", () => {
    expect(
      summarizeOrganizerEvents([draft, publishedPast, publishedFuture]),
    ).toEqual({
      publishedCount: 2,
      ticketsSold: 7,
      revenueCents: 22000,
      ticketsUsed: 3,
    });
  });

  it("sorts drafts first for all filter", () => {
    const ids = filterOrganizerEvents(
      [publishedPast, draft],
      "all",
    ).map((item) => item.id);
    expect(ids).toEqual(["d1", "p1"]);
  });

  it("filters by draft and published", () => {
    const items = [draft, publishedPast, publishedFuture];
    expect(filterOrganizerEvents(items, "draft").map((e) => e.id)).toEqual([
      "d1",
    ]);
    expect(filterOrganizerEvents(items, "published").map((e) => e.id)).toEqual([
      "p1",
      "p2",
    ]);
  });

  it("filters upcoming published by startsAt", () => {
    const now = Date.parse("2026-06-01T00:00:00.000Z");
    expect(
      filterOrganizerEvents(
        [draft, publishedPast, publishedFuture],
        "upcoming",
        now,
      ).map((e) => e.id),
    ).toEqual(["p2"]);
  });
});
