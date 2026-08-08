const REQUIRED_IN_PRODUCTION = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "DATABASE_URL",
  "DATABASE_AUTH_TOKEN",
] as const;

const WEAK_DEFAULTS = [
  "change-me-access",
  "change-me-refresh",
  "dev-access-secret-change-me",
  "dev-refresh-secret-change-me",
];

export function validateEnv(): void {
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `Variáveis de ambiente obrigatórias em produção não definidas: ${missing.join(", ")}`,
      );
    }
  }

  const jwtSecrets = [
    process.env.JWT_ACCESS_SECRET,
    process.env.JWT_REFRESH_SECRET,
  ].filter(Boolean) as string[];

  const hasWeakSecret = jwtSecrets.some((secret) =>
    WEAK_DEFAULTS.includes(secret),
  );
  if (isProd && hasWeakSecret) {
    throw new Error(
      "JWT secrets com valores padrão/fracos detectados em produção. Defina JWT_ACCESS_SECRET e JWT_REFRESH_SECRET com valores seguros.",
    );
  }
}
