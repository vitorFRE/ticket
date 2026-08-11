"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { listEvents } from "@/features/events/api/events-api";
import type { EventListItem } from "@/features/events/types";
import { validateGate } from "@/features/gate/api/gate-api";
import { GateCodeForm } from "@/features/gate/components/gate-code-form";
import { GateEventPicker } from "@/features/gate/components/gate-event-picker";
import { GateResult } from "@/features/gate/components/gate-result";
import {
  getStoredGateEventId,
  setStoredGateEventId,
} from "@/features/gate/gate-event-storage";
import type { GateValidateResponse } from "@/features/gate/types";
import { useGateGuard } from "@/features/gate/use-gate-guard";

export function GatePage() {
  const { ready } = useGateGuard("/gate");
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [eventId, setEventId] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<GateValidateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!ready) return;
    setEventId(getStoredGateEventId());
    let cancelled = false;
    setLoadingEvents(true);
    void listEvents()
      .then((data) => {
        if (!cancelled) setEvents(data.items);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Não foi possível carregar os eventos.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingEvents(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const selected = events.find((event) => event.id === eventId) ?? null;
  const showPicker = !selected || picking;

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
      <div className="mx-auto max-w-6xl px-4 pt-28 pb-20 md:px-6 lg:px-8 lg:pt-32">
        {!ready || loadingEvents ? (
          <div className="h-48 animate-pulse rounded-lg bg-white/[0.04]" />
        ) : (
          <div className="space-y-10">
            <header className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
                Portaria
              </h1>
              {selected && !picking ? (
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="text-sm text-muted-foreground">{selected.title}</p>
                  <button
                    type="button"
                    onClick={() => setPicking(true)}
                    className="text-sm text-foreground underline-offset-4 hover:underline"
                  >
                    Trocar
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Escolha o evento desta entrada.
                </p>
              )}
            </header>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            {showPicker ? (
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
