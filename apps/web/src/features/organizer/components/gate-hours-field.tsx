"use client";

export function GateHoursField({
  unlimited,
  hours,
  onUnlimited,
  onHours,
}: {
  unlimited: boolean;
  hours: string;
  onUnlimited: (value: boolean) => void;
  onHours: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={unlimited}
          onChange={(e) => onUnlimited(e.target.checked)}
          className="size-4 accent-primary"
        />
        <span className="text-[13px] text-muted-foreground">Sem limite de horário</span>
      </label>
      {unlimited ? null : (
        <label className="block">
          <span className="text-[13px] text-muted-foreground">
            Portaria abre (horas antes)
          </span>
          <input
            type="number"
            min={0}
            max={48}
            value={hours}
            onChange={(e) => onHours(e.target.value)}
            className={fieldClass}
          />
          <span className="mt-1.5 block text-xs text-foreground/35">
            Ex.: 2 = libera 2 horas antes do início
          </span>
        </label>
      )}
    </div>
  );
}

const fieldClass =
  "mt-1.5 w-full border-0 border-b border-border bg-transparent px-0 py-2 text-sm outline-none";
