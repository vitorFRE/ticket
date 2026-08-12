"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/** Picks light/dark asset after mount; defaults to light (app default). */
export function useThemeImage(lightSrc: string, darkSrc: string) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return lightSrc;
  return resolvedTheme === "dark" ? darkSrc : lightSrc;
}
