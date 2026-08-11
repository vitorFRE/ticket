"use client";

import { CameraIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { GateLiveScan } from "@/features/gate/components/gate-live-scan";
import { decodeQrFromFile, isPhoneDevice } from "@/features/gate/gate-scan-runtime";

export function GateCameraScan({
  onDetect,
  locked,
}: {
  onDetect: (value: string) => void;
  locked: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phone, setPhone] = useState<boolean | null>(null);
  const [reading, setReading] = useState(false);
  const [fail, setFail] = useState(false);

  useEffect(() => {
    setPhone(isPhoneDevice());
  }, []);

  async function onPick(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || locked) return;
    setReading(true);
    setFail(false);
    try {
      const text = await decodeQrFromFile(file);
      if (text) onDetect(text);
      else setFail(true);
    } catch {
      setFail(true);
    } finally {
      setReading(false);
    }
  }

  if (phone === null) return null;

  if (!phone) {
    return <GateLiveScan onDetect={onDetect} locked={locked} />;
  }

  return (
    <div className="max-w-xl space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => void onPick(e)}
      />
      <Button
        type="button"
        size="lg"
        disabled={locked || reading}
        onClick={() => inputRef.current?.click()}
      >
        <CameraIcon size={18} weight="bold" />
        {reading ? "Lendo..." : "Escanear"}
      </Button>
      {fail ? (
        <p className="text-sm text-muted-foreground">
          Não deu para ler. Tenta de novo ou cola o código.
        </p>
      ) : null}
    </div>
  );
}
