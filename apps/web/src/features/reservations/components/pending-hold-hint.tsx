"use client";

import Link from "next/link";
import {
  formatCountdown,
  reservationLineItems,
} from "@/features/reservations/reservation-summary";
import type { ReservationDetail } from "@/features/reservations/types";
import { useHoldCountdown } from "@/features/reservations/use-hold-countdown";

export function PendingHoldHint({
  reservation,
}: {
  reservation: ReservationDetail;
}) {
  const remainingMs = useHoldCountdown(reservation.expiresAt);
  if (remainingMs <= 0) return null;

  const items = reservationLineItems(reservation);

  return (
    <p className="max-w-xs text-right text-sm leading-relaxed text-muted-foreground">
      {items ? `${items} reservados. ` : "Reserva pendente. "}
      <span className="font-mono tabular-nums text-primary">
        {formatCountdown(remainingMs)}
      </span>
      {" · "}
      <Link
        href={`/reservations/${reservation.id}/pay`}
        className="text-foreground/80 underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        Pagar
      </Link>
    </p>
  );
}
