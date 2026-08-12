"use client";

import { formatDate } from "@/features/events/format";
import type { OrganizerTicketItem } from "@/features/organizer/types";

const STATUS_LABEL: Record<OrganizerTicketItem["status"], string> = {
  VALID: "Válido",
  USED: "Usado",
  VOID: "Anulado",
};

export function OrganizerEventTicketsList({
  items,
  loading,
}: {
  items: OrganizerTicketItem[];
  loading?: boolean;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium tracking-tight text-white/50">
        Ingressos
      </h2>
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : null}
      {!loading && items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Ainda não há ingressos vendidos.
        </p>
      ) : null}
      {!loading && items.length > 0 ? (
        <ul className="divide-y divide-white/8 border-t border-white/8">
          {items.map((ticket) => (
            <li
              key={ticket.id}
              className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium tracking-tight">
                  {ticket.seatLabel ?? ticket.sectorName ?? "Ingresso"}
                </p>
                <p className="mt-0.5 truncate font-mono text-xs text-white/40">
                  {ticket.code}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{STATUS_LABEL[ticket.status]}</p>
                <p className="mt-0.5">
                  {ticket.validatedAt
                    ? `Check-in ${formatDate(ticket.validatedAt)}`
                    : formatDate(ticket.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
