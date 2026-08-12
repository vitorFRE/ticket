import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { GateLimitNote } from "@/features/events/components/gate-limit-note";
import { formatDate } from "@/features/events/format";
import {
  ticketPlace,
  ticketStatusLabel,
} from "@/features/tickets/ticket-place";
import type { PublicTicket } from "@/features/tickets/types";

export function PublicTicketView({ ticket }: { ticket: PublicTicket }) {
  const used = ticket.status === "USED";
  const voided = ticket.status === "VOID";

  return (
    <div className="relative z-10 flex-1">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 md:px-6 lg:px-8 lg:pt-10">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon size={16} weight="bold" />
          Eventos
        </Link>

        <div className="max-w-xl space-y-10">
          <header className="flex items-start gap-4">
            {ticket.event.imageUrl ? (
              <img
                src={ticket.event.imageUrl}
                alt=""
                className="h-18 w-12 shrink-0 rounded-sm object-cover"
              />
            ) : null}
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                {ticket.event.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(ticket.event.startsAt)}
                <span className="mx-2 text-foreground/25">/</span>
                {ticket.event.venue}
              </p>
              <GateLimitNote
                hoursBefore={ticket.event.gateOpensHoursBefore}
                className="mt-2"
              />
            </div>
          </header>

          <div>
            <p className="text-3xl font-semibold tracking-[-0.03em]">
              {ticketPlace(ticket)}
            </p>
            <p className="mt-2 text-sm text-foreground/50">
              {ticketStatusLabel(ticket.status)}
            </p>
            <p className="mt-4 font-mono text-sm tracking-wide text-muted-foreground">
              {ticket.code}
            </p>
            {used ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Já foi usado na porta.
              </p>
            ) : null}
            {voided ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Este ingresso foi anulado.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
