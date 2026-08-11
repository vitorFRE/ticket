"use client";

import { useQrDataUrl } from "@/features/tickets/use-qr-data-url";

export function TicketQr({
  payload,
  faded,
}: {
  payload: string;
  faded?: boolean;
}) {
  const src = useQrDataUrl(payload);

  return (
    <div
      className={`w-fit bg-white p-3 ${faded ? "opacity-35" : ""}`}
      aria-hidden={faded}
    >
      {src ? (
        <img src={src} alt="" width={220} height={220} className="size-[220px]" />
      ) : (
        <div className="size-[220px] bg-neutral-200" />
      )}
    </div>
  );
}
