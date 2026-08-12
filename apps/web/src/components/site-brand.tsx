import Link from "next/link";
import { cn } from "@/lib/utils";

type SiteBrandProps = {
  className?: string;
  /** White text for photo overlays (login brand panel). */
  tone?: "default" | "onMedia";
};

export function SiteBrand({ className, tone = "default" }: SiteBrandProps) {
  const onMedia = tone === "onMedia";

  return (
    <Link
      href="/"
      className={cn(
        "flex flex-col leading-none transition-opacity hover:opacity-80",
        className,
      )}
    >
      <span
        className={cn(
          "text-[15px] font-semibold tracking-tight",
          onMedia ? "text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]" : "text-foreground",
        )}
      >
        ticketim
      </span>
      <span
        className={cn(
          "mt-0.5 text-[10px] tracking-wide",
          onMedia
            ? "text-white/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]"
            : "text-muted-foreground",
        )}
      >
        elitedev
      </span>
    </Link>
  );
}
