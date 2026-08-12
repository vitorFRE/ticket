import { TicketRowSkeletonList } from "@/components/skeletons/ticket-row-skeleton";

export function TicketsSuspenseFallback() {
  return (
    <div
      className='relative z-10 mx-auto max-w-6xl px-4 pt-8 pb-20 md:px-6 lg:px-8 lg:pt-10'
      aria-busy='true'
    >
      <div className='mb-10 h-4 w-24 animate-pulse rounded bg-muted' />
      <div className='h-9 w-40 animate-pulse rounded-md bg-muted' />
      <div className='mt-8'>
        <TicketRowSkeletonList />
      </div>
    </div>
  );
}
