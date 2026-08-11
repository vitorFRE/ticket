"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRightIcon, SignOutIcon } from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function onLogout() {
    await logout();
    if (pathname !== "/") {
      router.push("/");
    }
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-6">
      <div
        className={cn(
          "pointer-events-auto mx-auto flex h-14 max-w-6xl items-center justify-between gap-4",
          "rounded-full border border-border/80 bg-background/80 px-3 pl-5 shadow-[0_2px_16px_rgba(0,0,0,0.35)] backdrop-blur-md",
        )}
      >
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          ticketim
        </Link>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="px-3 text-xs text-muted-foreground">...</span>
          ) : user ? (
            <>
              {user.role === "CLIENT" ? (
                <Link
                  href="/tickets"
                  className="px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Ingressos
                </Link>
              ) : null}
              {user.role === "ORGANIZER" ? (
                <Link
                  href="/organizer/events"
                  className="px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Área org
                </Link>
              ) : null}
              <span className="hidden max-w-[10rem] truncate px-2 text-xs text-muted-foreground sm:inline">
                {user.name ?? user.email}
              </span>
              <button
                type="button"
                onClick={() => void onLogout()}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs font-medium text-foreground transition-colors hover:bg-white/[0.06] active:scale-[0.98]"
              >
                <SignOutIcon size={14} weight="bold" />
                Sair
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-xs font-medium text-primary-foreground transition-[transform,opacity] hover:opacity-90 active:scale-[0.98]"
            >
              Entrar
              <span className="flex size-5 items-center justify-center rounded-full bg-white/15">
                <ArrowUpRightIcon size={12} weight="bold" />
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
