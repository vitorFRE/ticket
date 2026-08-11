import { Suspense } from "react";
import { EventsHome } from "@/features/events/components/events-home";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="page-canvas flex-1 px-4 py-14 text-sm text-muted-foreground md:px-6">
          Carregando eventos...
        </div>
      }
    >
      <EventsHome />
    </Suspense>
  );
}
