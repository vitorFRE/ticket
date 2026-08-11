import { EventCardCarousel } from "@/features/events/components/event-card-carousel";
import type { EventListItem } from "@/features/events/types";

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
    <EventCardCarousel
      title={title}
      subtitle={subtitle}
      events={events}
      searching={searching}
    />
  );
}
