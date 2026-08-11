import { ReservationPayPage } from "@/features/reservations/components/reservation-pay-page";

export default async function ReservationPayRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReservationPayPage reservationId={id} />;
}
