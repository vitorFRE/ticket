"use client";

import { useEffect, useRef, useState } from "react";

function readResultText(result: { getText: () => string }) {
  return result.getText().trim();
}

export function GateCameraScan({
  onDetect,
  locked,
}: {
  onDetect: (value: string) => void;
  locked: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onDetectRef = useRef(onDetect);
  const lockedRef = useRef(locked);
  const [status, setStatus] = useState<"starting" | "live" | "error">("starting");

  useEffect(() => {
    onDetectRef.current = onDetect;
  }, [onDetect]);

  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let controls: { stop: () => void } | null = null;
    let cancelled = false;

    async function start() {
      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        if (cancelled || !video) return;

        const reader = new BrowserQRCodeReader(undefined, {
          delayBetweenScanAttempts: 80,
          delayBetweenScanSuccess: 1200,
          tryPlayVideoTimeout: 8000,
        });

        const next = await reader.decodeFromConstraints(
          { audio: false, video: { facingMode: { ideal: "environment" } } },
          video,
          (result) => {
            if (!result || cancelled || lockedRef.current) return;
            const text = readResultText(result);
            if (text) onDetectRef.current(text);
          },
        );

        if (cancelled) {
          next.stop();
          return;
        }

        controls = next;
        setStatus("live");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void start();
    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, []);

  return (
    <div className="max-w-xl space-y-3">
      <p className="text-sm text-muted-foreground">Aponte o QR do ingresso.</p>
      <div className="relative overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          className="aspect-4/3 w-full object-cover"
          muted
          playsInline
          autoPlay
        />
        {status === "starting" ? (
          <p className="absolute inset-0 flex items-center justify-center text-sm text-white/50">
            Abrindo câmera...
          </p>
        ) : null}
      </div>
      {status === "error" ? (
        <p className="text-sm text-muted-foreground">
          Não foi possível abrir a câmera. Cole o código abaixo.
        </p>
      ) : null}
    </div>
  );
}
