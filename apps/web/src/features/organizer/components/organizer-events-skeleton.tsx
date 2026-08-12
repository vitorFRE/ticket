export function OrganizerEventsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-16/9 rounded-lg bg-card/60" />
          <div className="mt-2.5 h-4 w-3/4 rounded bg-card/60" />
          <div className="mt-2 h-3 w-1/2 rounded bg-card/60" />
        </div>
      ))}
    </div>
  );
}
