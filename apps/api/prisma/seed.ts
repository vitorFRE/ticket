import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as bcrypt from "bcrypt";
import {
  EventStatus,
  ExternalSource,
  InventoryMode,
  PrismaClient,
  SeatStatus,
  UserRole,
} from "../src/generated/prisma/client";

const SEED_PASSWORD = "Password123!";

const SEAT_MAP_EVENT_ID = "00000000-0000-4000-8000-000000000001";
const GA_SECTOR_EVENT_ID = "00000000-0000-4000-8000-000000000002";

const users: Array<{
  email: string;
  name: string;
  role: UserRole;
}> = [
  {
    email: "organizer@ticket.local",
    name: "Organizador Seed",
    role: UserRole.ORGANIZER,
  },
  {
    email: "client1@ticket.local",
    name: "Cliente Um",
    role: UserRole.CLIENT,
  },
  {
    email: "client2@ticket.local",
    name: "Cliente Dois",
    role: UserRole.CLIENT,
  },
  {
    email: "gate@ticket.local",
    name: "Portaria Seed",
    role: UserRole.GATE,
  },
];

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.LOCAL_DATABASE_URL ?? "file:dev.db",
  });
  const prisma = new PrismaClient({ adapter });

  const password = await bcrypt.hash(SEED_PASSWORD, 10);

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        password,
        isActive: true,
      },
      update: {
        name: user.name,
        role: user.role,
        password,
        isActive: true,
      },
    });
  }

  const organizer = await prisma.user.findUniqueOrThrow({
    where: { email: "organizer@ticket.local" },
  });

  await prisma.ticketShare.deleteMany({
    where: {
      ticket: {
        eventId: { in: [SEAT_MAP_EVENT_ID, GA_SECTOR_EVENT_ID] },
      },
    },
  });
  await prisma.ticket.deleteMany({
    where: { eventId: { in: [SEAT_MAP_EVENT_ID, GA_SECTOR_EVENT_ID] } },
  });
  await prisma.payment.deleteMany({
    where: {
      reservation: {
        eventId: { in: [SEAT_MAP_EVENT_ID, GA_SECTOR_EVENT_ID] },
      },
    },
  });
  await prisma.reservationItem.deleteMany({
    where: {
      reservation: {
        eventId: { in: [SEAT_MAP_EVENT_ID, GA_SECTOR_EVENT_ID] },
      },
    },
  });
  await prisma.reservation.deleteMany({
    where: { eventId: { in: [SEAT_MAP_EVENT_ID, GA_SECTOR_EVENT_ID] } },
  });
  await prisma.seat.deleteMany({
    where: { eventId: { in: [SEAT_MAP_EVENT_ID, GA_SECTOR_EVENT_ID] } },
  });
  await prisma.sector.deleteMany({
    where: { eventId: { in: [SEAT_MAP_EVENT_ID, GA_SECTOR_EVENT_ID] } },
  });
  await prisma.event.deleteMany({
    where: { id: { in: [SEAT_MAP_EVENT_ID, GA_SECTOR_EVENT_ID] } },
  });

  const seatRows = ["A", "B", "C"];
  const seatsPerRow = 4;
  const seats = seatRows.flatMap((row) =>
    Array.from({ length: seatsPerRow }, (_, i) => {
      const number = i + 1;
      return {
        label: `${row}${number}`,
        row,
        number,
        status: SeatStatus.AVAILABLE,
      };
    }),
  );

  await prisma.event.create({
    data: {
      id: SEAT_MAP_EVENT_ID,
      organizerId: organizer.id,
      title: "Clube da Luta (Seed SEAT_MAP)",
      description: "Evento seed com mapa de assentos",
      venue: "Cinema Seed",
      startsAt: new Date("2026-09-01T20:00:00.000Z"),
      priceCents: 3500,
      status: EventStatus.PUBLISHED,
      inventoryMode: InventoryMode.SEAT_MAP,
      externalSource: ExternalSource.TMDB,
      externalId: "movie:550",
      imageUrl: "https://image.tmdb.org/t/p/w500/mCICnh7QBH0gzYaTQChBDDVIKdm.jpg",
      externalPayload: { seed: true, source: "tmdb" },
      seats: { createMany: { data: seats } },
    },
  });

  await prisma.event.create({
    data: {
      id: GA_SECTOR_EVENT_ID,
      organizerId: organizer.id,
      title: "Show Seed (GA_SECTOR)",
      description: "Evento seed com setores",
      venue: "Arena Seed",
      startsAt: new Date("2026-10-15T21:00:00.000Z"),
      priceCents: 8000,
      status: EventStatus.PUBLISHED,
      inventoryMode: InventoryMode.GA_SECTOR,
      externalSource: ExternalSource.TICKETMASTER,
      externalId: "seed-tm-event-1",
      imageUrl: null,
      externalPayload: { seed: true, source: "ticketmaster" },
      sectors: {
        createMany: {
          data: [
            {
              name: "Pista",
              capacity: 100,
              availableCount: 100,
              priceCents: null,
            },
            {
              name: "Camarote",
              capacity: 20,
              availableCount: 20,
              priceCents: 15000,
            },
          ],
        },
      },
    },
  });

  console.log("Seed OK — usuários:");
  for (const user of users) {
    console.log(`  ${user.email} (${user.role}) / ${SEED_PASSWORD}`);
  }
  console.log("Seed OK — eventos:");
  console.log(`  ${SEAT_MAP_EVENT_ID} SEAT_MAP PUBLISHED`);
  console.log(`  ${GA_SECTOR_EVENT_ID} GA_SECTOR PUBLISHED`);

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
