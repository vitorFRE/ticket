"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/features/auth/components/auth-provider";
import type { AuthUser } from "@/features/auth/types";

export function useRequireRole(role: AuthUser["role"], path?: string) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const next = path ?? pathname;

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    if (user.role !== role) {
      router.replace("/");
    }
  }, [isLoading, user, router, role, next]);

  return {
    ready: !isLoading && user?.role === role,
    user,
  };
}
