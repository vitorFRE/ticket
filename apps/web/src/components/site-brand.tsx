import Link from "next/link";
import { cn } from "@/lib/utils";

export function SiteBrand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex flex-col leading-none transition-opacity hover:opacity-70",
        className,
      )}
    >
      <span className="text-[15px] font-semibold tracking-tight text-foreground">
        ticketim
      </span>
      <span className="mt-0.5 text-[10px] tracking-wide text-muted-foreground">
        elitedev
      </span>
    </Link>
  );
}
