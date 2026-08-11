"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRightIcon, SignOutIcon } from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/components/auth-provider";
import type { AuthUser } from "@/features/auth/types";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const area = user ? areaForRole(user.role) : null;
  const onArea = area ? isOnArea(pathname, area.href) : false;

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
          "pointer-events-auto mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 sm:gap-4",
          "rounded-full border border-border/80 bg-background/80 px-3 pl-5 shadow-[0_2px_16px_rgba(0,0,0,0.35)] backdrop-blur-md",
        )}
      >
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          ticketim
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {isLoading ? (
            <span className="px-3 text-xs text-muted-foreground">...</span>
          ) : user ? (
            <>
              {area && !onArea ? (
                <Link
                  href={area.href}
                  className="inline-flex h-8 items-center rounded-full border border-white/12 bg-white/[0.05] px-3 text-xs font-medium text-foreground transition-colors hover:bg-white/[0.1] active:scale-[0.98]"
                >
                  {area.label}
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => void onLogout()}
                aria-label="Sair"
                className="inline-flex size-9 items-center justify-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-medium text-foreground transition-colors hover:bg-white/[0.06] active:scale-[0.98] sm:h-9 sm:w-auto sm:px-3"
              >
                <SignOutIcon size={14} weight="bold" />
                <span className="hidden sm:inline">Sair</span>
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

function areaForRole(role: AuthUser["role"]): { href: string; label: string } {
  if (role === "CLIENT") return { href: "/tickets", label: "Ingressos" };
  if (role === "ORGANIZER") return { href: "/organizer/events", label: "Área org" };
  return { href: "/gate", label: "Portaria" };
}

function isOnArea(pathname: string, href: string) {
  if (href === "/tickets") {
    return pathname === "/tickets" || pathname.startsWith("/tickets/");
  }
  if (href.startsWith("/organizer")) {
    return pathname.startsWith("/organizer");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
