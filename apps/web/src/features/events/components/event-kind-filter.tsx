"use client";

import type { CatalogKind } from "@/features/events/catalog-kind";
import { cn } from "@/lib/utils";

const OPTIONS: { id: CatalogKind | null; label: string }[] = [
  { id: null, label: "Todos" },
  { id: "filme", label: "Filmes" },
  { id: "show", label: "Shows" },
];

export function EventKindFilter({
  value,
  onChange,
}: {
  value: CatalogKind | null;
  onChange: (next: CatalogKind | null) => void;
}) {
  return (
    <nav aria-label="Tipo de sessão" className="flex flex-wrap items-baseline gap-5">
      {OPTIONS.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.label}
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
