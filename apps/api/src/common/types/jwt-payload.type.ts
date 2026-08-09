import type { UserRole } from "../../generated/prisma/enums";

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export type JwtPayloadWithRefresh = JwtPayload & { refreshToken: string };
