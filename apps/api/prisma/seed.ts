import { resolve } from "node:path";
import { config } from "dotenv";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import { loadCatalogSnapshots } from "./seed/catalog";
import { createSeedEvents } from "./seed/events";
import { SEED_PASSWORD, SEED_USERS, upsertSeedUsers } from "./seed/users";
import { wipeOrganizerEvents } from "./seed/wipe";

config({ path: resolve(__dirname, "../.env") });

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.LOCAL_DATABASE_URL ?? "file:dev.db",
  });
  const prisma = new PrismaClient({ adapter });

  const organizer = await upsertSeedUsers(prisma);
  await wipeOrganizerEvents(prisma, organizer.id);

  const { movies, shows } = await loadCatalogSnapshots();
  const created = await createSeedEvents(
    prisma,
    organizer.id,
    movies,
    shows,
  );

  console.log("Seed OK — usuários:");
  for (const user of SEED_USERS) {
    console.log(`  ${user.email} (${user.role}) / ${SEED_PASSWORD}`);
  }
  console.log("Seed OK — eventos:");
  for (const event of created) {
    const origin = event.item.imageUrl ? "catalog" : "sem imagem";
    console.log(
      `  ${event.item.title} [${event.inventoryMode}] ${event.startsAt.toISOString()} (${origin})`,
    );
  }
  if (shows.length === 0) {
    console.log(
      "Seed aviso: Ticketmaster indisponível; shows GA usaram fallback TMDb.",
    );
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
