import { PageState } from "@/components/page-state";
import { formatDate } from "@/features/events/format";
import type { EventListItem } from "@/features/events/types";
import { cn } from "@/lib/utils";

export function GateEventPicker({
  events,
  selectedId,
  onPick,
}: {
  events: EventListItem[];
  selectedId: string | null;
  onPick: (id: string) => void;
}) {
  if (events.length === 0) {
    return (
      <PageState
        title='Nenhum evento publicado'
        body='A portaria precisa de um evento na lista.'
      />
    );
  }

  return (
    <ul className='max-w-xl divide-y divide-white/6'>
      {events.map((event) => {
        const active = event.id === selectedId;
        return (
          <li key={event.id}>
            <button
              type='button'
              onClick={() => onPick(event.id)}
              className={cn(
                "flex w-full flex-col items-start gap-1 py-4 text-left transition-colors",
                active ? "text-foreground" : "hover:text-foreground"
              )}
            >
              <span className='text-base font-medium tracking-tight'>{event.title}</span>
              <span className='text-sm text-muted-foreground'>
                {formatDate(event.startsAt)}
                <span className='mx-2 text-white/20'>/</span>
                {event.venue}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
