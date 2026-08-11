"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SiteBrand } from "@/components/site-brand";
import { SiteHeaderAccount } from "@/components/site-header-account";
import { useAuth } from "@/features/auth/components/auth-provider";
import type { AuthUser } from "@/features/auth/types";

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
    <header className="sticky top-0 z-50 border-b border-white/8 bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6 lg:px-8">
        <SiteBrand />

        <div className="flex items-center gap-1">
          {area && !onArea ? (
            <Link
              href={area.href}
              className="hidden h-10 items-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-white/5 sm:inline-flex"
            >
              {area.label}
            </Link>
          ) : null}
          <SiteHeaderAccount
            user={user}
            isLoading={isLoading}
            area={area}
            onLogin={() => router.push("/login")}
            onLogout={() => void onLogout()}
          />
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
