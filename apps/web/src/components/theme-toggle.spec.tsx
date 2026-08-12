import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/theme-toggle";

const setTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
    setTheme,
  }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    setTheme.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("toggles to dark from light after mount", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByRole("button", {
      name: "Ativar tema escuro",
    });
    await user.click(button);
    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
