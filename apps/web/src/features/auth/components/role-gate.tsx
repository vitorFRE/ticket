"use client";

import type { ReactNode } from "react";
import type { AuthUser } from "@/features/auth/types";
import { useRequireRole } from "@/features/auth/use-require-role";

export function RoleGate({
  role,
  children,
}: {
  role: AuthUser["role"];
  children: ReactNode;
}) {
  const { ready } = useRequireRole(role);

  if (!ready) {
    return (
      <div className="relative z-10 flex-1">
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 md:px-6 lg:px-8 lg:pt-10">
          <div className="h-48 animate-pulse rounded-lg bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  return children;
}
