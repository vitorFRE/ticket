import { useAuth } from "@/features/auth/components/auth-provider";
import { useMyReservations } from "@/features/reservations/use-reservations-query";

export function usePendingHold(eventId: string) {
  const { user, isLoading: authLoading } = useAuth();
  const enabled = !authLoading && user?.role === "CLIENT";
  const query = useMyReservations(enabled);

  if (!enabled || !query.data) return null;

  const now = Date.now();
  return (
    query.data.items.find((item) => {
      if (item.eventId !== eventId || item.status !== "PENDING") return false;
      if (!item.expiresAt) return true;
      return new Date(item.expiresAt).getTime() > now;
    }) ?? null
  );
}
