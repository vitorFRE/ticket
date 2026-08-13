export const glassOuter =
  "@container rounded-lg bg-card/60 p-1.5 ring-1 ring-border transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-panel";

export const glassOuterCompact =
  "@container rounded-lg bg-card/60 p-1 ring-1 ring-border transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5";

export const glassInner = "rounded-[inherit] bg-card/80";

export const glassInnerFlush = `${glassInner} overflow-hidden p-0`;

export const glassInnerCompact = glassInner;

export const glassInnerFlushCompact = `${glassInnerCompact} overflow-hidden p-0`;

export const glassSubtle = "rounded-lg border border-border bg-card/50";
