"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/components/auth-provider";

export function useOrganizerGuard(path: string) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(path)}`);
      return;
    }
    if (user.role !== "ORGANIZER") {
      router.replace("/");
    }
  }, [isLoading, user, router, path]);

  return {
    ready: !isLoading && user?.role === "ORGANIZER",
    user,
  };
}
