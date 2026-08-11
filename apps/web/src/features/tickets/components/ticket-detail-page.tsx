"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { formatDate } from "@/features/events/format";
import { getTicket, shareTicket } from "@/features/tickets/api/tickets-api";
import { TicketQr } from "@/features/tickets/components/ticket-qr";
import {
  ticketPlace,
  ticketStatusLabel,
} from "@/features/tickets/ticket-place";
import type { Ticket } from "@/features/tickets/types";
import { HttpError } from "@/shared/api/http-error";

export function TicketDetailPage({ ticketId }: { ticketId: string }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const detailPath = `/tickets/${ticketId}`;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shareState, setShareState] = useState<"idle" | "copying" | "copied">(
    "idle",
  );
  const [shareError, setShareError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(detailPath)}`);
      return;
    }
    if (user.role !== "CLIENT") {
      router.replace("/");
    }
  }, [authLoading, user, router, detailPath]);

  useEffect(() => {
    if (authLoading || user?.role !== "CLIENT") return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    void getTicket(ticketId)
      .then((data) => {
        if (!cancelled) setTicket(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof HttpError && err.status === 404) {
          setError("not-found");
          return;
        }
        setError("network");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.role, ticketId]);

  async function onShare() {
    if (!ticket) return;
    setShareState("copying");
    setShareError(null);
    try {
      const shared = await shareTicket(ticket.id);
      await navigator.clipboard.writeText(shared.url);
      setShareState("copied");
      window.setTimeout(() => setShareState("idle"), 2000);
    } catch (err) {
      setShareState("idle");
      setShareError(
        err instanceof Error ? err.message : "Não foi possível compartilhar.",
      );
    }
  }

  if (authLoading || !user || user.role !== "CLIENT") {
    return (
      <Shell>
        <Pulse />
      </Shell>
    );
  }

  const used = ticket?.status === "USED";
  const voided = ticket?.status === "VOID";

  return (
    <Shell>
      <Link
        href="/tickets"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon size={16} weight="bold" />
        Ingressos
      </Link>

      {isLoading ? <Pulse /> : null}

      {error === "not-found" ? (
        <p className="text-muted-foreground">Ingresso não encontrado.</p>
      ) : null}

      {error === "network" ? (
        <p className="text-muted-foreground">Não foi possível carregar o ingresso.</p>
      ) : null}

      {ticket && !error ? (
        <div className="max-w-xl space-y-12">
          <header className="flex items-start gap-4">
            {ticket.event.imageUrl ? (
              <img
                src={ticket.event.imageUrl}
                alt=""
                className="h-[4.5rem] w-12 shrink-0 rounded-sm object-cover"
              />
            ) : null}
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                {ticket.event.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(ticket.event.startsAt)}
                <span className="mx-2 text-white/25">/</span>
                {ticket.event.venue}
              </p>
            </div>
          </header>

          <div>
            <TicketQr payload={ticket.qrPayload} faded={used || voided} />
            <p className="mt-5 font-mono text-sm tracking-wide text-white/70">
              {ticket.code}
            </p>
            <p className="mt-2 text-sm text-white/50">
              {ticketPlace(ticket)}
              <span className="mx-2 text-white/25">/</span>
              {ticketStatusLabel(ticket.status)}
            </p>
            {used ? (
              <p className="mt-4 text-sm text-white/45">Já foi usado na porta.</p>
            ) : null}
            {voided ? (
              <p className="mt-4 text-sm text-white/45">Este ingresso foi anulado.</p>
            ) : null}
          </div>

          <div>
            <button
              type="button"
              onClick={() => void onShare()}
              disabled={shareState === "copying"}
              className="text-sm text-white/70 underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:opacity-40"
            >
              {shareState === "copied"
                ? "Link copiado"
                : shareState === "copying"
                  ? "Gerando link..."
                  : "Compartilhar"}
            </button>
            {shareError ? (
              <p className="mt-2 text-sm text-destructive">{shareError}</p>
            ) : null}
          </div>
        </div>
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
  return <div className="h-48 animate-pulse rounded-lg bg-white/[0.04]" />;
}
