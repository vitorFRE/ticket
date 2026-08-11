"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

export function useQrDataUrl(payload: string | null) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!payload) {
      setSrc(null);
      return;
    }
    let cancelled = false;
    void QRCode.toDataURL(payload, {
      margin: 2,
      width: 280,
      errorCorrectionLevel: "H",
      color: { dark: "#1a1714", light: "#ffffff" },
    }).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [payload]);

  return src;
}
