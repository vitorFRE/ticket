import { useQuery } from "@tanstack/react-query";
import { getTicket, listMyTickets } from "@/features/tickets/api/tickets-api";
import { queryKeys } from "@/shared/query/keys";

export function useMyTickets(enabled = true) {
  return useQuery({
    queryKey: queryKeys.tickets.mine,
    queryFn: listMyTickets,
    enabled,
    staleTime: 10_000,
  });
}

export function useTicketDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: () => getTicket(id),
    enabled: enabled && Boolean(id),
    staleTime: 10_000,
  });
}
