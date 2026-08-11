import type { AuthUser } from "@/features/auth/types";

export function homeForRole(role: AuthUser["role"]): string {
  if (role === "ORGANIZER") return "/organizer/events";
  if (role === "GATE") return "/gate";
  return "/";
}
