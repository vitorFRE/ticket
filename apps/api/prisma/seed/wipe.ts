import { PrismaClient } from "../../src/generated/prisma/client";

export async function wipeOrganizerEvents(
  prisma: PrismaClient,
  organizerId: string,
) {
  const events = await prisma.event.findMany({
    where: { organizerId },
    select: { id: true },
  });
  const ids = events.map((event) => event.id);
  if (ids.length === 0) return;

  await prisma.ticketShare.deleteMany({
    where: { ticket: { eventId: { in: ids } } },
  });
  await prisma.ticket.deleteMany({ where: { eventId: { in: ids } } });
  await prisma.payment.deleteMany({
    where: { reservation: { eventId: { in: ids } } },
  });
  await prisma.reservationItem.deleteMany({
    where: { reservation: { eventId: { in: ids } } },
  });
  await prisma.reservation.deleteMany({ where: { eventId: { in: ids } } });
  await prisma.seat.deleteMany({ where: { eventId: { in: ids } } });
  await prisma.sector.deleteMany({ where: { eventId: { in: ids } } });
  await prisma.event.deleteMany({ where: { id: { in: ids } } });
}
