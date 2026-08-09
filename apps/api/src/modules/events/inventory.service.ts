import { BadRequestException, Injectable } from "@nestjs/common";
import { SeatStatus } from "../../generated/prisma/enums";
import type { SectorInputDto } from "./dto/create-event.dto";

export const DEFAULT_SEAT_ROWS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
] as const;

export const DEFAULT_SEATS_PER_ROW = 12;

export type SeatCreateInput = {
  label: string;
  row: string;
  number: number;
  status: typeof SeatStatus.AVAILABLE;
};

export type SectorCreateInput = {
  name: string;
  capacity: number;
  priceCents: number | null;
};

@Injectable()
export class InventoryService {
  buildSeats(input?: {
    rows?: string[];
    seatsPerRow?: number;
  }): SeatCreateInput[] {
    const rows = input?.rows?.length
      ? input.rows.map((row) => row.trim().toUpperCase())
      : [...DEFAULT_SEAT_ROWS];
    const seatsPerRow = input?.seatsPerRow ?? DEFAULT_SEATS_PER_ROW;

    if (rows.length === 0) {
      throw new BadRequestException("seatMap.rows não pode ser vazio");
    }
    if (seatsPerRow < 1) {
      throw new BadRequestException("seatMap.seatsPerRow deve ser >= 1");
    }

    const uniqueRows = new Set(rows);
    if (uniqueRows.size !== rows.length) {
      throw new BadRequestException("seatMap.rows contém fileiras duplicadas");
    }

    const seats: SeatCreateInput[] = [];
    for (const row of rows) {
      if (!row) {
        throw new BadRequestException("seatMap.rows contém fileira inválida");
      }
      for (let number = 1; number <= seatsPerRow; number += 1) {
        seats.push({
          label: `${row}${number}`,
          row,
          number,
          status: SeatStatus.AVAILABLE,
        });
      }
    }
    return seats;
  }

  buildSectors(sectors: SectorInputDto[] | undefined): SectorCreateInput[] {
    if (!sectors?.length) {
      throw new BadRequestException(
        "sectors é obrigatório para inventoryMode GA_SECTOR",
      );
    }

    return sectors.map((sector) => ({
      name: sector.name.trim(),
      capacity: sector.capacity,
      priceCents: sector.priceCents ?? null,
    }));
  }
}
