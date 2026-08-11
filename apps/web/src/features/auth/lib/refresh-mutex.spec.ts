import { beforeEach, describe, expect, it, vi } from "vitest";
import { refreshTokens } from "@/features/auth/api/auth-api";
import {
  acquireRefresh,
  tryRefreshTokens,
} from "@/features/auth/lib/refresh-mutex";
import { tokenStorage } from "@/features/auth/lib/token-storage";

vi.mock("@/features/auth/api/auth-api", () => ({
  refreshTokens: vi.fn(),
}));

describe("refresh-mutex", () => {
  beforeEach(() => {
    vi.mocked(refreshTokens).mockReset();
    tokenStorage.clearTokens();
  });

  it("shares a single in-flight refresh", async () => {
    let resolveRefresh!: (value: {
      accessToken: string;
      refreshToken: string;
    }) => void;
    vi.mocked(refreshTokens).mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      }),
    );

    const first = acquireRefresh();
    const second = acquireRefresh();
    expect(refreshTokens).toHaveBeenCalledTimes(1);

    resolveRefresh({
      accessToken: "next-access",
      refreshToken: "next-refresh",
    });
    await expect(first).resolves.toEqual({
      accessToken: "next-access",
      refreshToken: "next-refresh",
    });
    await expect(second).resolves.toEqual({
      accessToken: "next-access",
      refreshToken: "next-refresh",
    });
  });

  it("stores tokens when refresh succeeds", async () => {
    vi.mocked(refreshTokens).mockResolvedValue({
      accessToken: "a",
      refreshToken: "r",
    });
    await expect(tryRefreshTokens()).resolves.toBe(true);
    expect(tokenStorage.getAccess()).toBe("a");
    expect(tokenStorage.getRefresh()).toBe("r");
  });

  it("returns false when refresh fails", async () => {
    vi.mocked(refreshTokens).mockRejectedValue(new Error("expired"));
    await expect(tryRefreshTokens()).resolves.toBe(false);
    expect(tokenStorage.getAccess()).toBeNull();
  });
});
