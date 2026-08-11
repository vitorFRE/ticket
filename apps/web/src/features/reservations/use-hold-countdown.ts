"use client";

import { useEffect, useState } from "react";

export function useHoldCountdown(expiresAt: string | null) {
  const [remainingMs, setRemainingMs] = useState(() => remaining(expiresAt));

  useEffect(() => {
    setRemainingMs(remaining(expiresAt));
    if (!expiresAt) return;
    const id = window.setInterval(() => {
      setRemainingMs(remaining(expiresAt));
    }, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt]);

  return remainingMs;
}

function remaining(expiresAt: string | null) {
  if (!expiresAt) return 0;
  return new Date(expiresAt).getTime() - Date.now();
}
