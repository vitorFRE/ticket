import { formatDate } from "@/features/events/format";
import { gatePlace } from "@/features/gate/gate-result-copy";
import type { GateTicketSummary } from "@/features/gate/types";

export function GateTicketRecord({ ticket }: { ticket: GateTicketSummary }) {
  const place = gatePlace(ticket);
  const holder = ticket.user?.name?.trim() || null;
  const rows: Array<{ label: string; value: string; mono?: boolean }> = [];

  if (place) rows.push({ label: "Lugar", value: place });
  if (holder) rows.push({ label: "Titular", value: holder });
  rows.push({ label: "Código", value: ticket.code, mono: true });
  if (ticket.event?.title) {
    rows.push({ label: "Evento", value: ticket.event.title });
  }
  if (ticket.validatedAt) {
    rows.push({ label: "Passou em", value: formatDate(ticket.validatedAt) });
  }

  return (
    <dl className="mt-8 max-w-md space-y-3 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-wrap gap-x-4 gap-y-0.5">
          <dt className="w-20 shrink-0 text-muted-foreground">{row.label}</dt>
          <dd className={row.mono ? "font-mono text-xs break-all" : undefined}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
