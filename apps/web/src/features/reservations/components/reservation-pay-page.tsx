"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { getEventById } from "@/features/events/api/events-api";
import type { EventDetail } from "@/features/events/types";
import {
  getReservation,
  payReservation,
} from "@/features/reservations/api/reservations-api";
import { ReservationPayContent } from "@/features/reservations/components/reservation-pay-content";
import type { ReservationDetail } from "@/features/reservations/types";
import { useHoldCountdown } from "@/features/reservations/use-hold-countdown";
import { HttpError } from "@/shared/api/http-error";

export function ReservationPayPage({ reservationId }: { reservationId: string }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const payPath = `/reservations/${reservationId}/pay`;

  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState<"APPROVED" | "REJECTED" | null>(
    null,
  );
  const [rejected, setRejected] = useState(false);
  const [blockedExpired, setBlockedExpired] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(payPath)}`);
      return;
    }
    if (user.role !== "CLIENT") {
      router.replace("/");
    }
  }, [authLoading, user, router, payPath]);

  useEffect(() => {
    if (authLoading || user?.role !== "CLIENT") return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    void (async () => {
      try {
        const data = await getReservation(reservationId);
        if (cancelled) return;
        setReservation(data);
        try {
          const detail = await getEventById(data.event.id);
          if (!cancelled) setEvent(detail);
        } catch {
          if (!cancelled) setEvent(null);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof HttpError && err.status === 404) {
          setError("not-found");
          return;
        }
        setError("network");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.role, reservationId]);

  const remainingMs = useHoldCountdown(reservation?.expiresAt ?? null);
  const expiredByClock = remainingMs <= 0 || blockedExpired;
  const pending = reservation?.status === "PENDING";
  const canPay =
    pending && !expiredByClock && !rejected && !submitting && !blockedExpired;

  async function onPay(outcome: "APPROVED" | "REJECTED") {
    setSubmitting(outcome);
    setPayError(null);
    try {
      const paid = await payReservation(reservationId, outcome);
      if (outcome === "APPROVED") {
        const ticketId = paid.tickets[0]?.id;
        router.push(ticketId ? `/tickets/${ticketId}` : "/tickets");
        return;
      }
      setReservation(paid);
      setRejected(true);
    } catch (err) {
      if (err instanceof HttpError && err.status === 400) {
        setBlockedExpired(true);
        try {
          const fresh = await getReservation(reservationId);
          setReservation(fresh);
        } catch {
          // keep the expired copy from the current reservation
        }
        return;
      }
      setPayError(
        err instanceof Error ? err.message : "Não foi possível concluir.",
      );
    } finally {
      setSubmitting(null);
    }
  }

  if (authLoading || !user || user.role !== "CLIENT") {
    return <PayShell><Pulse /></PayShell>;
  }

  return (
    <PayShell>
      <Link
        href={reservation ? `/events/${reservation.event.id}` : "/"}
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon size={16} weight="bold" />
        Evento
      </Link>

      {isLoading ? <Pulse /> : null}

      {error === "not-found" ? (
        <p className="text-muted-foreground">Reserva não encontrada.</p>
      ) : null}

      {error === "network" ? (
        <p className="text-muted-foreground">Não foi possível carregar a reserva.</p>
      ) : null}

      {reservation && !error ? (
        <ReservationPayContent
          reservation={reservation}
          imageUrl={event?.imageUrl ?? null}
          remainingMs={remainingMs}
          expiredByClock={expiredByClock}
          canPay={canPay}
          rejected={rejected}
          submitting={submitting}
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
      <div className="mx-auto max-w-6xl px-4 pt-28 pb-20 md:px-6 lg:px-8 lg:pt-32">
        {children}
      </div>
    </div>
  );
}

function Pulse() {
  return <div className="h-48 animate-pulse rounded-lg bg-white/[0.04]" />;
}
