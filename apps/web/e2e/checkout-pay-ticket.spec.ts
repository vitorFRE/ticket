import { expect, test } from "@playwright/test";
import { loginAsClient } from "./helpers/auth";
import {
  CINEMA_EVENT_ID,
  confirmPayment,
  confirmReservation,
  openCheckout,
  pickFirstFreeSeat,
  SHOW_EVENT_ID,
} from "./helpers/checkout";

test.describe("reserva, pagamento e ingresso", () => {
  test("cinema: assento, pagamento aprovado e ingresso", async ({ page }) => {
    await loginAsClient(page);
    await openCheckout(page, CINEMA_EVENT_ID);

    const title = await page.getByRole("heading", { level: 1 }).innerText();
    await pickFirstFreeSeat(page);
    await confirmReservation(page);

    await expect(
      page.getByText("Cartão de teste. Nada é cobrado."),
    ).toBeVisible();
    await confirmPayment(page);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByText("Válido")).toBeVisible();
  });

  test("show: setor, pagamento aprovado e ingresso", async ({ page }) => {
    await loginAsClient(page);
    await openCheckout(page, SHOW_EVENT_ID);

    const title = await page.getByRole("heading", { level: 1 }).innerText();
    await page.getByRole("button", { name: /Pista/ }).click();
    await confirmReservation(page);
    await confirmPayment(page);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByText("Válido")).toBeVisible();
    await expect(page.getByText("Pista")).toBeVisible();
  });

  test("rejeição vira o título da tela de pay", async ({ page }) => {
    await loginAsClient(page);
    await openCheckout(page, CINEMA_EVENT_ID);
    await pickFirstFreeSeat(page);
    await confirmReservation(page);

    await page.getByRole("button", { name: "Simular rejeição" }).click();
    await expect(
      page.getByRole("heading", { name: "Pagamento recusado" }),
    ).toBeVisible();
    await expect(
      page.getByText(/voltaram à lista. Ninguém foi cobrado/),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Escolher de novo" }),
    ).toBeVisible();
  });
});
