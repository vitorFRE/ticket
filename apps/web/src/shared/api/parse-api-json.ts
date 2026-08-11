import { HttpError } from "@/shared/api/http-error";

function formatMessage(raw: unknown, fallback: string): string {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw.filter((item) => typeof item === "string").join(", ") || fallback;
  }
  return fallback;
}

export async function parseApiJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const body = (await res.json()) as { message?: unknown };
      if (body?.message !== undefined) {
        message = formatMessage(body.message, message);
      }
    } catch {
      // ignore parse errors
    }
    throw new HttpError(res.status, message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
