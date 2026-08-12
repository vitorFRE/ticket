import { Suspense } from "react";
import { TicketsSuspenseFallback } from "@/components/skeletons/tickets-suspense-fallback";
import { TicketsListPage } from "@/features/tickets/components/tickets-list-page";

export default function TicketsRoute() {
  return (
    <Suspense fallback={<TicketsSuspenseFallback />}>
      <TicketsListPage />
    </Suspense>
  );
}
