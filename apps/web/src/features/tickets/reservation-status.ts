import type { ReservationDetail } from "@/features/reservations/types";

export function reservationStatusLabel(status: ReservationDetail["status"]) {
  if (status === "PENDING") return "A pagar";
  if (status === "PAID") return "Pago";
  if (status === "FAILED") return "Recusado";
  if (status === "EXPIRED") return "Expirou";
  if (status === "CANCELLED") return "Cancelada";
  return status;
}

export function reservationHref(reservation: ReservationDetail) {
  if (reservation.status === "PENDING") {
    return `/reservations/${reservation.id}/pay`;
  }
  const ticketId = reservation.tickets[0]?.id;
  if (reservation.status === "PAID" && ticketId) {
    return `/tickets/${ticketId}`;
  }
  return null;
}
