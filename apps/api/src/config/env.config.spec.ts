import { envConfig } from "./env.config";

const ENV_KEYS = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "TICKET_HMAC_SECRET",
  "NODE_ENV",
] as const;

describe("envConfig", () => {
  const snapshot = Object.fromEntries(
    ENV_KEYS.map((key) => [key, process.env[key]]),
  );

  afterEach(() => {
    for (const key of ENV_KEYS) {
      const value = snapshot[key];
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it("uses jwt.accessSecret fallback when env is missing in development", () => {
    delete process.env.JWT_ACCESS_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    delete process.env.TICKET_HMAC_SECRET;
    process.env.NODE_ENV = "development";

    const config = envConfig();

    expect(config.jwt.accessSecret).toBe("change-me-access");
    expect(config.jwt.refreshSecret).toBe("change-me-refresh");
    expect(config.ticketHmacSecret).toBe("change-me-ticket-hmac");
  });

  it("prefers process.env over fallbacks", () => {
    process.env.NODE_ENV = "development";
    process.env.JWT_ACCESS_SECRET = "real-access";
    process.env.JWT_REFRESH_SECRET = "real-refresh";
    process.env.TICKET_HMAC_SECRET = "real-hmac";

    const config = envConfig();

    expect(config.jwt.accessSecret).toBe("real-access");
    expect(config.jwt.refreshSecret).toBe("real-refresh");
    expect(config.ticketHmacSecret).toBe("real-hmac");
  });

  it("throws in production when JWT_ACCESS_SECRET is missing", () => {
    delete process.env.JWT_ACCESS_SECRET;
    process.env.NODE_ENV = "production";

    expect(() => envConfig()).toThrow(/Secret obrigatório ausente/);
  });
});
