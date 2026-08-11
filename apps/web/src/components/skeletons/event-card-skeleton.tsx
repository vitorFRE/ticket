import { glassInnerFlushCompact, glassOuterCompact } from "@/lib/glass-styles";

export function EventCardSkeleton() {
  return (
    <div className={glassOuterCompact}>
      <div className={`${glassInnerFlushCompact} flex flex-col`}>
        <div className="aspect-16/9 animate-pulse bg-white/[0.05]" />
        <div className="space-y-2 px-3.5 py-3">
          <div className="h-4 w-4/5 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.04]" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.04]" />
        </div>
      </div>
    </div>
  );
}

export function EventCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
}
