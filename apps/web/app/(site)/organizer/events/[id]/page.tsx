import { OrganizerEventDetailPage } from "@/features/organizer/components/organizer-event-detail-page";

export default async function OrganizerEventDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrganizerEventDetailPage eventId={id} />;
}
