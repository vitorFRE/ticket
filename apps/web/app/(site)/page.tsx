import { Suspense } from "react";
import { EventsHomeSuspenseFallback } from "@/components/skeletons/events-home-suspense-fallback";
import { EventsHome } from "@/features/events/components/events-home";

export default function HomePage() {
  return (
    <Suspense fallback={<EventsHomeSuspenseFallback />}>
      <EventsHome />
    </Suspense>
  );
}
