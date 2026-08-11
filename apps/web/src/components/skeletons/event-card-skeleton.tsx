import { EVENT_CARD_ROW } from "@/features/events/components/event-card";

export function EventCardSkeleton() {
  return (
    <div className="w-62 shrink-0 sm:w-68">
      <div className="aspect-4/5 animate-pulse rounded-lg bg-white/5" />
      <div className="mt-2.5 space-y-1.5">
        <div className="h-4 w-4/5 animate-pulse rounded bg-white/6" />
        <div className="h-3.5 w-2/3 animate-pulse rounded bg-white/4" />
        <div className="h-3.5 w-1/2 animate-pulse rounded bg-white/4" />
      </div>
    </div>
  );
}

export function EventCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className={EVENT_CARD_ROW}>
      {Array.from({ length: count }, (_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}
