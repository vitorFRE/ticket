"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { listMyReservations } from "@/features/reservations/api/reservations-api";
import type { ReservationDetail } from "@/features/reservations/types";

export function usePendingHold(eventId: string) {
  const { user, isLoading: authLoading } = useAuth();
  const [pending, setPending] = useState<ReservationDetail | null>(null);

  useEffect(() => {
    if (authLoading || user?.role !== "CLIENT") {
      setPending(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const { items } = await listMyReservations();
        if (cancelled) return;
        const now = Date.now();
        const match = items.find((item) => {
          if (item.eventId !== eventId || item.status !== "PENDING") return false;
          if (!item.expiresAt) return true;
          return new Date(item.expiresAt).getTime() > now;
        });
        setPending(match ?? null);
      } catch {
        if (!cancelled) setPending(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.role, eventId]);

  return pending;
}
