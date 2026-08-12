import { EventCardSkeletonGrid } from "@/components/skeletons/event-card-skeleton";

/** Suspense shell for `/` — mirrors home chrome without “Carregando…”. */
export function EventsHomeSuspenseFallback() {
  return (
    <div className="relative z-10 flex-1" aria-busy="true">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pt-10 pb-16 md:px-6 lg:px-8 lg:pt-12 lg:pb-24">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-12 w-72 max-w-full animate-pulse rounded-md bg-muted md:h-14" />
            <div className="h-4 w-80 max-w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="h-12 w-full max-w-sm animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="flex gap-5">
          <div className="h-4 w-14 animate-pulse rounded bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-4 w-14 animate-pulse rounded bg-muted" />
        </div>
        <EventCardSkeletonGrid count={4} />
      </div>
    </div>
  );
}
