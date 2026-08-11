export type EventListParams = {
  q?: string;
  source?: "tmdb" | "ticketmaster";
};

export const queryKeys = {
  events: {
    all: ["events"] as const,
    list: (params: EventListParams = {}) =>
      ["events", "list", params.q ?? "", params.source ?? ""] as const,
    detail: (id: string) => ["events", "detail", id] as const,
    organizerDetail: (id: string) => ["events", "organizer", id] as const,
    seats: (id: string) => ["events", "seats", id] as const,
    sectors: (id: string) => ["events", "sectors", id] as const,
    mine: ["events", "mine"] as const,
  },
  tickets: {
    all: ["tickets"] as const,
    mine: ["tickets", "mine"] as const,
    detail: (id: string) => ["tickets", "detail", id] as const,
  },
  reservations: {
    all: ["reservations"] as const,
    mine: ["reservations", "mine"] as const,
    detail: (id: string) => ["reservations", "detail", id] as const,
  },
  catalog: {
    search: (source: string, q: string) => ["catalog", source, q] as const,
  },
};
