import { EventCheckoutPage } from "@/features/reservations/components/event-checkout-page";

export default async function EventCheckoutRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EventCheckoutPage eventId={id} />;
}
