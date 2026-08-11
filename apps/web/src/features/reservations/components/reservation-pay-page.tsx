"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { PageState } from "@/components/page-state";
import { TicketRowSkeletonList } from "@/components/skeletons/ticket-row-skeleton";
import { useRequireRole } from "@/features/auth/use-require-role";
import { useEventDetail } from "@/features/events/use-events-query";
import { ReservationPayContent } from "@/features/reservations/components/reservation-pay-content";
import {
  usePayReservation,
  useReservationDetail,
} from "@/features/reservations/use-reservations-query";
import { useHoldCountdown } from "@/features/reservations/use-hold-countdown";
import { HttpError } from "@/shared/api/http-error";
import { isHttpNotFound } from "@/shared/api/query-error";

export function ReservationPayPage({ reservationId }: { reservationId: string }) {
  const { ready, user } = useRequireRole("CLIENT");
  const router = useRouter();
  const reservationQuery = useReservationDetail(reservationId, ready);
  const reservation = reservationQuery.data ?? null;
  const eventQuery = useEventDetail(reservation?.event.id ?? "", Boolean(reservation));
  const payMutation = usePayReservation(reservationId);

  const [rejected, setRejected] = useState(false);
  const [blockedExpired, setBlockedExpired] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const remainingMs = useHoldCountdown(reservation?.expiresAt ?? null);
  const expiredByClock = remainingMs <= 0 || blockedExpired;
  const pending = reservation?.status === "PENDING";
  const canPay =
    pending &&
    !expiredByClock &&
    !rejected &&
    !payMutation.isPending &&
    !blockedExpired;

  async function onPay(outcome: "APPROVED" | "REJECTED") {
    setPayError(null);
    try {
      const paid = await payMutation.mutateAsync(outcome);
      if (outcome === "APPROVED") {
        const ticketId = paid.tickets[0]?.id;
        router.push(ticketId ? `/tickets/${ticketId}` : "/tickets");
        return;
      }
      setRejected(true);
    } catch (err) {
      if (err instanceof HttpError && err.status === 400) {
        setBlockedExpired(true);
        void reservationQuery.refetch();
        return;
      }
      setPayError(
        err instanceof Error ? err.message : "Não foi possível concluir.",
      );
    }
  }

  if (!ready || !user || reservationQuery.isPending) {
    return (
      <PayShell>
        <TicketRowSkeletonList count={2} />
      </PayShell>
    );
  }

  const notFound =
    reservationQuery.isError && isHttpNotFound(reservationQuery.error);

  return (
    <PayShell>
      <Link
        href={reservation ? `/events/${reservation.event.id}` : "/"}
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon size={16} weight="bold" />
        Evento
      </Link>

      {notFound ? (
        <PageState
          title="Reserva não encontrada"
          body="Essa reserva não existe ou não está disponível."
        />
      ) : null}

      {reservationQuery.isError && !notFound ? (
        <PageState
          title="Não foi possível carregar"
          body="Não foi possível carregar a reserva."
        />
      ) : null}

      {reservation && !reservationQuery.isError ? (
        <ReservationPayContent
          reservation={reservation}
          imageUrl={eventQuery.data?.imageUrl ?? null}
          remainingMs={remainingMs}
          expiredByClock={expiredByClock}
          canPay={canPay}
          rejected={rejected}
          submitting={payMutation.isPending ? payMutation.variables ?? null : null}
          payError={payError}
          onPay={onPay}
          holderName={user.name?.trim() || "Cliente Um"}
        />
      ) : null}
    </PayShell>
  );
}

function PayShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex-1">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 md:px-6 lg:px-8 lg:pt-10">
        {children}
      </div>
    </div>
  );
}
