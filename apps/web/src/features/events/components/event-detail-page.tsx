"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MissingPage } from "@/components/missing-page";
import { PageState } from "@/components/page-state";
import { useAuth } from "@/features/auth/components/auth-provider";
import { getEventById } from "@/features/events/api/events-api";
import { formatDate, formatPrice, modeLabel } from "@/features/events/format";
import type { EventDetail } from "@/features/events/types";
import { PendingHoldHint } from "@/features/reservations/components/pending-hold-hint";
import { usePendingHold } from "@/features/reservations/use-pending-hold";
import { HttpError } from "@/shared/api/http-error";

export function EventDetailPage({ eventId }: { eventId: string }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    void getEventById(eventId)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setEvent(null);
        if (err instanceof HttpError && err.status === 404) {
          setError("not-found");
          return;
        }
        setError("network");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const checkoutPath = `/events/${eventId}/checkout`;
  const pendingHold = usePendingHold(eventId);

  function onReserve() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(checkoutPath)}`);
      return;
    }
    router.push(checkoutPath);
  }

  const isStaff = user?.role === "ORGANIZER" || user?.role === "GATE";

  return (
    <div className="relative z-10 flex-1">
      {isLoading ? <DetailSkeleton /> : null}

      {error === "not-found" ? (
        <MissingPage
          title="Evento não encontrado"
          body="Essa sessão saiu de cartaz ou o link não existe."
          imageSrc="/images/event-missing.jpg"
        />
      ) : null}

      {error === "network" ? (
        <DetailState
          title="Não foi possível carregar"
          body="Verifique sua conexão e tente de novo."
        />
      ) : null}

      {event && !error ? (
        <>
          <section className="relative min-h-[78dvh] overflow-hidden">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,color-mix(in_oklch,var(--primary)_18%,transparent),transparent_50%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/25" />

            <div className="relative mx-auto flex min-h-[78dvh] max-w-6xl flex-col justify-end px-4 pb-12 pt-28 md:px-6 md:pb-16 lg:px-8">
              <Link
                href="/"
                className="mb-auto inline-flex w-fit items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
              >
                <ArrowLeftIcon size={16} weight="bold" />
                Eventos
              </Link>

              <div className="mt-16 max-w-3xl">
                <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-balance">
                  {event.title}
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
                  {formatDate(event.startsAt)}
                  <span className="mx-2 text-white/30">/</span>
                  {event.venue}
                  <span className="mx-2 text-white/30">/</span>
                  {modeLabel(event.inventoryMode)}
                </p>
              </div>

              <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-white/10 pt-8">
                <div>
                  <p className="text-xs text-white/50">A partir de</p>
                  <p className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
                    {formatPrice(event.priceCents)}
                  </p>
                </div>

                {authLoading ? null : isStaff ? (
                  <p className="max-w-xs text-sm text-white/55">
                    Entre como cliente para reservar.
                  </p>
                ) : (
                  <div className="flex flex-col items-end gap-3">
                    {pendingHold ? (
                      <PendingHoldHint reservation={pendingHold} />
                    ) : null}
                    <button
                      type="button"
                      onClick={onReserve}
                      className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-[transform,opacity] hover:opacity-90 active:scale-[0.98]"
                    >
                      Reservar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {event.description ? (
            <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-20 lg:px-8">
              <p className="max-w-[62ch] text-base leading-[1.7] text-muted-foreground">
                {event.description}
              </p>
            </section>
          ) : (
            <div className="h-16" />
          )}
        </>
      ) : null}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-[78dvh] animate-pulse bg-white/[0.03]" />
  );
}

function DetailState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-32 pb-20 md:px-6 lg:px-8">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon size={16} weight="bold" />
        Eventos
      </Link>
      <PageState title={title} body={body} />
    </div>
  );
}
