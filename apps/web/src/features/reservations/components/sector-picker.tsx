"use client";

import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { formatPrice } from "@/features/events/format";
import type { EventSector } from "@/features/events/types";
import type { LockedHold } from "@/features/reservations/locked-hold";
import { cn } from "@/lib/utils";

export function SectorPicker({
  sectors,
  selectedId,
  quantity,
  onSelect,
  onQuantity,
  submitting,
  onConfirm,
  lockedHold = null,
}: {
  sectors: EventSector[];
  selectedId: string | null;
  quantity: number;
  onSelect: (sector: EventSector) => void;
  onQuantity: (value: number) => void;
  submitting: boolean;
  onConfirm: () => void;
  lockedHold?: LockedHold | null;
}) {
  const locked = !!lockedHold;
  const selected = sectors.find((sector) => sector.id === selectedId) ?? null;
  const max = selected?.availableCount ?? 0;
  const total = locked
    ? (lockedHold?.totalCents ?? 0)
    : selected
      ? quantity * selected.priceCents
      : 0;

  return (
    <div className="space-y-10">
      <ul className="divide-y divide-border">
        {sectors.map((sector) => {
          const active = sector.id === selectedId;
          const soldOut = sector.availableCount < 1;
          return (
            <li key={sector.id} className="py-5">
              <button
                type="button"
                disabled={soldOut || locked}
                onClick={() => onSelect(sector)}
                className={cn(
                  "flex w-full items-baseline justify-between gap-4 text-left transition-colors",
                  soldOut && "cursor-not-allowed opacity-40",
                  !soldOut && !active && "hover:text-primary",
                )}
              >
                <span>
                  <span
                    className={cn(
                      "block text-base font-medium",
                      active ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {sector.name}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {soldOut
                      ? "Esgotado"
                      : `${sector.availableCount} disponíveis`}
                  </span>
                </span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {formatPrice(sector.priceCents)}
                </span>
              </button>

              {active && !locked ? (
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    Quantidade neste setor
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="flex size-9 items-center justify-center rounded-md border border-border disabled:opacity-40"
                      aria-label={`Diminuir ${sector.name}`}
                    >
                      <MinusIcon size={14} weight="bold" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuantity(Math.min(max, quantity + 1))}
                      disabled={quantity >= max}
                      className="flex size-9 items-center justify-center rounded-md border border-border disabled:opacity-40"
                      aria-label={`Aumentar ${sector.name}`}
                    >
                      <PlusIcon size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border pt-6">
        <div>
          <p className="text-xs text-muted-foreground">
            {locked
              ? lockedHold?.labels || "Reserva pendente"
              : selected
                ? `${selected.name} x ${quantity}`
                : "Escolha um setor"}
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
            disabled={!selected || quantity < 1 || submitting}
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
