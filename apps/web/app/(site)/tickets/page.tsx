import { Suspense } from "react";
import { TicketsListPage } from "@/features/tickets/components/tickets-list-page";

export default function TicketsRoute() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 pt-8 text-sm text-muted-foreground md:px-6 lg:px-8 lg:pt-10">
          Carregando ingressos...
        </div>
      }
    >
      <TicketsListPage />
    </Suspense>
  );
}
