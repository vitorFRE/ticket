"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createEvent } from "@/features/organizer/api/organizer-events-api";
import { WizardConfirmStep } from "@/features/organizer/components/wizard-confirm-step";
import { WizardDetailsStep } from "@/features/organizer/components/wizard-details-step";
import { WizardInventoryStep } from "@/features/organizer/components/wizard-inventory-step";
import { WizardPickStep } from "@/features/organizer/components/wizard-pick-step";
import { WizardSourceStep } from "@/features/organizer/components/wizard-source-step";
import {
  OrganizerPulse,
  OrganizerShell,
} from "@/features/organizer/components/organizer-shell";
import {
  centsToReaisInput,
  fromDatetimeLocal,
  reaisToCents,
  toDatetimeLocal,
} from "@/features/organizer/money";
import type { CatalogItem, CreateEventBody } from "@/features/organizer/types";
import { useOrganizerGuard } from "@/features/organizer/use-organizer-guard";
import {
  initialWizardState,
  type WizardState,
} from "@/features/organizer/wizard-state";

export function OrganizerNewEventPage() {
  const { ready } = useOrganizerGuard("/organizer/events/new");
  const router = useRouter();
  const [state, setState] = useState<WizardState>(initialWizardState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function patch(next: Partial<WizardState>) {
    setState((current) => ({ ...current, ...next }));
  }

  function pickItem(item: CatalogItem) {
    patch({
      item,
      step: 2,
      venue: item.venue ?? "",
      startsAt: toDatetimeLocal(item.startsAt),
    });
  }

  async function onCreate() {
    if (!state.item) return;
    const priceCents = reaisToCents(state.price);
    const startsAt = fromDatetimeLocal(state.startsAt);
    if (priceCents === null || !startsAt || !state.venue.trim()) {
      setError("Preencha local, data e preço.");
      return;
    }

    const body: CreateEventBody = {
      source: state.source,
      externalId: state.item.externalId,
      venue: state.venue.trim(),
      startsAt,
      priceCents,
      inventoryMode: state.inventoryMode,
      title: state.item.title,
      description: state.item.description ?? undefined,
      imageUrl: state.item.imageUrl ?? undefined,
    };

    if (state.inventoryMode === "SEAT_MAP") {
      const rows = state.rows
        .split(",")
        .map((row) => row.trim())
        .filter(Boolean);
      const seatsPerRow = Number(state.seatsPerRow);
      body.seatMap = {
        rows: rows.length ? rows : undefined,
        seatsPerRow: Number.isFinite(seatsPerRow) ? seatsPerRow : undefined,
      };
    } else {
      const sectors = state.sectors
        .map((sector) => {
          const capacity = Number(sector.capacity);
          const extra = reaisToCents(sector.price);
          if (!sector.name.trim() || !Number.isFinite(capacity) || capacity < 1) {
            return null;
          }
          return {
            name: sector.name.trim(),
            capacity,
            ...(extra !== null && sector.price.trim()
              ? { priceCents: extra }
              : {}),
          };
        })
        .filter((sector): sector is NonNullable<typeof sector> => !!sector);
      if (sectors.length === 0) {
        setError("Informe ao menos um setor com capacidade.");
        return;
      }
      body.sectors = sectors;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await createEvent(body);
      router.push(`/organizer/events/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar.");
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <OrganizerShell>
        <OrganizerPulse />
      </OrganizerShell>
    );
  }

  return (
    <OrganizerShell>
      <Link
        href="/organizer/events"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon size={16} weight="bold" />
        Meus eventos
      </Link>

      <h1 className="mb-2 text-3xl font-semibold tracking-[-0.03em]">
        Novo evento
      </h1>
      <p className="mb-10 text-sm text-white/40">Passo {state.step} de 5</p>

      {state.step === 1 ? (
        <WizardSourceStep
          source={state.source}
          query={state.query}
          onSource={(source) => patch({ source, item: null })}
          onQuery={(query) => patch({ query })}
          onPick={pickItem}
        />
      ) : null}

      {state.step === 2 && state.item ? (
        <WizardPickStep
          item={state.item}
          onBack={() => patch({ step: 1 })}
          onNext={() => patch({ step: 3 })}
        />
      ) : null}

      {state.step === 3 ? (
        <WizardDetailsStep
          venue={state.venue}
          startsAt={state.startsAt}
          price={state.price}
          onVenue={(venue) => patch({ venue })}
          onStartsAt={(startsAt) => patch({ startsAt })}
          onPrice={(price) => patch({ price })}
          onBack={() => patch({ step: 2 })}
          onNext={() => patch({ step: 4 })}
        />
      ) : null}

      {state.step === 4 ? (
        <WizardInventoryStep
          mode={state.inventoryMode}
          rows={state.rows}
          seatsPerRow={state.seatsPerRow}
          sectors={state.sectors}
          onMode={(inventoryMode) => patch({ inventoryMode })}
          onRows={(rows) => patch({ rows })}
          onSeatsPerRow={(seatsPerRow) => patch({ seatsPerRow })}
          onSectors={(sectors) => patch({ sectors })}
          onBack={() => patch({ step: 3 })}
          onNext={() => patch({ step: 5 })}
        />
      ) : null}

      {state.step === 5 && state.item ? (
        <WizardConfirmStep
          item={state.item}
          venue={state.venue}
          startsAt={state.startsAt}
          priceLabel={
            reaisToCents(state.price) !== null
              ? `R$ ${centsToReaisInput(reaisToCents(state.price) ?? 0)}`
              : state.price
          }
          mode={state.inventoryMode}
          rows={state.rows}
          seatsPerRow={state.seatsPerRow}
          sectors={state.sectors}
          submitting={submitting}
          error={error}
          onBack={() => patch({ step: 4 })}
          onCreate={() => void onCreate()}
        />
      ) : null}
    </OrganizerShell>
  );
}
