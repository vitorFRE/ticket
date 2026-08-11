export const glassOuter =
  "@container rounded-[2rem] bg-white/[0.04] p-1.5 ring-1 ring-white/10 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)] hover:-translate-y-0.5";

export const glassOuterCompact =
  "@container rounded-2xl bg-white/[0.04] p-1 ring-1 ring-white/10 transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5";

export const glassInner =
  "rounded-[calc(2rem-0.375rem)] bg-card/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]";

export const glassInnerFlush = `${glassInner} overflow-hidden p-0`;

export const glassInnerCompact =
  "rounded-[calc(1rem-0.25rem)] bg-card/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]";

export const glassInnerFlushCompact = `${glassInnerCompact} overflow-hidden p-0`;

export const glassSubtle =
  "rounded-xl border border-white/[0.08] bg-white/[0.03]";
