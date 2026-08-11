import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getEventById,
  getEventSeats,
  getEventSectors,
  listEvents,
} from "@/features/events/api/events-api";
import { queryKeys, type EventListParams } from "@/shared/query/keys";

export function useEventsList(params: EventListParams = {}) {
  return useQuery({
    queryKey: queryKeys.events.list(params),
    queryFn: () => listEvents(params),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useEventDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.events.detail(id),
    queryFn: () => getEventById(id),
    enabled: enabled && Boolean(id),
    staleTime: 30_000,
  });
}

export function useEventSeats(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.events.seats(id),
    queryFn: () => getEventSeats(id),
    enabled: enabled && Boolean(id),
    staleTime: 10_000,
  });
}

export function useEventSectors(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.events.sectors(id),
    queryFn: () => getEventSectors(id),
    enabled: enabled && Boolean(id),
    staleTime: 10_000,
  });
}
