"use client";

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { EVENT_CARD_ROW, EventCard } from "@/features/events/components/event-card";
import type { EventListItem } from "@/features/events/types";
import { cn } from "@/lib/utils";

type EventCardCarouselProps = {
  title: string;
  subtitle?: string;
  events: EventListItem[];
  headerRight?: ReactNode;
  searching?: boolean;
};

export function EventCardCarousel({
  title,
  subtitle,
  events,
  headerRight,
  searching = false,
}: EventCardCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    setCanPrev(node.scrollLeft > 2);
    setCanNext(max > 2 && node.scrollLeft < max - 2);
  }, []);

  useLayoutEffect(() => {
    const node = scrollerRef.current;
    if (!node) return;
    sync();
    node.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => {
      node.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [events, sync]);

  function scrollByPage(direction: -1 | 1) {
    const node = scrollerRef.current;
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollBy({
      left: direction * node.clientWidth * 0.85,
      behavior: reduce ? "auto" : "smooth",
    });
  }

  return (
    <section className={cn("space-y-5", searching && "opacity-70 transition-opacity")}>
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0 max-w-xl space-y-1">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-balance md:text-2xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          {headerRight}
          <div className="flex items-center gap-1.5">
            <NavButton
              label="Ver anteriores"
              disabled={!canPrev}
              onClick={() => scrollByPage(-1)}
            >
              <CaretLeftIcon size={14} weight="bold" />
            </NavButton>
            <NavButton
              label="Ver próximos"
              disabled={!canNext}
              onClick={() => scrollByPage(1)}
            >
              <CaretRightIcon size={14} weight="bold" />
            </NavButton>
          </div>
        </div>
      </header>
      <div ref={scrollerRef} className={EVENT_CARD_ROW}>
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex size-8 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-30 active:scale-[0.98]"
    >
      {children}
    </button>
  );
}
