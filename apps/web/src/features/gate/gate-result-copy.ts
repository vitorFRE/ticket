import type { GateTicketSummary, GateValidateResult } from "@/features/gate/types";

export function gatePlace(ticket: GateTicketSummary | null): string | null {
  if (!ticket) return null;
  if (ticket.seat?.label) return ticket.seat.label;
  if (ticket.sector?.name) return ticket.sector.name;
  return null;
}

export function gateResultCopy(
  result: GateValidateResult,
  _ticket: GateTicketSummary | null,
): { title: string; body: string } {
  if (result === "VALID") {
    return {
      title: "Pode entrar",
      body: "Ingresso válido.",
    };
  }
  if (result === "ALREADY_USED") {
    return {
      title: "Já usado",
      body: "Este ingresso já passou nesta porta.",
    };
  }
  if (result === "WRONG_EVENT") {
    return {
      title: "Evento errado",
      body: "Este ingresso é de outro evento.",
    };
  }
  return {
    title: "Ingresso inválido",
    body: "O código não confere.",
  };
}
