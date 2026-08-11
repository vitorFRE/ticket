export const TICKETS_TABS = ["validos", "usados", "pagamentos"] as const;

export type TicketsTab = (typeof TICKETS_TABS)[number];

export function parseTicketsTab(value: string | null): TicketsTab {
  if (value === "usados" || value === "pagamentos") return value;
  return "validos";
}
