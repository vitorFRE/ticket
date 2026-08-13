"use client";

import Link from "next/link";
import { EventImage } from "@/components/event-image";
import { formatDate, formatPrice } from "@/features/events/format";
import {
  formatCountdown,
  reservationLineItems,
  reservationTotalCents,
} from "@/features/reservations/reservation-summary";
import { SimulatedCardForm } from "@/features/reservations/components/simulated-card-form";
import type { ReservationDetail } from "@/features/reservations/types";

export function ReservationPayContent({
  reservation,
  imageUrl,
  remainingMs,
  expiredByClock,
  canPay,
  rejected,
  submitting,
  payError,
  onPay,
  holderName,
}: {
  reservation: ReservationDetail;
  imageUrl: string | null;
  remainingMs: number;
  expiredByClock: boolean;
  canPay: boolean;
  rejected: boolean;
  submitting: "APPROVED" | "REJECTED" | null;
  payError: string | null;
  onPay: (outcome: "APPROVED" | "REJECTED") => void;
  holderName: string;
}) {
  const expired =
    reservation.status === "EXPIRED" ||
    (reservation.status === "PENDING" && expiredByClock);
  const alreadyPaid = reservation.status === "PAID";
  const failed = reservation.status === "FAILED" || rejected;
  const pending = reservation.status === "PENDING" && !expired && !failed;
  const items = reservationLineItems(reservation);
  const total = formatPrice(reservationTotalCents(reservation));
  const eventHref = `/events/${reservation.event.id}`;

  return (
    <div className="space-y-16">
      <header className="flex flex-wrap items-start justify-between gap-x-16 gap-y-10">
        <EventHeading reservation={reservation} imageUrl={imageUrl} />
        {pending ? <HoldClock remainingMs={remainingMs} /> : null}
      </header>

      {failed ? (
        <ResultBlock
          title="Pagamento recusado"
          body={
            items
              ? `${items} voltaram à lista. Ninguém foi cobrado.`
              : "Os lugares voltaram à lista. Ninguém foi cobrado."
          }
          items={items}
          total={total}
          actionHref={eventHref}
          actionLabel="Escolher de novo"
        />
      ) : null}

      {expired && !failed ? (
        <ResultBlock
          title="A reserva expirou"
          body="O tempo do hold acabou. Esses lugares já estão de novo na lista."
          items={items}
          total={total}
          actionHref={eventHref}
          actionLabel="Escolher de novo"
        />
      ) : null}

      {alreadyPaid ? (
        <ResultBlock
          title="Pagamento confirmado"
          body="Essa reserva já foi paga."
          items={items}
          total={total}
        />
      ) : null}

      {pending ? (
        <div className="max-w-xl">
          <div className="flex items-end justify-between gap-6 border-t border-border pt-6">
            <p className="text-sm text-foreground/50">{items || "Reserva"}</p>
            <p className="text-3xl font-semibold tracking-tight">{total}</p>
          </div>
          <div className="mt-10 space-y-8">
            <SimulatedCardForm holderName={holderName} />
            {payError ? (
              <p className="text-sm text-destructive">{payError}</p>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                disabled={!canPay}
                onClick={() => onPay("APPROVED")}
                className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-[transform,opacity] hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              >
                {submitting === "APPROVED"
                  ? "Confirmando..."
                  : "Confirmar pagamento"}
              </button>
              <button
                type="button"
                disabled={!canPay}
                onClick={() => onPay("REJECTED")}
                className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-muted-foreground hover:underline disabled:opacity-30"
              >
                {submitting === "REJECTED" ? "Recusando..." : "Simular rejeição"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EventHeading({
  reservation,
  imageUrl,
}: {
  reservation: ReservationDetail;
  imageUrl: string | null;
}) {
  return (
    <div className="flex min-w-0 items-start gap-4">
      {imageUrl ? (
        <EventImage
          src={imageUrl}
          alt=""
          sizes="48px"
          className="h-[4.5rem] w-12 shrink-0 rounded-sm"
        />
      ) : null}
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
          {reservation.event.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate(reservation.event.startsAt)}
          <span className="mx-2 text-foreground/25">/</span>
          {reservation.event.venue}
        </p>
      </div>
    </div>
  );
}

function HoldClock({ remainingMs }: { remainingMs: number }) {
  return (
    <div className="text-right">
      <p className="font-mono text-[2.25rem] leading-none font-medium tracking-tight tabular-nums text-primary">
        {formatCountdown(remainingMs)}
      </p>
      <p className="mt-3 ml-auto max-w-[22ch] text-sm leading-relaxed text-muted-foreground">
        Se não pagar, esses lugares voltam à lista.
      </p>
    </div>
  );
}

function ResultBlock({
  title,
  body,
  items,
  total,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  items: string;
  total: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="max-w-xl">
      <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-[40ch] text-base leading-relaxed text-muted-foreground">
        {body}
      </p>
      <div className="mt-10 flex items-end justify-between gap-6 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">{items || "Reserva"}</p>
        <p className="text-2xl font-semibold tracking-tight text-muted-foreground">{total}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-8 inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-[transform,opacity] hover:opacity-90 active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
