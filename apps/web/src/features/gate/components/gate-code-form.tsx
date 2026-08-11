"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GateLiveScan } from "@/features/gate/components/gate-live-scan";

export function GateCodeForm({
  code,
  onCodeChange,
  onSubmit,
  busy,
}: {
  code: string;
  onCodeChange: (value: string) => void;
  onSubmit: (value: string) => void;
  busy: boolean;
}) {
  const [pasteOpen, setPasteOpen] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(code);
  }

  return (
    <div className="space-y-8">
      <GateLiveScan onDetect={onSubmit} locked={busy} />

      {pasteOpen ? (
        <form className="max-w-xl space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="gate-code">Código</Label>
            <Input
              id="gate-code"
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              autoComplete="off"
              placeholder="Cole o payload ou o código"
              className="h-14 font-mono text-base"
            />
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" size="lg" disabled={busy || !code.trim()}>
              {busy ? "Validando..." : "Validar"}
            </Button>
            <button
              type="button"
              onClick={() => setPasteOpen(false)}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Fechar
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setPasteOpen(true)}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Colar código
        </button>
      )}
    </div>
  );
}
