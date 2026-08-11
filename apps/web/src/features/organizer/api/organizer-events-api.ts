import { authorizedFetch } from "@/features/auth/lib/authorized-fetch";
import type { EventDetail, EventsListResponse } from "@/features/events/types";
import type {
  CreateEventBody,
  UpdateEventBody,
} from "@/features/organizer/types";
import { parseApiJson } from "@/shared/api/parse-api-json";
import { getApiBaseUrl } from "@/shared/config/api-base";

export async function listMyEvents(): Promise<EventsListResponse> {
  const res = await authorizedFetch(`${getApiBaseUrl()}/events/mine`);
  return parseApiJson<EventsListResponse>(res);
}

export async function getOrganizerEvent(id: string): Promise<EventDetail> {
  const res = await authorizedFetch(`${getApiBaseUrl()}/events/${id}`);
  return parseApiJson<EventDetail>(res);
}

export async function createEvent(body: CreateEventBody): Promise<EventDetail> {
  const res = await authorizedFetch(`${getApiBaseUrl()}/events`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return parseApiJson<EventDetail>(res);
}

export async function updateEvent(
  id: string,
  body: UpdateEventBody,
): Promise<EventDetail> {
  const res = await authorizedFetch(`${getApiBaseUrl()}/events/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return parseApiJson<EventDetail>(res);
}

export async function publishEvent(id: string): Promise<EventDetail> {
  const res = await authorizedFetch(`${getApiBaseUrl()}/events/${id}/publish`, {
    method: "POST",
  });
  return parseApiJson<EventDetail>(res);
}
