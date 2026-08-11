import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createEvent,
  getOrganizerEvent,
  listMyEvents,
  publishEvent,
  updateEvent,
} from "@/features/organizer/api/organizer-events-api";
import type {
  CreateEventBody,
  UpdateEventBody,
} from "@/features/organizer/types";
import { queryKeys } from "@/shared/query/keys";

export function useOrganizerEvents(enabled = true) {
  return useQuery({
    queryKey: queryKeys.events.mine,
    queryFn: listMyEvents,
    enabled,
    staleTime: 10_000,
  });
}

export function useOrganizerEvent(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.events.organizerDetail(id),
    queryFn: () => getOrganizerEvent(id),
    enabled: enabled && Boolean(id),
    staleTime: 10_000,
  });
}

export function usePublishEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishEvent(id),
    onSuccess: (event) => {
      queryClient.setQueryData(queryKeys.events.organizerDetail(event.id), event);
      queryClient.setQueryData(queryKeys.events.detail(event.id), event);
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.mine });
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
    },
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateEventBody) => updateEvent(id, body),
    onSuccess: (event) => {
      queryClient.setQueryData(queryKeys.events.organizerDetail(event.id), event);
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.mine });
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateEventBody) => createEvent(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.mine });
    },
  });
}
