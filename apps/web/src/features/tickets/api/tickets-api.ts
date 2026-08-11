import { authorizedFetch } from "@/features/auth/lib/authorized-fetch";
import type {
  PublicTicket,
  Ticket,
  TicketShareResponse,
  TicketsListResponse,
} from "@/features/tickets/types";
import { parseApiJson } from "@/shared/api/parse-api-json";
import { getApiBaseUrl } from "@/shared/config/api-base";

export async function listMyTickets(): Promise<TicketsListResponse> {
  const res = await authorizedFetch(`${getApiBaseUrl()}/tickets/mine`);
  return parseApiJson<TicketsListResponse>(res);
}

export async function getTicket(id: string): Promise<Ticket> {
  const res = await authorizedFetch(`${getApiBaseUrl()}/tickets/${id}`);
  return parseApiJson<Ticket>(res);
}

export async function shareTicket(id: string): Promise<TicketShareResponse> {
  const res = await authorizedFetch(`${getApiBaseUrl()}/tickets/${id}/share`, {
    method: "POST",
  });
  return parseApiJson<TicketShareResponse>(res);
}

export async function getPublicTicket(token: string): Promise<PublicTicket> {
  const res = await fetch(`${getApiBaseUrl()}/public/tickets/${token}`, {
    cache: "no-store",
  });
  return parseApiJson<PublicTicket>(res);
}
