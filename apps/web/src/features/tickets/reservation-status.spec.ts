import { describe, expect, it } from "vitest";
import {
  reservationHref,
  reservationStatusLabel,
} from "@/features/tickets/reservation-status";
import { makeReservation } from "@/test/fixtures";

describe("reservation-status", () => {
  it("labels each status", () => {
    expect(reservationStatusLabel("PENDING")).toBe("A pagar");
    expect(reservationStatusLabel("PAID")).toBe("Pago");
    expect(reservationStatusLabel("FAILED")).toBe("Recusado");
    expect(reservationStatusLabel("EXPIRED")).toBe("Expirou");
    expect(reservationStatusLabel("CANCELLED")).toBe("Cancelada");
  });

  it("sends pending holds to pay and paid ones to the first ticket", () => {
    expect(reservationHref(makeReservation({ id: "res-9" }))).toBe(
      "/reservations/res-9/pay",
    );
    expect(
      reservationHref(
        makeReservation({
          status: "PAID",
          tickets: [{ id: "tkt-3", code: "abc", status: "VALID" }],
        }),
      ),
    ).toBe("/tickets/tkt-3");
    expect(reservationHref(makeReservation({ status: "FAILED" }))).toBeNull();
  });
});
