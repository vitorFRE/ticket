export type TicketStatus = "VALID" | "USED" | "VOID";

export type TicketEvent = {
  id: string;
  title: string;
  venue: string;
  startsAt: string;
  priceCents: number;
  imageUrl: string | null;
};

export type TicketSeat = {
  id: string;
  label: string;
  row: string;
  number: number;
};

export type TicketSector = {
  id: string;
  name: string;
};

export type Ticket = {
  id: string;
  code: string;
  qrPayload: string;
  status: TicketStatus;
  event: TicketEvent;
  seat: TicketSeat | null;
  sector: TicketSector | null;
  share: { publicToken: string; createdAt: string } | null;
};

export type TicketsListResponse = {
  items: Ticket[];
};

export type TicketShareResponse = {
  token: string;
  url: string;
};

export type PublicTicket = {
  code: string;
  status: TicketStatus;
  event: TicketEvent;
  seat: TicketSeat | null;
  sector: TicketSector | null;
};
