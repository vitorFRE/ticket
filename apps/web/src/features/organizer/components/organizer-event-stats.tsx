"use client";

import { formatPrice } from "@/features/events/format";
import type { EventStats } from "@/features/organizer/types";

export function OrganizerEventStats({ stats }: { stats: EventStats }) {
  return (
    <section className="space-y-6">
      <h2 className="text-sm font-medium tracking-tight text-foreground/50">
        Métricas
      </h2>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
        <Stat label="Vendidos" value={String(stats.ticketsSold)} />
        <Stat
          label="Ocupação"
          value={`${Math.round(stats.occupancyPct * 100)}%`}
        />
        <Stat label="Receita" value={formatPrice(stats.revenueCents)} />
        <Stat label="Check-ins" value={String(stats.ticketsUsed)} />
      </dl>
      {stats.pendingHolds > 0 ? (
        <p className="text-xs text-muted-foreground">
          {stats.pendingHolds === 1
            ? "1 hold pendente"
            : `${stats.pendingHolds} holds pendentes`}
        </p>
      ) : null}
      {stats.seats ? (
        <p className="text-xs text-muted-foreground">
          Assentos: {stats.seats.available} livres
          <span className="mx-1.5 text-foreground/20">/</span>
          {stats.seats.held} em hold
          <span className="mx-1.5 text-foreground/20">/</span>
          {stats.seats.sold} vendidos
        </p>
      ) : null}
      {stats.sectors && stats.sectors.length > 0 ? (
        <ul className="space-y-2 border-t border-border pt-4">
          {stats.sectors.map((sector) => (
            <li
              key={sector.id}
              className="flex flex-wrap items-baseline justify-between gap-2 text-sm"
            >
              <span>{sector.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {sector.sold}/{sector.capacity}
                <span className="mx-1.5 text-foreground/20">/</span>
                {formatPrice(sector.revenueCents)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] tabular-nums">
        {value}
      </dd>
    </div>
  );
}
