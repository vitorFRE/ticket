import { describe, expect, it } from "vitest";
import { loginSchema } from "@/features/auth/schemas/login-schema";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "client1@ticket.local",
      password: "Password123!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "nao-e-email",
      password: "x",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.error.issues.some(
        (issue) => issue.message === "Informe um e-mail válido",
      ),
    ).toBe(true);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "ok@ticket.local",
      password: "",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.error.issues.some((issue) => issue.message === "Informe a senha"),
    ).toBe(true);
  });
});
