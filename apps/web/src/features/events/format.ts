import type { EventListItem } from "@/features/events/types";

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function modeLabel(mode: EventListItem["inventoryMode"]) {
  return mode === "SEAT_MAP" ? "Assentos" : "Setores";
}
