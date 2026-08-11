import { authorizedFetch } from "@/features/auth/lib/authorized-fetch";
import type { GateValidateResponse } from "@/features/gate/types";
import { parseApiJson } from "@/shared/api/parse-api-json";
import { getApiBaseUrl } from "@/shared/config/api-base";

export async function validateGate(
  eventId: string,
  code: string,
): Promise<GateValidateResponse> {
  const res = await authorizedFetch(`${getApiBaseUrl()}/gate/validate`, {
    method: "POST",
    body: JSON.stringify({ eventId, code }),
  });
  return parseApiJson<GateValidateResponse>(res);
}
