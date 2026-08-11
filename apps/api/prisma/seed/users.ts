import * as bcrypt from "bcrypt";
import { PrismaClient, UserRole } from "../../src/generated/prisma/client";

export const SEED_PASSWORD = "Password123!";

export const SEED_USERS: Array<{
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

export async function upsertSeedUsers(prisma: PrismaClient) {
  const password = await bcrypt.hash(SEED_PASSWORD, 10);
  for (const user of SEED_USERS) {
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

  return prisma.user.findUniqueOrThrow({
    where: { email: "organizer@ticket.local" },
  });
}
