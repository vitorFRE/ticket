import { BadRequestException } from "@nestjs/common";
import {
  DEFAULT_SEAT_ROWS,
  DEFAULT_SEATS_PER_ROW,
  InventoryService,
} from "./inventory.service";

describe("InventoryService", () => {
  const service = new InventoryService();

  it("builds default seat grid A-J x 12", () => {
    const seats = service.buildSeats();
    expect(seats).toHaveLength(
      DEFAULT_SEAT_ROWS.length * DEFAULT_SEATS_PER_ROW,
    );
    expect(seats[0]).toEqual({
      label: "A1",
      row: "A",
      number: 1,
      status: "AVAILABLE",
    });
    expect(seats.at(-1)?.label).toBe("J12");
  });

  it("builds custom rows and seatsPerRow", () => {
    const seats = service.buildSeats({ rows: ["a", "b"], seatsPerRow: 2 });
    expect(seats.map((s) => s.label)).toEqual(["A1", "A2", "B1", "B2"]);
  });

  it("rejects duplicate rows", () => {
    expect(() => service.buildSeats({ rows: ["A", "A"] })).toThrow(
      BadRequestException,
    );
  });

  it("builds sectors", () => {
    const sectors = service.buildSectors([
      { name: " Pista ", capacity: 10 },
      { name: "VIP", capacity: 5, priceCents: 2000 },
    ]);
    expect(sectors).toEqual([
      { name: "Pista", capacity: 10, priceCents: null },
      { name: "VIP", capacity: 5, priceCents: 2000 },
    ]);
  });

  it("requires sectors for GA", () => {
    expect(() => service.buildSectors(undefined)).toThrow(BadRequestException);
    expect(() => service.buildSectors([])).toThrow(BadRequestException);
  });
});
