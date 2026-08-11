import { expect, type Page } from "@playwright/test";

export const CINEMA_EVENT_ID = "00000000-0000-4000-8000-000000000001";
export const SHOW_EVENT_ID = "00000000-0000-4000-8000-000000000002";

export async function openCheckout(page: Page, eventId: string) {
  await page.goto(`/events/${eventId}/checkout`);
}

export async function pickFirstFreeSeat(page: Page) {
  const seat = page.locator("button[aria-pressed]:not([disabled])").first();
  await expect(seat).toBeVisible();
  await seat.click();
}

export async function confirmReservation(page: Page) {
  await page.getByRole("button", { name: "Confirmar reserva" }).click();
  await page.waitForURL(/\/reservations\/[^/]+\/pay/);
}

export async function confirmPayment(page: Page) {
  await expect(
    page.getByRole("button", { name: "Confirmar pagamento" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Confirmar pagamento" }).click();
  await page.waitForURL(/\/tickets\/[^/]+/);
}
