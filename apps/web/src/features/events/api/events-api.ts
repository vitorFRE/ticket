import { getApiBaseUrl } from "@/shared/config/api-base";
import { parseApiJson } from "@/shared/api/parse-api-json";
import type {
  EventDetail,
  EventSeatsResponse,
  EventSectorsResponse,
  EventsListResponse,
} from "@/features/events/types";

export async function listEvents(params?: {
  q?: string;
  source?: "tmdb" | "ticketmaster";
}): Promise<EventsListResponse> {
  const url = new URL(`${getApiBaseUrl()}/events`);
  if (params?.q?.trim()) {
    url.searchParams.set("q", params.q.trim());
  }
  if (params?.source) {
    url.searchParams.set("source", params.source);
  }
  const res = await fetch(url.toString(), {
    cache: "no-store",
  });
  return parseApiJson<EventsListResponse>(res);
}

export async function getEventById(id: string): Promise<EventDetail> {
  const res = await fetch(`${getApiBaseUrl()}/events/${id}`, {
    cache: "no-store",
  });
  return parseApiJson<EventDetail>(res);
}

export async function getEventSeats(id: string): Promise<EventSeatsResponse> {
  const res = await fetch(`${getApiBaseUrl()}/events/${id}/seats`, {
    cache: "no-store",
  });
  return parseApiJson<EventSeatsResponse>(res);
}

export async function getEventSectors(
  id: string,
): Promise<EventSectorsResponse> {
  const res = await fetch(`${getApiBaseUrl()}/events/${id}/sectors`, {
    cache: "no-store",
  });
  return parseApiJson<EventSectorsResponse>(res);
}
