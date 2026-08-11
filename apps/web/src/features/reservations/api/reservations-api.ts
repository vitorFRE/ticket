import { authorizedFetch } from "@/features/auth/lib/authorized-fetch";
import type {
  CreateReservationBody,
  PayOutcome,
  ReservationCreated,
  ReservationDetail,
  ReservationsListResponse,
} from "@/features/reservations/types";
import { parseApiJson } from "@/shared/api/parse-api-json";
import { getApiBaseUrl } from "@/shared/config/api-base";

export async function createReservation(
  body: CreateReservationBody,
): Promise<ReservationCreated> {
  const res = await authorizedFetch(`${getApiBaseUrl()}/reservations`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return parseApiJson<ReservationCreated>(res);
}

export async function listMyReservations(): Promise<ReservationsListResponse> {
  const res = await authorizedFetch(`${getApiBaseUrl()}/reservations/mine`);
  return parseApiJson<ReservationsListResponse>(res);
}

export async function getReservation(id: string): Promise<ReservationDetail> {
  const res = await authorizedFetch(`${getApiBaseUrl()}/reservations/${id}`);
  return parseApiJson<ReservationDetail>(res);
}

export async function payReservation(
  id: string,
  outcome: PayOutcome,
): Promise<ReservationDetail> {
  const res = await authorizedFetch(
    `${getApiBaseUrl()}/reservations/${id}/pay`,
    {
      method: "POST",
      body: JSON.stringify({ outcome }),
    },
  );
  return parseApiJson<ReservationDetail>(res);
}
