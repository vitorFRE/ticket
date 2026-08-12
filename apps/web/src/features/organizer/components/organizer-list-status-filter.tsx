"use client";

import type { OrganizerListFilter } from "@/features/organizer/types";
import { cn } from "@/lib/utils";

const OPTIONS: { id: OrganizerListFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "draft", label: "Rascunho" },
  { id: "published", label: "Publicado" },
  { id: "upcoming", label: "Próximos" },
];

export function OrganizerListStatusFilter({
  value,
  onChange,
}: {
  value: OrganizerListFilter;
  onChange: (next: OrganizerListFilter) => void;
}) {
  return (
    <nav
      aria-label="Filtrar eventos"
      className="mt-8 flex flex-wrap items-baseline gap-5"
    >
      {OPTIONS.map((option) => {
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
          </button>
        );
      })}
    </nav>
  );
}
