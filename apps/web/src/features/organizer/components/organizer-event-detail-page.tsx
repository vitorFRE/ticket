"use client";

import { ArrowLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { PageState } from "@/components/page-state";
import { PagePulse } from "@/components/skeletons/page-pulse";
import { formatDate, formatPrice, modeLabel } from "@/features/events/format";
import { OrganizerShell } from "@/features/organizer/components/organizer-shell";
import { eventStatusLabel } from "@/features/organizer/event-status";
import {
  centsToReaisInput,
  fromDatetimeLocal,
  reaisToCents,
  toDatetimeLocal,
} from "@/features/organizer/money";
import {
  useOrganizerEvent,
  usePublishEvent,
  useUpdateEvent,
} from "@/features/organizer/use-organizer-query";
import { isHttpNotFound, queryErrorMessage } from "@/shared/api/query-error";

export function OrganizerEventDetailPage({ eventId }: { eventId: string }) {
  const eventQuery = useOrganizerEvent(eventId);
  const event = eventQuery.data ?? null;
  const update = useUpdateEvent(eventId);
  const publish = usePublishEvent();
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!event) return;
    setTitle(event.title);
    setDescription(event.description ?? "");
    setVenue(event.venue);
    setStartsAt(toDatetimeLocal(event.startsAt));
    setPrice(centsToReaisInput(event.priceCents));
    setImageUrl(event.imageUrl ?? "");
  }, [event]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!event) return;
    const priceCents = reaisToCents(price);
    const iso = fromDatetimeLocal(startsAt);
    if (priceCents === null || !iso || !title.trim() || !venue.trim()) {
      setFormError("Preencha título, local, data e preço.");
      return;
    }
    setFormError(null);
    try {
      await update.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        venue: venue.trim(),
        startsAt: iso,
        priceCents,
        imageUrl: imageUrl.trim() || null,
      });
    } catch (err) {
      setFormError(queryErrorMessage(err, "Não foi possível salvar."));
    }
  }

  async function onPublish() {
    if (!event) return;
    setFormError(null);
    try {
      await publish.mutateAsync(event.id);
    } catch (err) {
      setFormError(queryErrorMessage(err, "Não foi possível publicar."));
    }
  }

  if (eventQuery.isPending) {
    return (
      <OrganizerShell>
        <PagePulse />
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

      {eventQuery.isError && isHttpNotFound(eventQuery.error) ? (
        <PageState
          title="Evento não encontrado"
          body="Esse evento não existe ou não está disponível."
        />
      ) : null}
      {eventQuery.isError && !isHttpNotFound(eventQuery.error) ? (
        <PageState
          title="Não foi possível carregar"
          body="Não foi possível carregar o evento."
        />
      ) : null}

      {event && !eventQuery.isError ? (
        <div className="max-w-xl space-y-10">
          <header className="flex items-start gap-4">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt=""
                className="h-[4.5rem] w-12 shrink-0 rounded-sm object-cover"
              />
            ) : null}
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
                {event.title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {eventStatusLabel(event.status)}
                <span className="mx-2 text-white/25">/</span>
                {modeLabel(event.inventoryMode)}
              </p>
            </div>
          </header>

          {event.status === "PUBLISHED" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {formatDate(event.startsAt)}
                <span className="mx-2 text-white/25">/</span>
                {event.venue}
              </p>
              <p className="text-2xl font-semibold tracking-tight">
                {formatPrice(event.priceCents)}
              </p>
              <Link
                href={`/events/${event.id}`}
                className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
              >
                Ver página pública
              </Link>
            </div>
          ) : (
            <form onSubmit={(e) => void onSave(e)} className="space-y-5">
              <Field label="Título">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Local">
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Data e hora">
                <input
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Preço (R$)">
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Imagem (URL)">
                <input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Descrição">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={`${fieldClass} h-auto py-2`}
                />
              </Field>
              {formError ? (
                <p className="text-sm text-destructive">{formError}</p>
              ) : null}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={update.isPending}
                  className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-40"
                >
                  {update.isPending ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  disabled={publish.isPending}
                  onClick={() => void onPublish()}
                  className="text-sm text-white/70 underline-offset-4 hover:text-foreground hover:underline disabled:opacity-40"
                >
                  {publish.isPending ? "Publicando..." : "Publicar"}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </OrganizerShell>
  );
}

const fieldClass =
  "mt-1.5 w-full border-0 border-b border-white/12 bg-transparent px-0 py-2 text-sm outline-none";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[13px] text-white/40">{label}</span>
      {children}
    </label>
  );
}
