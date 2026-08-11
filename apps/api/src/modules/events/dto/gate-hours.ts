import { Transform } from "class-transformer";

export function toOptionalGateHours({ value }: { value: unknown }) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return Number(value);
}

export const TransformGateHours = () => Transform(toOptionalGateHours);
