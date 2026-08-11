import { TicketDetailPage } from "@/features/tickets/components/ticket-detail-page";

export default async function TicketDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TicketDetailPage ticketId={id} />;
}
