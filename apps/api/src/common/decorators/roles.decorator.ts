import { applyDecorators, SetMetadata } from "@nestjs/common";
import { ApiExtension } from "@nestjs/swagger";
import type { UserRole } from "../../generated/prisma/enums";

export const ROLES_KEY = "roles";

export const Roles = (...roles: UserRole[]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    ApiExtension("x-required-roles", roles),
  );
