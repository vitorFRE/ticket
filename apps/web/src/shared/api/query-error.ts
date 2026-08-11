import { HttpError } from "@/shared/api/http-error";

export function isHttpNotFound(error: unknown) {
  return error instanceof HttpError && error.status === 404;
}

export function queryErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
