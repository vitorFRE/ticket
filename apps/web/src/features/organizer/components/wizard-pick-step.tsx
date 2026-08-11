"use client";

import type { CatalogItem } from "@/features/organizer/types";

export function WizardPickStep({
  item,
  onBack,
  onNext,
}: {
  item: CatalogItem;
  onBack: () => void;
  onNext: () => void;
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
          <h2 className="text-2xl font-semibold tracking-[-0.03em]">{item.title}</h2>
          {item.venue ? (
            <p className="mt-1 text-sm text-muted-foreground">{item.venue}</p>
          ) : (
            <p className="mt-1 text-sm text-white/40">
              Sem local no catálogo. Você informa no próximo passo.
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Continuar
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-white/50 underline-offset-4 hover:text-foreground hover:underline"
        >
          Trocar título
        </button>
      </div>
    </div>
  );
}
