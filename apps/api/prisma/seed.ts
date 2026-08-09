import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as bcrypt from "bcrypt";
import { PrismaClient, UserRole } from "../src/generated/prisma/client";

const SEED_PASSWORD = "Password123!";

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

  console.log("Seed OK — usuários:");
  for (const user of users) {
    console.log(`  ${user.email} (${user.role}) / ${SEED_PASSWORD}`);
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
