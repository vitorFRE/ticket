/*
  Warnings:

  - Added the required column `availableCount` to the `Sector` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReservationItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reservationId" TEXT NOT NULL,
    "seatId" TEXT,
    "sectorId" TEXT,
    "quantity" INTEGER,
    CONSTRAINT "ReservationItem_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReservationItem_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "Seat" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ReservationItem_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "availableCount" INTEGER NOT NULL,
    "priceCents" INTEGER,
    CONSTRAINT "Sector_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Sector" ("capacity", "eventId", "id", "name", "priceCents", "availableCount") SELECT "capacity", "eventId", "id", "name", "priceCents", "capacity" FROM "Sector";
DROP TABLE "Sector";
ALTER TABLE "new_Sector" RENAME TO "Sector";
CREATE INDEX "Sector_eventId_idx" ON "Sector"("eventId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Reservation_userId_idx" ON "Reservation"("userId");

-- CreateIndex
CREATE INDEX "Reservation_eventId_status_idx" ON "Reservation"("eventId", "status");

-- CreateIndex
CREATE INDEX "Reservation_status_expiresAt_idx" ON "Reservation"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "ReservationItem_reservationId_idx" ON "ReservationItem"("reservationId");

-- CreateIndex
CREATE INDEX "ReservationItem_seatId_idx" ON "ReservationItem"("seatId");

-- CreateIndex
CREATE INDEX "ReservationItem_sectorId_idx" ON "ReservationItem"("sectorId");
