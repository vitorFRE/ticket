import type {
  GateTicketSummary,
  GateValidateResult,
} from "@/features/gate/types";

export function gatePlace(ticket: GateTicketSummary | null): string | null {
  if (!ticket) return null;
  if (ticket.seat?.label) return ticket.seat.label;
  if (ticket.sector?.name) return ticket.sector.name;
  return null;
}

export type GateResultTone = "ok" | "used" | "wrong" | "invalid" | "closed";

export function gateResultTone(result: GateValidateResult): GateResultTone {
  if (result === "VALID") return "ok";
  if (result === "ALREADY_USED") return "used";
  if (result === "WRONG_EVENT") return "wrong";
  if (result === "GATE_CLOSED") return "closed";
  return "invalid";
}

export function gateResultCopy(
  result: GateValidateResult,
  hoursBefore?: number,
): {
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
    return {
      title: "Evento errado",
      body: "Este ingresso é de outra entrada.",
    };
  }
  if (result === "GATE_CLOSED") {
    const hours = hoursBefore ?? 0;
    return {
      title: "Ainda não abriu",
      body:
        hours === 1
          ? "A portaria libera 1 hora antes do início."
          : `A portaria libera ${hours} horas antes do início.`,
    };
  }
  return { title: "Ingresso inválido", body: "O código não confere." };
}
