import { cn } from "@/lib/utils";

export function PagePulse({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-48 animate-pulse rounded-lg bg-white/[0.04]", className)}
    />
  );
}
