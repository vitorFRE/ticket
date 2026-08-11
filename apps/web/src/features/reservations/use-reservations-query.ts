import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createReservation,
  getReservation,
  listMyReservations,
  payReservation,
} from "@/features/reservations/api/reservations-api";
import type {
  CreateReservationBody,
  PayOutcome,
} from "@/features/reservations/types";
import { queryKeys } from "@/shared/query/keys";

export function useMyReservations(enabled = true) {
  return useQuery({
    queryKey: queryKeys.reservations.mine,
    queryFn: listMyReservations,
    enabled,
    staleTime: 10_000,
  });
}

export function useReservationDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.reservations.detail(id),
    queryFn: () => getReservation(id),
    enabled: enabled && Boolean(id),
    staleTime: 10_000,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateReservationBody) => createReservation(body),
    onSuccess: (_data, body) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.events.seats(body.eventId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.events.sectors(body.eventId),
      });
    },
  });
}

export function usePayReservation(reservationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (outcome: PayOutcome) =>
      payReservation(reservationId, outcome),
    onSuccess: (paid) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.reservations.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.all });
      queryClient.setQueryData(queryKeys.reservations.detail(reservationId), paid);
    },
  });
}
