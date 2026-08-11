export type GateValidateResult =
  | "VALID"
  | "INVALID"
  | "ALREADY_USED"
  | "WRONG_EVENT";

export type GateTicketSummary = {
  id: string;
  code: string;
  status: "VALID" | "USED" | "VOID";
  eventId: string;
  seat: { label: string } | null;
  sector: { name: string } | null;
  user: { name: string | null } | null;
  event: { id: string; title: string } | null;
  validatedAt: string | null;
};

export type GateValidateResponse = {
  result: GateValidateResult;
  ticket: GateTicketSummary | null;
};
