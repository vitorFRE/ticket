export function TicketRowSkeleton() {
  return (
    <div className='flex items-start gap-4 py-5'>
      <div className='h-18 w-12 shrink-0 animate-pulse rounded-sm bg-accent' />
      <div className='min-w-0 flex-1 space-y-2 pt-0.5'>
        <div className='h-4 w-3/4 animate-pulse rounded bg-accent' />
        <div className='h-3 w-1/2 animate-pulse rounded bg-muted' />
        <div className='h-3 w-1/3 animate-pulse rounded bg-muted' />
      </div>
    </div>
  );
}

export function TicketRowSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className='max-w-xl divide-y divide-border'>
      {Array.from({ length: count }, (_, index) => (
        <TicketRowSkeleton key={index} />
      ))}
    </div>
  );
}
