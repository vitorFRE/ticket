"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { formatDate } from "@/features/events/format";
import { listMyTickets } from "@/features/tickets/api/tickets-api";
import {
  ticketPlace,
  ticketStatusLabel,
} from "@/features/tickets/ticket-place";
import type { Ticket } from "@/features/tickets/types";
import { HttpError } from "@/shared/api/http-error";

export function TicketsListPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<"network" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent("/tickets")}`);
      return;
    }
    if (user.role !== "CLIENT") {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (authLoading || user?.role !== "CLIENT") return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    void listMyTickets()
      .then((data) => {
        if (!cancelled) setTickets(data.items);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError("network");
        if (err instanceof HttpError && err.status === 401) {
          router.replace(`/login?next=${encodeURIComponent("/tickets")}`);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.role, router]);

  if (authLoading || !user || user.role !== "CLIENT") {
    return (
      <Shell>
        <Pulse />
      </Shell>
    );
  }

  return (
    <Shell>
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon size={16} weight="bold" />
        Eventos
      </Link>

      <h1 className="text-3xl font-semibold tracking-[-0.03em]">Ingressos</h1>

      {isLoading ? <Pulse /> : null}

      {error ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Não foi possível carregar seus ingressos.
        </p>
      ) : null}

      {!isLoading && !error && tickets.length === 0 ? (
        <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
          Nenhum ingresso ainda.{" "}
          <Link href="/" className="text-foreground underline-offset-4 hover:underline">
            Ver eventos
          </Link>
        </p>
      ) : null}

      {!isLoading && tickets.length > 0 ? (
        <ul className="mt-10 max-w-xl divide-y divide-white/10">
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
                    className="h-[4.5rem] w-12 shrink-0 rounded-sm object-cover"
                  />
                ) : (
                  <div className="h-[4.5rem] w-12 shrink-0 rounded-sm bg-white/[0.06]" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium tracking-tight">{ticket.event.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(ticket.event.startsAt)}
                    <span className="mx-2 text-white/25">/</span>
                    {ticket.event.venue}
                  </p>
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
      ) : null}
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex-1">
      <div className="mx-auto max-w-6xl px-4 pt-28 pb-20 md:px-6 lg:px-8 lg:pt-32">
        {children}
      </div>
    </div>
  );
}

function Pulse() {
  return <div className="mt-10 h-48 animate-pulse rounded-lg bg-white/[0.04]" />;
}
