import { homeForRole } from "@/features/auth/lib/home-for-role";
import type { AuthUser } from "@/features/auth/types";

export { homeForRole };

export const SEED_PASSWORD = "Password123!";

export type SeedAccount = {
  id: string;
  email: string;
  name: string;
  role: AuthUser["role"];
  hint: string;
};

export const SEED_ACCOUNTS: SeedAccount[] = [
  {
    id: "client1",
    email: "client1@ticket.local",
    name: "Cliente Um",
    role: "CLIENT",
    hint: "Compra e ingressos",
  },
  {
    id: "client2",
    email: "client2@ticket.local",
    name: "Cliente Dois",
    role: "CLIENT",
    hint: "Segundo cliente, holds cruzados",
  },
  {
    id: "organizer",
    email: "organizer@ticket.local",
    name: "Organizador Seed",
    role: "ORGANIZER",
    hint: "Catálogo e publicação",
  },
  {
    id: "gate",
    email: "gate@ticket.local",
    name: "Portaria Seed",
    role: "GATE",
    hint: "Validação na entrada",
  },
];

export const SEED_EVENT_LINKS = [
  {
    href: "/events/00000000-0000-4000-8000-000000000001",
    label: "Cinema",
    hint: "Mapa de assentos",
  },
  {
    href: "/events/00000000-0000-4000-8000-000000000002",
    label: "Show",
    hint: "Setores GA",
  },
] as const;

export function roleLabel(role: AuthUser["role"]): string {
  if (role === "ORGANIZER") return "Organizador";
  if (role === "GATE") return "Portaria";
  return "Cliente";
}
