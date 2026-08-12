"use client";

import { formatPrice } from "@/features/events/format";

type OrganizerMetricsSummaryProps = {
  publishedCount: number;
  ticketsSold: number;
  revenueCents: number;
  ticketsUsed: number;
};

export function OrganizerMetricsSummary({
  publishedCount,
  ticketsSold,
  revenueCents,
  ticketsUsed,
}: OrganizerMetricsSummaryProps) {
  return (
    <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-white/8 pt-8 sm:grid-cols-4">
      <Metric label="Publicados" value={String(publishedCount)} />
      <Metric label="Vendidos" value={String(ticketsSold)} />
      <Metric label="Receita" value={formatPrice(revenueCents)} />
      <Metric label="Check-ins" value={String(ticketsUsed)} />
    </dl>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.14em] text-white/40">
        {label}
      </dt>
      <dd className="mt-1.5 text-2xl font-semibold tracking-[-0.03em] tabular-nums">
        {value}
      </dd>
    </div>
  );
}
