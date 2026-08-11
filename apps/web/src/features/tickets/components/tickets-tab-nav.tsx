"use client";

import type { TicketsTab } from "@/features/tickets/tickets-tab";
import { cn } from "@/lib/utils";

type TabOption = {
  id: TicketsTab;
  label: string;
  count: number;
};

export function TicketsTabNav({
  value,
  counts,
  onChange,
}: {
  value: TicketsTab;
  counts: Record<TicketsTab, number>;
  onChange: (next: TicketsTab) => void;
}) {
  const options: TabOption[] = [
    { id: "validos", label: "Válidos", count: counts.validos },
    { id: "usados", label: "Usados", count: counts.usados },
    { id: "pagamentos", label: "Pagamentos", count: counts.pagamentos },
  ];

  return (
    <nav aria-label="Seções dos ingressos" className="flex flex-wrap items-baseline gap-5">
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            aria-pressed={active}
            className={cn(
              "text-sm tracking-tight transition-colors",
              active
                ? "font-medium text-foreground underline decoration-primary/70 underline-offset-[6px]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
            <span className="ml-1.5 text-xs text-white/35">{option.count}</span>
          </button>
        );
      })}
    </nav>
  );
}
