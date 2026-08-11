import { EventDetailPage } from "@/features/events/components/event-detail-page";

export default async function EventDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventDetailPage eventId={id} />;
}
