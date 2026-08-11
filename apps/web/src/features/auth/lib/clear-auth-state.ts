import { tokenStorage } from "@/features/auth/lib/token-storage";

export function clearAuthState() {
  tokenStorage.clearTokens();
}
