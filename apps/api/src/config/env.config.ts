const isProd = () => process.env.NODE_ENV === "production";

function secretFromEnv(value: string | undefined, devFallback: string): string {
  if (value) return value;
  if (isProd()) {
    throw new Error(
      "Secret obrigatório ausente em produção. Defina JWT_ACCESS_SECRET, JWT_REFRESH_SECRET e TICKET_HMAC_SECRET.",
    );
  }
  return devFallback;
}

export const envConfig = () => ({
  port: Number.parseInt(process.env.PORT ?? "3001", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  database: {
    localUrl: process.env.LOCAL_DATABASE_URL ?? "file:dev.db",
    url: process.env.DATABASE_URL ?? "",
    authToken: process.env.DATABASE_AUTH_TOKEN ?? "",
  },
  jwt: {
    accessSecret: secretFromEnv(
      process.env.JWT_ACCESS_SECRET,
      "change-me-access",
    ),
    refreshSecret: secretFromEnv(
      process.env.JWT_REFRESH_SECRET,
      "change-me-refresh",
    ),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES ?? "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES ?? "7d",
  },
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:3000",
  allowRegistration: process.env.ALLOW_REGISTRATION !== "false",
  ticketHmacSecret: secretFromEnv(
    process.env.TICKET_HMAC_SECRET,
    "change-me-ticket-hmac",
  ),
  catalog: {
    tmdbApiKey: process.env.TMDB_API_KEY ?? "",
    tmdbAccessToken: process.env.TMDB_ACCESS_TOKEN ?? "",
    ticketmasterApiKey: process.env.TICKETMASTER_API_KEY ?? "",
  },
});
