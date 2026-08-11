const ACCESS_KEY = "ticket_access_token";
const REFRESH_KEY = "ticket_refresh_token";

function canUseStorage() {
  return typeof window !== "undefined";
}

export const tokenStorage = {
  getAccess(): string | null {
    if (!canUseStorage()) return null;
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefresh(): string | null {
    if (!canUseStorage()) return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  setTokens(accessToken: string, refreshToken: string): void {
    if (!canUseStorage()) return;
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clearTokens(): void {
    if (!canUseStorage()) return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
