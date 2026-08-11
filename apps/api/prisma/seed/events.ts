import {
  EventStatus,
  ExternalSource,
  InventoryMode,
  PrismaClient,
  SeatStatus,
} from "../../src/generated/prisma/client";
import type { CatalogSnapshot } from "./catalog";

export const SEAT_MAP_EVENT_ID = "00000000-0000-4000-8000-000000000001";
export const GA_SECTOR_EVENT_ID = "00000000-0000-4000-8000-000000000002";

const CINEMA_VENUES = [
  "Cinemark Shopping Vila Olímpia",
  "UCI Anália Franco",
  "Kinoplex Bourbon Ipiranga",
  "Reserva Cultural",
  "Cinépolis JK Iguatemi",
];

const ARENA_VENUES = ["Allianz Parque", "Espaço Unimed", "Vibra São Paulo"];

type PlannedEvent = {
  id?: string;
  item: CatalogSnapshot;
  venue: string;
  startsAt: Date;
  priceCents: number;
  inventoryMode: InventoryMode;
};

export async function createSeedEvents(
  prisma: PrismaClient,
  organizerId: string,
  movies: CatalogSnapshot[],
  shows: CatalogSnapshot[],
) {
  const planned = planEvents(movies, shows);
  for (const event of planned) {
    await createEvent(prisma, organizerId, event);
  }
  return planned;
}

function planEvents(
  movies: CatalogSnapshot[],
  shows: CatalogSnapshot[],
): PlannedEvent[] {
  const cinemaMovies = shows.length > 0 ? movies : movies.slice(0, -2);
  const planned: PlannedEvent[] = cinemaMovies.map((item, index) => ({
    id: index === 0 ? SEAT_MAP_EVENT_ID : undefined,
    item,
    venue: CINEMA_VENUES[index] ?? "Cinemark Shopping Vila Olímpia",
    startsAt: upcomingLocal(3 + index * 4, 20),
    priceCents: 3200 + index * 400,
    inventoryMode: InventoryMode.SEAT_MAP,
  }));

  const showSource = shows.length > 0 ? shows : movies.slice(-2);
  for (const [index, item] of showSource.entries()) {
    planned.push({
      id: index === 0 ? GA_SECTOR_EVENT_ID : undefined,
      item,
      venue: item.venue ?? ARENA_VENUES[index] ?? "Allianz Parque",
      startsAt: futureOrUpcoming(item.startsAt, 18 + index * 7, 21),
      priceCents: 9000 + index * 2500,
      inventoryMode: InventoryMode.GA_SECTOR,
    });
  }

  return planned;
}

async function createEvent(
  prisma: PrismaClient,
  organizerId: string,
  planned: PlannedEvent,
) {
  const source =
    planned.item.source === "ticketmaster"
      ? ExternalSource.TICKETMASTER
      : ExternalSource.TMDB;

  if (planned.inventoryMode === InventoryMode.SEAT_MAP) {
    await prisma.event.create({
      data: {
        id: planned.id,
        organizerId,
        ...eventFields(planned, source),
        inventoryMode: InventoryMode.SEAT_MAP,
        seats: { createMany: { data: seatMap("A", 6, 10) } },
      },
    });
    return;
  }

  await prisma.event.create({
    data: {
      id: planned.id,
      organizerId,
      ...eventFields(planned, source),
      inventoryMode: InventoryMode.GA_SECTOR,
      sectors: {
        createMany: {
          data: [
            {
              name: "Pista",
              capacity: 120,
              availableCount: 120,
              priceCents: null,
            },
            {
              name: "Camarote",
              capacity: 30,
              availableCount: 30,
              priceCents: planned.priceCents + 7000,
            },
          ],
        },
      },
    },
  });
}

function eventFields(planned: PlannedEvent, source: ExternalSource) {
  return {
    title: planned.item.title,
    description: planned.item.description,
    venue: planned.venue,
    startsAt: planned.startsAt,
    gateOpensHoursBefore: null,
    priceCents: planned.priceCents,
    status: EventStatus.PUBLISHED,
    externalSource: source,
    externalId: planned.item.externalId,
    imageUrl: planned.item.imageUrl,
    externalPayload: planned.item.raw as object,
  };
}

function seatMap(startRow: string, rows: number, seatsPerRow: number) {
  const start = startRow.charCodeAt(0);
  return Array.from({ length: rows }, (_, rowIndex) => {
    const row = String.fromCharCode(start + rowIndex);
    return Array.from({ length: seatsPerRow }, (_, seatIndex) => {
      const number = seatIndex + 1;
      return {
        label: `${row}${number}`,
        row,
        number,
        status: SeatStatus.AVAILABLE,
      };
    });
  }).flat();
}

function upcomingLocal(daysAhead: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function futureOrUpcoming(
  iso: string | null,
  daysAhead: number,
  hour: number,
): Date {
  if (iso) {
    const parsed = new Date(iso);
    const minStart = Date.now() + 12 * 60 * 60 * 1000;
    if (!Number.isNaN(parsed.getTime()) && parsed.getTime() > minStart) {
      return parsed;
    }
  }
  return upcomingLocal(daysAhead, hour);
}
