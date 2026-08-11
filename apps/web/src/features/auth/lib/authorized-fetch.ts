import { clearAuthState } from "@/features/auth/lib/clear-auth-state";
import { tryRefreshTokens } from "@/features/auth/lib/refresh-mutex";
import { tokenStorage } from "@/features/auth/lib/token-storage";

export async function authorizedFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const accessToken = tokenStorage.getAccess();
  const headers = new Headers(init.headers ?? {});
  const method = (init.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let res = await fetch(url, { ...init, headers });
  if (res.status !== 401) return res;

  const refreshed = await tryRefreshTokens();
  if (!refreshed) {
    clearAuthState();
    return res;
  }

  const newAccess = tokenStorage.getAccess();
  if (newAccess) headers.set("Authorization", `Bearer ${newAccess}`);
  res = await fetch(url, { ...init, headers });

  if (res.status === 401) {
    clearAuthState();
  }

  return res;
}
