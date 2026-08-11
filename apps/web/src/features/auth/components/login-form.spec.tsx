import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "@/features/auth/components/login-form";
import type { AuthUser } from "@/features/auth/types";

const nav = {
  replace: vi.fn(),
  search: new URLSearchParams(),
};

const auth = {
  login: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: nav.replace }),
  useSearchParams: () => nav.search,
}));

vi.mock("@/features/auth/components/auth-provider", () => ({
  useAuth: () => ({ login: auth.login }),
}));

vi.mock("motion/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("motion/react")>();
  return { ...actual, useReducedMotion: () => true };
});

function clientUser(role: AuthUser["role"] = "CLIENT"): AuthUser {
  return {
    id: "u1",
    email: "client1@ticket.local",
    name: "Cliente Um",
    role,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("LoginForm", () => {
  beforeEach(() => {
    nav.replace.mockReset();
    nav.search = new URLSearchParams();
    auth.login.mockReset();
  });

  it("shows field errors from the schema", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(screen.getByText("Informe um e-mail válido")).toBeInTheDocument();
    expect(screen.getByText("Informe a senha")).toBeInTheDocument();
    expect(auth.login).not.toHaveBeenCalled();
  });

  it("goes to the role home when next is absent", async () => {
    const user = userEvent.setup();
    auth.login.mockResolvedValue(clientUser("ORGANIZER"));
    render(<LoginForm />);
    await user.type(screen.getByLabelText("E-mail"), "organizer@ticket.local");
    await user.type(screen.getByLabelText("Senha"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(auth.login).toHaveBeenCalledWith(
      "organizer@ticket.local",
      "Password123!",
    );
    expect(nav.replace).toHaveBeenCalledWith("/organizer/events");
  });

  it("honors a safe next path", async () => {
    const user = userEvent.setup();
    nav.search = new URLSearchParams("next=/tickets");
    auth.login.mockResolvedValue(clientUser());
    render(<LoginForm />);
    await user.type(screen.getByLabelText("E-mail"), "client1@ticket.local");
    await user.type(screen.getByLabelText("Senha"), "Password123!");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(nav.replace).toHaveBeenCalledWith("/tickets");
  });

  it("shows the login error", async () => {
    const user = userEvent.setup();
    auth.login.mockRejectedValue(new Error("Credenciais inválidas"));
    render(<LoginForm />);
    await user.type(screen.getByLabelText("E-mail"), "client1@ticket.local");
    await user.type(screen.getByLabelText("Senha"), "errada");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    expect(
      await screen.findByText("Credenciais inválidas"),
    ).toBeInTheDocument();
    expect(nav.replace).not.toHaveBeenCalled();
  });
});
