import { describe, expect, it } from "vitest";
import {
  moreInCartaz,
  popularEvents,
  upcomingEvents,
} from "@/features/events/split-catalog";
import { makeEvent } from "@/test/fixtures";

describe("split-catalog", () => {
  it("sorts upcoming events by date and caps at 8", () => {
    const items = [
      makeEvent({ id: "late", startsAt: "2026-12-01T20:00:00.000Z" }),
      makeEvent({ id: "soon", startsAt: "2026-09-02T20:00:00.000Z" }),
      makeEvent({ id: "mid", startsAt: "2026-10-01T20:00:00.000Z" }),
    ];
    expect(upcomingEvents(items).map((event) => event.id)).toEqual([
      "soon",
      "mid",
      "late",
    ]);

    const many = Array.from({ length: 10 }, (_, index) =>
      makeEvent({
        id: `e${index}`,
        startsAt: `2026-09-${String(index + 1).padStart(2, "0")}T20:00:00.000Z`,
      }),
    );
    expect(upcomingEvents(many)).toHaveLength(8);
  });

  it("keeps popular events only when someone already bought", () => {
    const items = [
      makeEvent({ id: "cold", ticketsSold: 0 }),
      makeEvent({ id: "hot", ticketsSold: 12 }),
      makeEvent({ id: "warm", ticketsSold: 3 }),
      makeEvent({ id: "none" }),
    ];
    expect(popularEvents(items).map((event) => event.id)).toEqual([
      "hot",
      "warm",
    ]);
  });

  it("prefers the same source in moreInCartaz and skips the current event", () => {
    const items = [
      makeEvent({ id: "current", externalSource: "TMDB" }),
      makeEvent({ id: "other-film", externalSource: "TMDB" }),
      makeEvent({ id: "show", externalSource: "TICKETMASTER" }),
    ];
    expect(
      moreInCartaz(items, "current", "TMDB").map((event) => event.id),
    ).toEqual(["other-film", "show"]);
  });
});
