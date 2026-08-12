"use client";

import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import type { SectorDraft } from "@/features/organizer/wizard-state";

export function WizardInventoryStep({
  mode,
  rows,
  seatsPerRow,
  sectors,
  onMode,
  onRows,
  onSeatsPerRow,
  onSectors,
  onBack,
  onNext,
}: {
  mode: "SEAT_MAP" | "GA_SECTOR";
  rows: string;
  seatsPerRow: string;
  sectors: SectorDraft[];
  onMode: (mode: "SEAT_MAP" | "GA_SECTOR") => void;
  onRows: (value: string) => void;
  onSeatsPerRow: (value: string) => void;
  onSectors: (sectors: SectorDraft[]) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const sectorsOk =
    mode === "SEAT_MAP" ||
    sectors.some((s) => s.name.trim() && Number(s.capacity) > 0);

  function updateSector(index: number, patch: Partial<SectorDraft>) {
    onSectors(
      sectors.map((sector, i) => (i === index ? { ...sector, ...patch } : sector)),
    );
  }

  return (
    <div className="max-w-xl space-y-8">
      <div className="flex gap-4 text-sm">
        <button
          type="button"
          onClick={() => onMode("SEAT_MAP")}
          className={mode === "SEAT_MAP" ? "text-foreground underline underline-offset-4" : "text-muted-foreground"}
        >
          Mapa de assentos
        </button>
        <button
          type="button"
          onClick={() => onMode("GA_SECTOR")}
          className={mode === "GA_SECTOR" ? "text-foreground underline underline-offset-4" : "text-muted-foreground"}
        >
          Setores
        </button>
      </div>

      {mode === "SEAT_MAP" ? (
        <div className="space-y-5">
          <label className="block">
            <span className="text-[13px] text-muted-foreground">Fileiras</span>
            <input
              value={rows}
              onChange={(e) => onRows(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block">
            <span className="text-[13px] text-muted-foreground">Lugares por fileira</span>
            <input
              value={seatsPerRow}
              onChange={(e) => onSeatsPerRow(e.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          {sectors.map((sector, index) => (
            <div key={index} className="space-y-3 border-b border-border pb-5">
              <label className="block">
                <span className="text-[13px] text-muted-foreground">Nome</span>
                <input
                  value={sector.name}
                  onChange={(e) => updateSector(index, { name: e.target.value })}
                  className={fieldClass}
                />
              </label>
              <div className="grid grid-cols-2 gap-6">
                <label className="block">
                  <span className="text-[13px] text-muted-foreground">Capacidade</span>
                  <input
                    value={sector.capacity}
                    onChange={(e) =>
                      updateSector(index, { capacity: e.target.value })
                    }
                    className={fieldClass}
                  />
                </label>
                <label className="block">
                  <span className="text-[13px] text-muted-foreground">Preço (opcional)</span>
                  <input
                    value={sector.price}
                    onChange={(e) => updateSector(index, { price: e.target.value })}
                    className={fieldClass}
                  />
                </label>
              </div>
            </div>
          ))}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() =>
                onSectors([...sectors, { name: "", capacity: "", price: "" }])
              }
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <PlusIcon size={14} weight="bold" />
              Setor
            </button>
            {sectors.length > 1 ? (
              <button
                type="button"
                onClick={() => onSectors(sectors.slice(0, -1))}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <MinusIcon size={14} weight="bold" />
                Remover último
              </button>
            ) : null}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={!sectorsOk}
          onClick={onNext}
          className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-40"
        >
          Continuar
        </button>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-foreground/50 underline-offset-4 hover:text-foreground hover:underline"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

const fieldClass =
  "mt-1.5 w-full border-0 border-b border-border bg-transparent px-0 py-2 text-sm outline-none";
