"use client";

import { useEffect, useRef, useState } from "react";
import {
  decodeQrFromVideo,
  GATE_VIDEO_CONSTRAINTS,
  stopStream,
} from "@/features/gate/gate-scan-runtime";

export function GateLiveScan({
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
    const node = videoRef.current;
    if (!node) return;
    const preview: HTMLVideoElement = node;

    let cancelled = false;
    let stream: MediaStream | null = null;
    let timer: number | undefined;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia(GATE_VIDEO_CONSTRAINTS);
        if (cancelled) {
          stopStream(stream);
          return;
        }
        preview.srcObject = stream;
        await preview.play();
        if (cancelled) return;
        setStatus("live");

        const tick = async () => {
          if (cancelled) return;
          if (
            !lockedRef.current &&
            preview.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
          ) {
            const text = await decodeQrFromVideo(preview);
            if (text && !cancelled) onDetectRef.current(text);
          }
          if (!cancelled) timer = window.setTimeout(() => void tick(), 180);
        };
        void tick();
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void start();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
      stopStream(stream);
      preview.srcObject = null;
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
