"use client";

import type { ReactNode } from "react";
import { PagePulse } from "@/components/skeletons/page-pulse";
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
          <PagePulse />
        </div>
      </div>
    );
  }

  return children;
}
