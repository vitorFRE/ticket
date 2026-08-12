import { formatDate } from "@/features/events/format";
import type { GateTicketSummary } from "@/features/gate/types";

export function GateTicketRecord({
  ticket,
  showEvent,
  highlightValidatedAt,
}: {
  ticket: GateTicketSummary;
  showEvent: boolean;
  highlightValidatedAt: boolean;
}) {
  const holder = ticket.user?.name?.trim() || null;
  const rows: Array<{ label: string; value: string; mono?: boolean; strong?: boolean }> =
    [];

  if (holder) rows.push({ label: "Titular", value: holder });
  if (highlightValidatedAt && ticket.validatedAt) {
    rows.push({
      label: "Passou em",
      value: formatDate(ticket.validatedAt),
      strong: true,
    });
  } else if (ticket.validatedAt) {
    rows.push({ label: "Passou em", value: formatDate(ticket.validatedAt) });
  }
  if (showEvent && ticket.event?.title) {
    rows.push({ label: "Evento", value: ticket.event.title });
  }
  rows.push({ label: "Código", value: ticket.code, mono: true });

  return (
    <dl className="mt-8 max-w-md space-y-3 border-t border-border pt-6 text-sm">
      {rows.map((row) => (
        <div key={row.label} className="flex flex-wrap gap-x-4 gap-y-0.5">
          <dt className="w-20 shrink-0 text-muted-foreground">{row.label}</dt>
          <dd
            className={
              row.mono
                ? "font-mono text-xs break-all text-muted-foreground"
                : row.strong
                  ? "font-medium text-foreground"
                  : undefined
            }
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
