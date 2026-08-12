"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageState } from "@/components/page-state";
import { PagePulse } from "@/components/skeletons/page-pulse";
import { useRequireRole } from "@/features/auth/use-require-role";
import { GateLimitNote } from "@/features/events/components/gate-limit-note";
import { formatDate } from "@/features/events/format";
import type { EventSeat, EventSector } from "@/features/events/types";
import {
  useEventDetail,
  useEventSeats,
  useEventSectors,
} from "@/features/events/use-events-query";
import { PendingHoldNotice } from "@/features/reservations/components/pending-hold-notice";
import { SeatMapPicker } from "@/features/reservations/components/seat-map-picker";
import { SectorPicker } from "@/features/reservations/components/sector-picker";
import type { LockedHold } from "@/features/reservations/locked-hold";
import {
  reservationLineItems,
  reservationTotalCents,
} from "@/features/reservations/reservation-summary";
import { usePendingHold } from "@/features/reservations/use-pending-hold";
import { useCreateReservation } from "@/features/reservations/use-reservations-query";
import { HttpError } from "@/shared/api/http-error";
import { isHttpNotFound } from "@/shared/api/query-error";

export function EventCheckoutPage({ eventId }: { eventId: string }) {
  const { ready } = useRequireRole("CLIENT");
  const router = useRouter();

  const eventQuery = useEventDetail(eventId, ready);
  const event = eventQuery.data ?? null;
  const seatsQuery = useEventSeats(
    eventId,
    ready && event?.inventoryMode === "SEAT_MAP",
  );
  const sectorsQuery = useEventSectors(
    eventId,
    ready && event?.inventoryMode === "GA_SECTOR",
  );

  const [conflict, setConflict] = useState<string | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const pendingHold = usePendingHold(eventId);
  const createReservation = useCreateReservation();
  const lockedHold: LockedHold | null = pendingHold
    ? {
        payHref: `/reservations/${pendingHold.id}/pay`,
        labels: reservationLineItems(pendingHold),
        totalCents: reservationTotalCents(pendingHold),
      }
    : null;

  const seats = seatsQuery.data?.items ?? [];
  const sectors = sectorsQuery.data?.items ?? [];
  const inventoryPending =
    event?.inventoryMode === "SEAT_MAP"
      ? seatsQuery.isPending
      : event?.inventoryMode === "GA_SECTOR"
        ? sectorsQuery.isPending
        : false;
  const isPending = eventQuery.isPending || inventoryPending;
  const notFound = eventQuery.isError && isHttpNotFound(eventQuery.error);
  const network =
    (eventQuery.isError && !notFound) ||
    seatsQuery.isError ||
    sectorsQuery.isError;

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
    setConflict(null);
    try {
      const reservation =
        event.inventoryMode === "SEAT_MAP"
          ? await createReservation.mutateAsync({
              eventId: event.id,
              seatIds: selectedSeatIds,
            })
          : await createReservation.mutateAsync({
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
        if (event.inventoryMode === "SEAT_MAP") {
          void seatsQuery.refetch();
        } else {
          void sectorsQuery.refetch();
        }
        return;
      }
      setConflict(
        err instanceof Error
          ? err.message
          : "Não foi possível criar a reserva.",
      );
    }
  }

  if (!ready || isPending) {
    return (
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 md:px-6 lg:px-8 lg:pt-10">
        <PagePulse className="h-64" />
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

        {notFound ? (
          <PageState
            title="Evento não encontrado"
            body="Esse evento não existe ou não está disponível."
          />
        ) : null}

        {network ? (
          <PageState
            title="Não foi possível carregar"
            body="Não foi possível carregar o inventário."
          />
        ) : null}

        {event && !notFound && !network ? (
          <div className="space-y-12">
            <div className="flex flex-wrap items-start justify-between gap-x-12 gap-y-8">
              <div className="flex min-w-0 items-start gap-4">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt=""
                    className="h-18 w-12 shrink-0 rounded-sm object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                    {event.title}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(event.startsAt)}
                    <span className="mx-2 text-foreground/25">/</span>
                    {event.venue}
                  </p>
                  <GateLimitNote
                    hoursBefore={event.gateOpensHoursBefore}
                    className="mt-2"
                  />
                  {pendingHold ? null : (
                    <p className="mt-2 text-xs text-muted-foreground">
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
                submitting={createReservation.isPending}
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
                submitting={createReservation.isPending}
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
