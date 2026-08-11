"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PageState } from "@/components/page-state";
import { useRequireRole } from "@/features/auth/use-require-role";
import {
  getEventById,
  getEventSeats,
  getEventSectors,
} from "@/features/events/api/events-api";
import type {
  EventDetail,
  EventSeat,
  EventSector,
} from "@/features/events/types";
import { formatDate } from "@/features/events/format";
import { createReservation } from "@/features/reservations/api/reservations-api";
import { PendingHoldNotice } from "@/features/reservations/components/pending-hold-notice";
import { SeatMapPicker } from "@/features/reservations/components/seat-map-picker";
import { SectorPicker } from "@/features/reservations/components/sector-picker";
import type { LockedHold } from "@/features/reservations/locked-hold";
import {
  reservationLineItems,
  reservationTotalCents,
} from "@/features/reservations/reservation-summary";
import { usePendingHold } from "@/features/reservations/use-pending-hold";
import { HttpError } from "@/shared/api/http-error";

export function EventCheckoutPage({ eventId }: { eventId: string }) {
  const { ready } = useRequireRole("CLIENT");
  const router = useRouter();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [seats, setSeats] = useState<EventSeat[]>([]);
  const [sectors, setSectors] = useState<EventSector[]>([]);
  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const pendingHold = usePendingHold(eventId);
  const lockedHold: LockedHold | null = pendingHold
    ? {
        payHref: `/reservations/${pendingHold.id}/pay`,
        labels: reservationLineItems(pendingHold),
        totalCents: reservationTotalCents(pendingHold),
      }
    : null;

  const loadInventory = useCallback(async (detail: EventDetail) => {
    if (detail.inventoryMode === "SEAT_MAP") {
      const data = await getEventSeats(detail.id);
      setSeats(data.items);
      setSectors([]);
      return;
    }
    const data = await getEventSectors(detail.id);
    setSectors(data.items);
    setSeats([]);
  }, []);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    void (async () => {
      try {
        const detail = await getEventById(eventId);
        if (cancelled) return;
        setEvent(detail);
        await loadInventory(detail);
      } catch (err) {
        if (cancelled) return;
        setEvent(null);
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
  }, [ready, eventId, loadInventory]);

  function toggleSeat(seat: EventSeat) {
    if (pendingHold || seat.status !== "AVAILABLE") return;
    setSelectedSeatIds((current) =>
      current.includes(seat.id)
        ? current.filter((id) => id !== seat.id)
        : [...current, seat.id],
    );
  }

  function selectSector(sector: EventSector) {
    if (pendingHold) return;
    setSelectedSectorId(sector.id);
    setQuantity(1);
  }

  async function onConfirm() {
    if (!event || pendingHold) return;
    setSubmitting(true);
    setConflict(null);
    try {
      const reservation =
        event.inventoryMode === "SEAT_MAP"
          ? await createReservation({
              eventId: event.id,
              seatIds: selectedSeatIds,
            })
          : await createReservation({
              eventId: event.id,
              sectorId: selectedSectorId ?? "",
              quantity,
            });
      router.push(`/reservations/${reservation.id}/pay`);
    } catch (err) {
      if (err instanceof HttpError && err.status === 409) {
        setConflict(
          "Esses lugares acabaram de ser reservados. Atualize e tente de novo.",
        );
        setSelectedSeatIds([]);
        setSelectedSectorId(null);
        setQuantity(1);
        try {
          await loadInventory(event);
        } catch {
          setError("network");
        }
        return;
      }
      setConflict(
        err instanceof Error
          ? err.message
          : "Não foi possível criar a reserva.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 md:px-6 lg:px-8 lg:pt-10">
        <div className="h-64 animate-pulse rounded-lg bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <div className="relative z-10 flex-1">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 md:px-6 lg:px-8 lg:pt-10">
        <Link
          href={`/events/${eventId}`}
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon size={16} weight="bold" />
          Evento
        </Link>

        {isLoading ? (
          <div className="h-64 animate-pulse rounded-lg bg-white/[0.04]" />
        ) : null}

        {error === "not-found" ? (
          <PageState
            title="Evento não encontrado"
            body="Esse evento não existe ou não está disponível."
          />
        ) : null}

        {error === "network" ? (
          <PageState
            title="Não foi possível carregar"
            body="Não foi possível carregar o inventário."
          />
        ) : null}

        {event && !error ? (
          <div className="space-y-12">
            <div className="flex flex-wrap items-start justify-between gap-x-12 gap-y-8">
              <div className="flex min-w-0 items-start gap-4">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt=""
                    className="h-[4.5rem] w-12 shrink-0 rounded-sm object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                    {event.title}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(event.startsAt)}
                    <span className="mx-2 text-white/25">/</span>
                    {event.venue}
                  </p>
                  {pendingHold ? null : (
                    <p className="mt-2 text-xs text-white/40">
                      Os lugares ficam reservados por 15 minutos.
                    </p>
                  )}
                </div>
              </div>

              {pendingHold ? (
                <PendingHoldNotice reservation={pendingHold} align="end" />
              ) : null}
            </div>

            {conflict ? (
              <p className="text-sm text-destructive">{conflict}</p>
            ) : null}

            {event.inventoryMode === "SEAT_MAP" ? (
              <SeatMapPicker
                seats={seats}
                selectedIds={selectedSeatIds}
                heldIds={
                  pendingHold?.items
                    .map((item) => item.seat?.id)
                    .filter((id): id is string => !!id) ?? []
                }
                onToggle={toggleSeat}
                priceCents={event.priceCents}
                submitting={submitting}
                onConfirm={() => void onConfirm()}
                lockedHold={lockedHold}
              />
            ) : (
              <SectorPicker
                sectors={sectors}
                selectedId={selectedSectorId}
                quantity={quantity}
                onSelect={selectSector}
                onQuantity={setQuantity}
                submitting={submitting}
                onConfirm={() => void onConfirm()}
                lockedHold={lockedHold}
              />
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
