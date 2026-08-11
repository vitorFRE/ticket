-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "venue" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "gateOpensHoursBefore" INTEGER,
    "priceCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "inventoryMode" TEXT NOT NULL,
    "externalSource" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "externalPayload" JSONB,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("id", "organizerId", "title", "description", "venue", "startsAt", "gateOpensHoursBefore", "priceCents", "status", "inventoryMode", "externalSource", "externalId", "externalPayload", "imageUrl", "createdAt", "updatedAt") SELECT "id", "organizerId", "title", "description", "venue", "startsAt", "gateOpensHoursBefore", "priceCents", "status", "inventoryMode", "externalSource", "externalId", "externalPayload", "imageUrl", "createdAt", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_status_idx" ON "Event"("status");
CREATE INDEX "Event_organizerId_idx" ON "Event"("organizerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Seed events keep no gate window
UPDATE "Event" SET "gateOpensHoursBefore" = NULL;
