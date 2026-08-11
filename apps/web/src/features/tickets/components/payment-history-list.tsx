import Link from "next/link";
import { formatDate, formatPrice } from "@/features/events/format";
import {
  reservationLineItems,
  reservationTotalCents,
} from "@/features/reservations/reservation-summary";
import type { ReservationDetail } from "@/features/reservations/types";
import {
  reservationHref,
  reservationStatusLabel,
} from "@/features/tickets/reservation-status";

export function PaymentHistoryList({
  reservations,
}: {
  reservations: ReservationDetail[];
}) {
  return (
    <ul className='max-w-xl divide-y divide-white/10'>
      {reservations.map((reservation) => {
        const href = reservationHref(reservation);
        const body = (
          <>
            {reservation.event.imageUrl ? (
              <img
                src={reservation.event.imageUrl}
                alt=''
                className='h-18 w-12 shrink-0 rounded-sm object-cover'
              />
            ) : (
              <div className='h-18 w-12 shrink-0 rounded-sm bg-white/6' />
            )}
            <div className='min-w-0 flex-1'>
              <p className='font-medium tracking-tight'>{reservation.event.title}</p>
              <p className='mt-1 text-sm text-muted-foreground'>
                {formatDate(reservation.createdAt ?? reservation.event.startsAt)}
                <span className='mx-2 text-white/25'>/</span>
                {reservationLineItems(reservation) || reservation.event.venue}
              </p>
              <p className='mt-2 text-sm text-white/55'>
                {formatPrice(reservationTotalCents(reservation))}
                <span className='mx-2 text-white/25'>/</span>
                {reservationStatusLabel(reservation.status)}
              </p>
            </div>
          </>
        );

        return (
          <li key={reservation.id}>
            {href ? (
              <Link
                href={href}
                className='flex items-start gap-4 py-5 transition-colors hover:text-primary'
              >
                {body}
              </Link>
            ) : (
              <div className='flex items-start gap-4 py-5'>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
