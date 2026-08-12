import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useThemeImage } from "@/hooks/use-theme-image";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "dark" }),
}));

describe("useThemeImage", () => {
  it("switches to dark src after mount", async () => {
    const { result } = renderHook(() =>
      useThemeImage("/light.png", "/dark.png"),
    );

    await waitFor(() => {
      expect(result.current).toBe("/dark.png");
    });
  });
});
