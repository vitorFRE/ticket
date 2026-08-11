"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageState } from "@/components/page-state";
import { PagePulse } from "@/components/skeletons/page-pulse";
import { useEventsList } from "@/features/events/use-events-query";
import { validateGate } from "@/features/gate/api/gate-api";
import { GateCodeForm } from "@/features/gate/components/gate-code-form";
import { GateEventPicker } from "@/features/gate/components/gate-event-picker";
import { GateResult } from "@/features/gate/components/gate-result";
import {
  getStoredGateEventId,
  setStoredGateEventId,
} from "@/features/gate/gate-event-storage";
import type { GateValidateResponse } from "@/features/gate/types";
import { queryErrorMessage } from "@/shared/api/query-error";

export function GatePage() {
  const eventsQuery = useEventsList();
  const events = eventsQuery.data?.items ?? [];
  const [eventId, setEventId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<GateValidateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    setEventId(getStoredGateEventId());
  }, []);

  const selected = events.find((event) => event.id === eventId) ?? null;
  const showPicker = !selected || picking;
  const loadError = eventsQuery.isError
    ? queryErrorMessage(eventsQuery.error, "Não foi possível carregar os eventos.")
    : null;

  function pickEvent(id: string) {
    setEventId(id);
    setStoredGateEventId(id);
    setPicking(false);
    setResult(null);
    setError(null);
  }

  const onValidate = useCallback(async (raw: string) => {
    if (!eventId || busyRef.current) return;
    const trimmed = raw.trim();
    if (!trimmed) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const data = await validateGate(eventId, trimmed);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível validar.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [eventId]);

  function onNext() {
    setResult(null);
    setCode("");
    setError(null);
  }

  return (
    <div className="relative z-10 flex-1">
      <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 md:px-6 lg:px-8 lg:pt-10">
        {eventsQuery.isPending ? (
          <PagePulse />
        ) : (
          <div className="space-y-10">
            <header className="space-y-2">
              {!(result && selected && !picking) ? (
                <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
                  Portaria
                </h1>
              ) : null}
              {selected && !picking ? (
                <EventStrip
                  title={selected.title}
                  onChange={() => setPicking(true)}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Escolha o evento desta entrada.
                </p>
              )}
            </header>

            {loadError ? (
              <PageState title="Não foi possível carregar" body={loadError} />
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            {!loadError && showPicker ? (
              <GateEventPicker
                events={events}
                selectedId={eventId}
                onPick={pickEvent}
              />
            ) : null}

            {selected && !picking && result ? (
              <GateResult data={result} onNext={onNext} />
            ) : null}

            {selected && !picking && !result ? (
              <GateCodeForm
                code={code}
                onCodeChange={setCode}
                onSubmit={onValidate}
                busy={busy}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function EventStrip({ title, onChange }: { title: string; onChange: () => void }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <p className="text-sm text-muted-foreground">{title}</p>
      <button
        type="button"
        onClick={onChange}
        className="text-sm text-foreground underline-offset-4 hover:underline"
      >
        Trocar
      </button>
    </div>
  );
}
