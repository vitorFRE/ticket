"use client";

export function WizardDetailsStep({
  venue,
  startsAt,
  price,
  onVenue,
  onStartsAt,
  onPrice,
  onBack,
  onNext,
}: {
  venue: string;
  startsAt: string;
  price: string;
  onVenue: (value: string) => void;
  onStartsAt: (value: string) => void;
  onPrice: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const canNext = venue.trim().length > 0 && startsAt.length > 0 && price.trim().length > 0;

  return (
    <div className="max-w-xl space-y-6">
      <label className="block">
        <span className="text-[13px] text-white/40">Local</span>
        <input
          value={venue}
          onChange={(e) => onVenue(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="text-[13px] text-white/40">Data e hora</span>
        <input
          type="datetime-local"
          value={startsAt}
          onChange={(e) => onStartsAt(e.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="block">
        <span className="text-[13px] text-white/40">Preço base (R$)</span>
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
          className="text-sm text-white/50 underline-offset-4 hover:text-foreground hover:underline"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

const fieldClass =
  "mt-1.5 w-full border-0 border-b border-white/12 bg-transparent px-0 py-2 text-sm outline-none";
