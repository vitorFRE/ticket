import { refreshTokens } from "@/features/auth/api/auth-api";
import { tokenStorage } from "@/features/auth/lib/token-storage";
import type { RefreshResponse } from "@/features/auth/types";

let inflightRefresh: Promise<RefreshResponse> | null = null;

export async function acquireRefresh(): Promise<RefreshResponse> {
  if (!inflightRefresh) {
    inflightRefresh = refreshTokens().finally(() => {
      inflightRefresh = null;
    });
  }
  return inflightRefresh;
}

export async function tryRefreshTokens(): Promise<boolean> {
  try {
    const tokens = await acquireRefresh();
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    return true;
  } catch {
    return false;
  }
}
