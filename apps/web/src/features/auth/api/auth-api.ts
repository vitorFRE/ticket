import { getApiBaseUrl } from "@/shared/config/api-base";
import { parseApiJson } from "@/shared/api/parse-api-json";
import type {
  AuthUser,
  LoginResponse,
  RefreshResponse,
} from "@/features/auth/types";
import { tokenStorage } from "@/features/auth/lib/token-storage";

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseApiJson<LoginResponse>(res);
}

export async function refreshTokens(): Promise<RefreshResponse> {
  const refreshToken = tokenStorage.getRefresh();
  const res = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
  });
  return parseApiJson<RefreshResponse>(res);
}

export async function getMe(): Promise<AuthUser> {
  const accessToken = tokenStorage.getAccess();
  const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return parseApiJson<AuthUser>(res);
}

export async function logoutRequest(): Promise<void> {
  const accessToken = tokenStorage.getAccess();
  if (!accessToken) return;
  await fetch(`${getApiBaseUrl()}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
