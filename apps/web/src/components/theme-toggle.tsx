"use client";

import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      disabled={!mounted}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-md text-foreground transition-colors",
        "hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
        "disabled:opacity-40",
        className,
      )}
    >
      {isDark ? (
        <SunIcon size={18} weight="bold" />
      ) : (
        <MoonIcon size={18} weight="bold" />
      )}
    </button>
  );
}
