export function AuthBackdrop({ subdued = false }: { subdued?: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background: subdued
            ? "radial-gradient(ellipse 80% 50% at 70% 20%, color-mix(in oklch, var(--primary) 10%, transparent), transparent 60%)"
            : "linear-gradient(to top, oklch(0.12 0 0 / 0.55), transparent 55%), radial-gradient(ellipse 70% 60% at 30% 80%, color-mix(in oklch, var(--primary) 12%, transparent), transparent 55%)",
        }}
      />
    </div>
  );
}
