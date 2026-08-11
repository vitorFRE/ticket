"use client";

import Link from "next/link";
import {
  formatCountdown,
  reservationLineItems,
} from "@/features/reservations/reservation-summary";
import type { ReservationDetail } from "@/features/reservations/types";
import { useHoldCountdown } from "@/features/reservations/use-hold-countdown";

export function PendingHoldNotice({
  reservation,
  align = "start",
}: {
  reservation: ReservationDetail;
  align?: "start" | "end";
}) {
  const remainingMs = useHoldCountdown(reservation.expiresAt);
  if (remainingMs <= 0) return null;

  const items = reservationLineItems(reservation);
  const end = align === "end";

  return (
    <div className={end ? "text-right" : undefined}>
      <p className="font-mono text-[2.25rem] leading-none font-medium tracking-tight tabular-nums text-primary">
        {formatCountdown(remainingMs)}
      </p>
      {items ? (
        <p className="mt-3 text-sm font-medium tracking-tight text-foreground">
          {items}
        </p>
      ) : null}
      <p
        className={`mt-1 text-sm leading-relaxed text-white/40 ${end ? "ml-auto max-w-[22ch]" : "max-w-[28ch]"}`}
      >
        Se não pagar, esses lugares voltam à lista.
      </p>
      <Link
        href={`/reservations/${reservation.id}/pay`}
        className="mt-4 inline-block text-sm text-white/70 underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        Pagar agora
      </Link>
    </div>
  );
}
