"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { PageState } from "@/components/page-state";
import { TicketRowSkeletonList } from "@/components/skeletons/ticket-row-skeleton";
import { useRequireRole } from "@/features/auth/use-require-role";
import { useMyReservations } from "@/features/reservations/use-reservations-query";
import type { ReservationDetail } from "@/features/reservations/types";
import { PaymentHistoryList } from "@/features/tickets/components/payment-history-list";
import { TicketRowList } from "@/features/tickets/components/ticket-row-list";
import { TicketsTabNav } from "@/features/tickets/components/tickets-tab-nav";
import {
  parseTicketsTab,
  type TicketsTab,
} from "@/features/tickets/tickets-tab";
import type { Ticket } from "@/features/tickets/types";
import { useMyTickets } from "@/features/tickets/use-tickets-query";

export function TicketsListPage() {
  const { ready } = useRequireRole("CLIENT");
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = parseTicketsTab(searchParams.get("tab"));

  const ticketsQuery = useMyTickets(ready);
  const reservationsQuery = useMyReservations(ready);
  const tickets = ticketsQuery.data?.items ?? [];
  const reservations = reservationsQuery.data?.items ?? [];
  const isPending =
    ticketsQuery.isPending || reservationsQuery.isPending;
  const isError = ticketsQuery.isError || reservationsQuery.isError;

  function setTab(next: TicketsTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "validos") params.delete("tab");
    else params.set("tab", next);
    const qs = params.toString();
    router.replace(qs ? `/tickets?${qs}` : "/tickets", { scroll: false });
  }

  const valid = tickets
    .filter((ticket) => ticket.status === "VALID")
    .sort(
      (a, b) => +new Date(a.event.startsAt) - +new Date(b.event.startsAt),
    );
  const used = tickets.filter(
    (ticket) => ticket.status === "USED" || ticket.status === "VOID",
  );

  if (!ready || isPending) {
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
        <div className="mt-8">
          <TicketRowSkeletonList />
        </div>
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

      <div className="mt-8">
        <TicketsTabNav
          value={tab}
          counts={{
            validos: valid.length,
            usados: used.length,
            pagamentos: reservations.length,
          }}
          onChange={setTab}
        />
      </div>

      {isError ? (
        <PageState
          title="Não foi possível carregar"
          body="Não foi possível carregar seus ingressos."
        />
      ) : (
        <div className="mt-8">
          <TabBody
            tab={tab}
            valid={valid}
            used={used}
            reservations={reservations}
          />
        </div>
      )}
    </Shell>
  );
}

function TabBody({
  tab,
  valid,
  used,
  reservations,
}: {
  tab: TicketsTab;
  valid: Ticket[];
  used: Ticket[];
  reservations: ReservationDetail[];
}) {
  if (tab === "pagamentos") {
    if (reservations.length === 0) {
      return (
        <PageState
          title="Nenhum pagamento"
          body="Reservas pagas, recusadas ou expiradas aparecem aqui."
        >
          <BrowseEvents />
        </PageState>
      );
    }
    return <PaymentHistoryList reservations={reservations} />;
  }

  if (tab === "usados") {
    if (used.length === 0) {
      return (
        <PageState
          title="Nenhum usado ainda"
          body="Quando a portaria validar o QR, o ingresso vem para cá."
        />
      );
    }
    return <TicketRowList tickets={used} />;
  }

  if (valid.length === 0) {
    return (
      <PageState
        title="Nenhum ingresso válido"
        body={
          used.length > 0
            ? "Os que já passaram na porta estão em Usados."
            : "Reserve um evento para ver o QR aqui."
        }
      >
        <BrowseEvents />
      </PageState>
    );
  }

  return <TicketRowList tickets={valid} />;
}

function BrowseEvents() {
  return (
    <Link
      href="/"
      className="mt-5 inline-block text-sm text-foreground underline-offset-4 hover:underline"
    >
      Ver eventos
    </Link>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex-1">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 md:px-6 lg:px-8 lg:pt-10">
        {children}
      </div>
    </div>
  );
}
