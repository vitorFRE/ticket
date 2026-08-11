import type { ReservationDetail } from "@/features/reservations/types";

export function reservationLineItems(reservation: ReservationDetail) {
  const seats = reservation.items
    .map((item) => item.seat?.label)
    .filter((label): label is string => !!label);
  if (seats.length > 0) {
    return seats.join(", ");
  }

  return reservation.items
    .map((item) => {
      if (!item.sector) return null;
      const qty = item.quantity ?? 1;
      return `${item.sector.name} x ${qty}`;
    })
    .filter((line): line is string => !!line)
    .join(", ");
}

export function reservationTotalCents(reservation: ReservationDetail) {
  const seatCount = reservation.items.filter((item) => item.seat).length;
  if (seatCount > 0) {
    return seatCount * reservation.event.priceCents;
  }

  return reservation.items.reduce((sum, item) => {
    if (!item.sector) return sum;
    const qty = item.quantity ?? 1;
    const unit = item.sector.priceCents ?? reservation.event.priceCents;
    return sum + qty * unit;
  }, 0);
}

export function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
