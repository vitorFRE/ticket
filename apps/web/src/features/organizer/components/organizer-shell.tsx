import type { ReactNode } from "react";

export function OrganizerShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10 flex-1">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 md:px-6 lg:px-8 lg:pt-10">
        {children}
      </div>
    </div>
  );
}

export function OrganizerPulse() {
  return <div className="h-48 animate-pulse rounded-lg bg-white/[0.04]" />;
}
