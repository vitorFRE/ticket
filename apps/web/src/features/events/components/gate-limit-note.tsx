import { ClockIcon } from "@phosphor-icons/react/dist/ssr";
import { gateLimitNotice } from "@/features/events/gate-window";
import { cn } from "@/lib/utils";

export function GateLimitNote({
  hoursBefore,
  className,
}: {
  hoursBefore: number | null | undefined;
  className?: string;
}) {
  const text = hoursBefore === undefined ? null : gateLimitNotice(hoursBefore);
  if (!text) return null;

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-sm tracking-[-0.01em] text-foreground/50",
        className,
      )}
    >
      <ClockIcon size={14} weight="bold" aria-hidden />
      {text}
    </p>
  );
}
