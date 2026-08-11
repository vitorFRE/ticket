import Link from "next/link";
import { GateLimitNote } from "@/features/events/components/gate-limit-note";
import { formatDate } from "@/features/events/format";
import {
  ticketPlace,
  ticketStatusLabel,
} from "@/features/tickets/ticket-place";
import type { Ticket } from "@/features/tickets/types";

export function TicketRowList({ tickets }: { tickets: Ticket[] }) {
  return (
    <ul className="max-w-xl divide-y divide-white/10">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <Link
            href={`/tickets/${ticket.id}`}
            className="flex items-start gap-4 py-5 transition-colors hover:text-primary"
          >
            {ticket.event.imageUrl ? (
              <img
                src={ticket.event.imageUrl}
                alt=""
                className="h-18 w-12 shrink-0 rounded-sm object-cover"
              />
            ) : (
              <div className="h-18 w-12 shrink-0 rounded-sm bg-white/6" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium tracking-tight">{ticket.event.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(ticket.event.startsAt)}
                <span className="mx-2 text-white/25">/</span>
                {ticket.event.venue}
              </p>
              <GateLimitNote
                hoursBefore={ticket.event.gateOpensHoursBefore}
                className="mt-1 text-xs"
              />
              <p className="mt-2 text-sm text-white/55">
                {ticketPlace(ticket)}
                <span className="mx-2 text-white/25">/</span>
                {ticketStatusLabel(ticket.status)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
