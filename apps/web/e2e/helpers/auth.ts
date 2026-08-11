import type { Page } from "@playwright/test";

export const SEED_PASSWORD = "Password123!";
export const CLIENT_EMAIL = "client1@ticket.local";

export async function loginAsClient(page: Page, email = CLIENT_EMAIL) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(SEED_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));
}
