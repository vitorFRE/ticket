"use client";

export function SimulatedCardForm({ holderName }: { holderName: string }) {
  return (
    <fieldset
      disabled
      className="pointer-events-none select-none border-t border-border pt-6"
      aria-label="Cartão de simulação"
    >
      <p className="text-[13px] text-muted-foreground">Cartão de teste. Nada é cobrado.</p>

      <div className="mt-5 space-y-5">
        <FakeField label="Nome no cartão" value={holderName} />
        <FakeField label="Número" value="4242 4242 4242 4242" mono />
        <div className="grid grid-cols-2 gap-6">
          <FakeField label="Validade" value="12 / 28" mono />
          <FakeField label="CVC" value="•••" mono />
        </div>
      </div>
    </fieldset>
  );
}

function FakeField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <input
        readOnly
        tabIndex={-1}
        value={value}
        className={`mt-1.5 w-full border-0 border-b border-border bg-transparent px-0 py-2 text-sm text-foreground/90 outline-none ${mono ? "font-mono tabular-nums tracking-wide" : ""}`}
      />
    </label>
  );
}
