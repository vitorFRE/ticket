export function EventDetailSkeleton() {
  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-white/[0.03]">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-end px-4 pb-12 pt-8 md:px-6 md:pb-16 lg:px-8">
        <div className="h-4 w-20 animate-pulse rounded bg-white/[0.06]" />
        <div className="mt-16 space-y-4">
          <div className="h-14 w-3/4 max-w-xl animate-pulse rounded bg-white/[0.07]" />
          <div className="h-4 w-64 animate-pulse rounded bg-white/[0.04]" />
        </div>
        <div className="mt-10 flex items-end justify-between border-t border-white/10 pt-8">
          <div className="h-10 w-32 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-11 w-28 animate-pulse rounded-md bg-white/[0.06]" />
        </div>
      </div>
    </div>
  );
}
