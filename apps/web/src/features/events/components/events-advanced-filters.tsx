"use client";

import { CaretDownIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState } from "react";
import {
  centsToReaisFilterInput,
  dateInputValue,
  reaisFilterToCents,
  type AdvancedEventFilters,
} from "@/features/events/advanced-filters";
import { cn } from "@/lib/utils";

const VENUE_DEBOUNCE_MS = 350;

type EventsAdvancedFiltersProps = {
  value: AdvancedEventFilters;
  onChange: (next: AdvancedEventFilters) => void;
};

export function EventsAdvancedFilters({
  value,
  onChange,
}: EventsAdvancedFiltersProps) {
  const panelId = useId();
  const valueRef = useRef(value);
  valueRef.current = value;
  const activeCount = countActive(value);
  const [open, setOpen] = useState(activeCount > 0);
  const [venueDraft, setVenueDraft] = useState(value.venue ?? "");
  const [priceMinDraft, setPriceMinDraft] = useState(
    centsToReaisFilterInput(value.priceMin),
  );
  const [priceMaxDraft, setPriceMaxDraft] = useState(
    centsToReaisFilterInput(value.priceMax),
  );

  useEffect(() => {
    setVenueDraft(value.venue ?? "");
    setPriceMinDraft(centsToReaisFilterInput(value.priceMin));
    setPriceMaxDraft(centsToReaisFilterInput(value.priceMax));
  }, [value.venue, value.priceMin, value.priceMax]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const nextVenue = venueDraft.trim() || undefined;
      if ((valueRef.current.venue ?? undefined) === nextVenue) return;
      onChange({ ...valueRef.current, venue: nextVenue });
    }, VENUE_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [venueDraft, onChange]);

  function patch(partial: Partial<AdvancedEventFilters>) {
    onChange({ ...valueRef.current, ...partial });
  }

  function applyPrice(field: "priceMin" | "priceMax", draft: string) {
    const cents = reaisFilterToCents(draft);
    if (cents === null) return;
    patch({ [field]: cents });
  }

  function clearAll() {
    setVenueDraft("");
    setPriceMinDraft("");
    setPriceMaxDraft("");
    onChange({});
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Filtros
          {activeCount > 0 ? (
            <span className="tabular-nums text-foreground">({activeCount})</span>
          ) : null}
          <CaretDownIcon
            size={14}
            weight="bold"
            className={cn(
              "transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <XIcon size={12} weight="bold" />
            Limpar
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          id={panelId}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <FilterField label="De">
            <input
              type="date"
              value={dateInputValue(value.from)}
              onChange={(e) =>
                patch({ from: e.target.value || undefined })
              }
              className={inputClass}
            />
          </FilterField>
          <FilterField label="Até">
            <input
              type="date"
              value={dateInputValue(value.to)}
              onChange={(e) => patch({ to: e.target.value || undefined })}
              className={inputClass}
            />
          </FilterField>
          <FilterField label="Preço mín. (R$)">
            <input
              inputMode="decimal"
              value={priceMinDraft}
              onChange={(e) => setPriceMinDraft(e.target.value)}
              onBlur={() => applyPrice("priceMin", priceMinDraft)}
              placeholder="0,00"
              className={inputClass}
            />
          </FilterField>
          <FilterField label="Preço máx. (R$)">
            <input
              inputMode="decimal"
              value={priceMaxDraft}
              onChange={(e) => setPriceMaxDraft(e.target.value)}
              onBlur={() => applyPrice("priceMax", priceMaxDraft)}
              placeholder="200,00"
              className={inputClass}
            />
          </FilterField>
          <FilterField label="Local" className="sm:col-span-2 lg:col-span-4">
            <input
              value={venueDraft}
              onChange={(e) => setVenueDraft(e.target.value)}
              placeholder="Ex.: Arena, Cinemark..."
              className={inputClass}
              autoComplete="off"
              spellCheck={false}
            />
          </FilterField>
        </div>
      ) : null}
    </div>
  );
}

function FilterField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "h-10 w-full border-0 border-b border-border bg-transparent px-0 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring";

function countActive(filters: AdvancedEventFilters) {
  let n = 0;
  if (filters.from) n += 1;
  if (filters.to) n += 1;
  if (filters.venue) n += 1;
  if (filters.priceMin !== undefined) n += 1;
  if (filters.priceMax !== undefined) n += 1;
  return n;
}
