"use client";

import Link from "next/link";
import { formatPrice } from "@/features/events/format";
import type { EventSeat } from "@/features/events/types";
import type { LockedHold } from "@/features/reservations/locked-hold";
import { cn } from "@/lib/utils";

function groupByRow(seats: EventSeat[]) {
  const rows = new Map<string, EventSeat[]>();
  for (const seat of seats) {
    const list = rows.get(seat.row) ?? [];
    list.push(seat);
    rows.set(seat.row, list);
  }
  return [...rows.entries()].map(([row, items]) => ({
    row,
    items: items.sort((a, b) => a.number - b.number),
  }));
}

function SeatButton({
  seat,
  active,
  heldByYou,
  locked,
  onToggle,
}: {
  seat: EventSeat;
  active: boolean;
  heldByYou: boolean;
  locked: boolean;
  onToggle: (seat: EventSeat) => void;
}) {
  const taken = seat.status !== "AVAILABLE";
  const blocked = taken || locked;
  return (
    <button
      type="button"
      disabled={blocked}
      onClick={() => onToggle(seat)}
      className={cn(
        "h-8 w-7 shrink-0 rounded-t-md rounded-b-[3px] border text-[10px] font-medium transition-colors",
        taken &&
          !heldByYou &&
          "cursor-not-allowed border-transparent bg-muted text-foreground/20",
        heldByYou &&
          "cursor-not-allowed border-primary/50 bg-primary/25 text-primary",
        locked &&
          !taken &&
          !heldByYou &&
          "cursor-not-allowed border-border bg-transparent text-foreground/25",
        !blocked &&
          !active &&
          "border-border bg-card/60 text-muted-foreground hover:border-primary/70 hover:bg-primary/15 hover:text-foreground",
        active && "border-primary bg-primary text-primary-foreground",
      )}
      aria-pressed={active}
      aria-label={seat.label}
    >
      {seat.number}
    </button>
  );
}

export function SeatMapPicker({
  seats,
  selectedIds,
  heldIds = [],
  onToggle,
  priceCents,
  submitting,
  onConfirm,
  lockedHold = null,
}: {
  seats: EventSeat[];
  selectedIds: string[];
  heldIds?: string[];
  onToggle: (seat: EventSeat) => void;
  priceCents: number;
  submitting: boolean;
  onConfirm: () => void;
  lockedHold?: LockedHold | null;
}) {
  const rows = groupByRow(seats);
  const selected = new Set(selectedIds);
  const held = new Set(heldIds);
  const locked = !!lockedHold;
  const selectedSeats = seats.filter((seat) => selected.has(seat.id));
  const total = locked
    ? (lockedHold?.totalCents ?? 0)
    : selectedIds.length * priceCents;

  return (
    <div className="space-y-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8 px-8">
          <div className="h-1.5 rounded-full bg-gradient-to-r from-transparent via-foreground/40 to-transparent" />
          <p className="mt-3 text-center text-[11px] tracking-[0.28em] text-muted-foreground">
            TELA
          </p>
        </div>

        <div className="space-y-2.5">
          {rows.map(({ row, items }) => {
            const aisleAt = Math.ceil(items.length / 2);
            const left = items.slice(0, aisleAt);
            const right = items.slice(aisleAt);
            return (
              <div
                key={row}
                className="flex items-center justify-center gap-3"
              >
                <span className="w-4 text-right text-[11px] text-foreground/35">
                  {row}
                </span>
                <div className="flex items-center gap-1.5">
                  {left.map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      active={selected.has(seat.id)}
                      heldByYou={held.has(seat.id)}
                      locked={locked}
                      onToggle={onToggle}
                    />
                  ))}
                </div>
                <div className="w-6 shrink-0" aria-hidden />
                <div className="flex items-center gap-1.5">
                  {right.map((seat) => (
                    <SeatButton
                      key={seat.id}
                      seat={seat}
                      active={selected.has(seat.id)}
                      heldByYou={held.has(seat.id)}
                      locked={locked}
                      onToggle={onToggle}
                    />
                  ))}
                </div>
                <span className="w-4 text-[11px] text-foreground/35">{row}</span>
              </div>
            );
          })}
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-5 text-[11px] text-foreground/50">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-t-sm border border-border bg-card/60" />
            Livre
          </li>
          {locked ? null : (
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-t-sm bg-primary" />
              Escolhido
            </li>
          )}
          {held.size > 0 ? (
            <li className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-t-sm border border-primary/50 bg-primary/25" />
              Seu hold
            </li>
          ) : null}
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-t-sm bg-muted" />
            Ocupado
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border pt-6">
        <div>
          <p className="text-xs text-muted-foreground">
            {locked
              ? lockedHold?.labels || "Reserva pendente"
              : selectedSeats.length === 0
                ? "Toque nos assentos em frente à tela"
                : selectedSeats.map((seat) => seat.label).join(", ")}
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {formatPrice(total)}
          </p>
        </div>
        {locked && lockedHold ? (
          <Link
            href={lockedHold.payHref}
            className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-[transform,opacity] hover:opacity-90 active:scale-[0.98]"
          >
            Pagar agora
          </Link>
        ) : (
          <button
            type="button"
            disabled={selectedIds.length === 0 || submitting}
            onClick={onConfirm}
            className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-[transform,opacity] hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
          >
            {submitting ? "Reservando..." : "Confirmar reserva"}
          </button>
        )}
      </div>
    </div>
  );
}
