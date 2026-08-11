"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MissingPage } from "@/components/missing-page";
import { PageState } from "@/components/page-state";
import { EventDetailSkeleton } from "@/components/skeletons/event-detail-skeleton";
import { useAuth } from "@/features/auth/components/auth-provider";
import { kindLabelFromSource } from "@/features/events/catalog-kind";
import { GateLimitNote } from "@/features/events/components/gate-limit-note";
import { MoreEvents } from "@/features/events/components/more-events";
import { formatDate, formatPrice } from "@/features/events/format";
import { useEventDetail } from "@/features/events/use-events-query";
import { PendingHoldHint } from "@/features/reservations/components/pending-hold-hint";
import { usePendingHold } from "@/features/reservations/use-pending-hold";
import { isHttpNotFound } from "@/shared/api/query-error";

export function EventDetailPage({ eventId }: { eventId: string }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const query = useEventDetail(eventId);
  const event = query.data ?? null;
  const pendingHold = usePendingHold(eventId);

  const checkoutPath = `/events/${eventId}/checkout`;

  function onReserve() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(checkoutPath)}`);
      return;
    }
    router.push(checkoutPath);
  }

  const isStaff = user?.role === "ORGANIZER" || user?.role === "GATE";
  const notFound = query.isError && isHttpNotFound(query.error);
  const network = query.isError && !notFound;

  return (
    <div className="relative z-10 flex-1">
      {query.isPending ? <EventDetailSkeleton /> : null}

      {notFound ? (
        <MissingPage
          title="Evento não encontrado"
          body="Essa sessão saiu de cartaz ou o link não existe."
          imageSrc="/images/event-missing.jpg"
        />
      ) : null}

      {network ? (
        <DetailState
          title="Não foi possível carregar"
          body="Verifique sua conexão e tente de novo."
        />
      ) : null}

      {event && !query.isError ? (
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
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/75 to-background/25" />

            <div className="relative mx-auto flex min-h-[78dvh] max-w-6xl flex-col justify-end px-4 pb-12 pt-8 md:px-6 md:pb-16 lg:px-8">
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
                  {kindLabelFromSource(event.externalSource)}
                </p>
                <GateLimitNote
                  hoursBefore={event.gateOpensHoursBefore}
                  className="mt-3"
                />
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

          <MoreEvents currentId={event.id} source={event.externalSource} />
        </>
      ) : null}
    </div>
  );
}

function DetailState({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 pb-20 md:px-6 lg:px-8">
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
