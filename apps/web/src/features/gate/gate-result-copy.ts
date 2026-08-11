import type { GateTicketSummary, GateValidateResult } from "@/features/gate/types";

export function gatePlace(ticket: GateTicketSummary | null): string | null {
  if (!ticket) return null;
  if (ticket.seat?.label) return ticket.seat.label;
  if (ticket.sector?.name) return ticket.sector.name;
  return null;
}

export type GateResultTone = "ok" | "used" | "wrong" | "invalid";

export function gateResultTone(result: GateValidateResult): GateResultTone {
  if (result === "VALID") return "ok";
  if (result === "ALREADY_USED") return "used";
  if (result === "WRONG_EVENT") return "wrong";
  return "invalid";
}

export function gateResultCopy(result: GateValidateResult): {
  title: string;
  body: string;
} {
  if (result === "VALID") {
    return { title: "Pode entrar", body: "Liberar a passagem." };
  }
  if (result === "ALREADY_USED") {
    return { title: "Já usado", body: "Este ingresso já passou nesta porta." };
  }
  if (result === "WRONG_EVENT") {
    return { title: "Evento errado", body: "Este ingresso é de outra entrada." };
  }
  return { title: "Ingresso inválido", body: "O código não confere." };
}
