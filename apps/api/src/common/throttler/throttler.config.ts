import type { ExecutionContext } from "@nestjs/common";
import type { ThrottlerModuleOptions } from "@nestjs/throttler";

const MINUTE_MS = 60_000;
const THROTTLER_LIMIT_KEY = "THROTTLER:LIMIT";

export const THROTTLE_PRESETS = {
  default: { limit: 120, ttl: MINUTE_MS },
  auth: { limit: 10, ttl: MINUTE_MS },
  catalog: { limit: 30, ttl: MINUTE_MS },
  gate: { limit: 60, ttl: MINUTE_MS },
} as const;

function skipUnlessDecorated(name: keyof typeof THROTTLE_PRESETS) {
  const limitKey = `${THROTTLER_LIMIT_KEY}${name}`;
  return (context: ExecutionContext) => {
    const handler = context.getHandler();
    const classRef = context.getClass();
    return (
      Reflect.getMetadata(limitKey, handler) === undefined &&
      Reflect.getMetadata(limitKey, classRef) === undefined
    );
  };
}

export const throttlerModuleOptions: ThrottlerModuleOptions = {
  throttlers: [
    { name: "default", ...THROTTLE_PRESETS.default },
    {
      name: "auth",
      ...THROTTLE_PRESETS.auth,
      skipIf: skipUnlessDecorated("auth"),
    },
    {
      name: "catalog",
      ...THROTTLE_PRESETS.catalog,
      skipIf: skipUnlessDecorated("catalog"),
    },
    {
      name: "gate",
      ...THROTTLE_PRESETS.gate,
      skipIf: skipUnlessDecorated("gate"),
    },
  ],
};
