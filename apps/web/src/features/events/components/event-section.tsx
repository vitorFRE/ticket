import { ScrollReveal } from "@/components/scroll-reveal";
import { EventCard } from "@/features/events/components/event-card";
import type { EventListItem } from "@/features/events/types";
import { cn } from "@/lib/utils";

export function EventSection({
  title,
  subtitle,
  events,
  searching = false,
}: {
  title: string;
  subtitle?: string;
  events: EventListItem[];
  searching?: boolean;
}) {
  if (events.length === 0) return null;

  return (
    <section className={cn("space-y-5", searching && "opacity-70 transition-opacity")}>
      <header className="max-w-xl space-y-1">
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-balance md:text-2xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        ) : null}
      </header>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {events.map((event, index) => (
          <ScrollReveal key={event.id} delayMs={40 + index * 45}>
            <EventCard event={event} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
