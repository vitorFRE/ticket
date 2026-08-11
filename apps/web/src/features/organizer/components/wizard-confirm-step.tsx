"use client";

import { modeLabel } from "@/features/events/format";
import { gateHoursLabel } from "@/features/events/gate-window";
import type { CatalogItem } from "@/features/organizer/types";
import type { SectorDraft } from "@/features/organizer/wizard-state";

export function WizardConfirmStep({
  item,
  venue,
  startsAt,
  gateOpensHoursBefore,
  priceLabel,
  mode,
  rows,
  seatsPerRow,
  sectors,
  submitting,
  error,
  onBack,
  onCreate,
}: {
  item: CatalogItem;
  venue: string;
  startsAt: string;
  gateOpensHoursBefore: number | null;
  priceLabel: string;
  mode: "SEAT_MAP" | "GA_SECTOR";
  rows: string;
  seatsPerRow: string;
  sectors: SectorDraft[];
  submitting: boolean;
  error: string | null;
  onBack: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="max-w-xl space-y-8">
      <div className="flex items-start gap-4">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt=""
            className="h-[4.5rem] w-12 shrink-0 rounded-sm object-cover"
          />
        ) : null}
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">
            {item.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {startsAt.replace("T", " ")}
            <span className="mx-2 text-white/25">/</span>
            {venue}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-white/55">
        <p>{priceLabel}</p>
        <p>
          Portaria: {gateHoursLabel(gateOpensHoursBefore)}
          {gateOpensHoursBefore === null || gateOpensHoursBefore === 0
            ? ""
            : " do início"}
        </p>
        <p>{modeLabel(mode)}</p>
        {mode === "SEAT_MAP" ? (
          <p>
            {rows} · {seatsPerRow} por fileira
          </p>
        ) : (
          <ul className="space-y-1">
            {sectors
              .filter((s) => s.name.trim())
              .map((sector) => (
                <li key={sector.name}>
                  {sector.name} · {sector.capacity}
                  {sector.price ? ` · ${sector.price}` : ""}
                </li>
              ))}
          </ul>
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={submitting}
          onClick={onCreate}
          className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-40"
        >
          {submitting ? "Criando..." : "Criar rascunho"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-white/50 underline-offset-4 hover:text-foreground hover:underline"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
