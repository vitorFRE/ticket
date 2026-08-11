import type { PublicTicket, Ticket } from "@/features/tickets/types";

export function ticketPlace(ticket: Ticket | PublicTicket) {
  if (ticket.seat?.label) return ticket.seat.label;
  if (ticket.sector?.name) return ticket.sector.name;
  return "Ingresso";
}

export function ticketStatusLabel(status: Ticket["status"]) {
  if (status === "USED") return "Usado";
  if (status === "VOID") return "Anulado";
  return "Válido";
}
