"use client";

import { parseGateHours } from "@/features/events/gate-window";
import { GateHoursField } from "@/features/organizer/components/gate-hours-field";

export function WizardDetailsStep({
  venue,
  startsAt,
  gateUnlimited,
  gateOpensHoursBefore,
  price,
  onVenue,
  onStartsAt,
  onGateUnlimited,
  onGateOpensHoursBefore,
  onPrice,
  onBack,
  onNext,
}: {
  venue: string;
  startsAt: string;
  gateUnlimited: boolean;
  gateOpensHoursBefore: string;
  price: string;
  onVenue: (value: string) => void;
  onStartsAt: (value: string) => void;
  onGateUnlimited: (value: boolean) => void;
  onGateOpensHoursBefore: (value: string) => void;
  onPrice: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const hoursOk =
    gateUnlimited || parseGateHours(gateOpensHoursBefore) !== null;
  const canNext =
    venue.trim().length > 0 &&
    startsAt.length > 0 &&
    price.trim().length > 0 &&
    hoursOk;

  return (
    <div className="max-w-xl space-y-6">
      <label className="block">
        <span className="text-[13px] text-muted-foreground">Local</span>
        <input
          value={venue}
          onChange={(e) => onVenue(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="text-[13px] text-muted-foreground">Data e hora</span>
        <input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => onStartsAt(e.target.value)}
          className={fieldClass}
        />
      </label>
      <GateHoursField
        unlimited={gateUnlimited}
        hours={gateOpensHoursBefore}
        onUnlimited={onGateUnlimited}
        onHours={onGateOpensHoursBefore}
      />
      <label className="block">
        <span className="text-[13px] text-muted-foreground">Preço base (R$)</span>
        <input
          value={price}
          onChange={(e) => onPrice(e.target.value)}
          className={fieldClass}
        />
      </label>
      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-40"
        >
          Continuar
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-foreground/50 underline-offset-4 hover:text-foreground hover:underline"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

const fieldClass =
  "mt-1.5 w-full border-0 border-b border-border bg-transparent px-0 py-2 text-sm outline-none";
