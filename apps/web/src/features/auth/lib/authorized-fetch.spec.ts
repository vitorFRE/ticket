import { beforeEach, describe, expect, it, vi } from "vitest";
import { authorizedFetch } from "@/features/auth/lib/authorized-fetch";
import { tryRefreshTokens } from "@/features/auth/lib/refresh-mutex";
import { tokenStorage } from "@/features/auth/lib/token-storage";

vi.mock("@/features/auth/lib/refresh-mutex", () => ({
  tryRefreshTokens: vi.fn(),
}));

function jsonResponse(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("authorizedFetch", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(tryRefreshTokens).mockReset();
    tokenStorage.clearTokens();
  });

  it("sends the access token and JSON content-type on POST", async () => {
    tokenStorage.setTokens("access-1", "refresh-1");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200));
    vi.stubGlobal("fetch", fetchMock);

    await authorizedFetch("http://localhost:3001/reservations", {
      method: "POST",
      body: JSON.stringify({ eventId: "evt-1" }),
    });

    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.get("Authorization")).toBe("Bearer access-1");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("does not force Content-Type on GET", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200));
    vi.stubGlobal("fetch", fetchMock);

    await authorizedFetch("http://localhost:3001/events");

    const headers = new Headers(fetchMock.mock.calls[0]?.[1]?.headers);
    expect(headers.has("Content-Type")).toBe(false);
  });

  it("refreshes once and retries after 401", async () => {
    tokenStorage.setTokens("old", "refresh-1");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401, { message: "expired" }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(tryRefreshTokens).mockImplementation(async () => {
      tokenStorage.setTokens("new", "refresh-2");
      return true;
    });

    const res = await authorizedFetch("http://localhost:3001/tickets");
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const retryHeaders = new Headers(fetchMock.mock.calls[1]?.[1]?.headers);
    expect(retryHeaders.get("Authorization")).toBe("Bearer new");
  });

  it("clears auth when refresh fails", async () => {
    tokenStorage.setTokens("old", "refresh-1");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401));
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(tryRefreshTokens).mockResolvedValue(false);

    const res = await authorizedFetch("http://localhost:3001/tickets");
    expect(res.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(tokenStorage.getAccess()).toBeNull();
  });

  it("clears auth when the retry is still 401", async () => {
    tokenStorage.setTokens("old", "refresh-1");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401));
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(tryRefreshTokens).mockImplementation(async () => {
      tokenStorage.setTokens("new", "refresh-2");
      return true;
    });

    const res = await authorizedFetch("http://localhost:3001/tickets");
    expect(res.status).toBe(401);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(tokenStorage.getAccess()).toBeNull();
  });
});
