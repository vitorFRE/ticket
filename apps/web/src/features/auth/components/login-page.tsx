"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteBrand } from "@/components/site-brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthBackdrop } from "@/features/auth/components/auth-backdrop";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { useAuth } from "@/features/auth/components/auth-provider";
import { LoginForm } from "@/features/auth/components/login-form";
import { homeForRole } from "@/features/auth/lib/home-for-role";
import { safeNextPath } from "@/features/auth/lib/safe-next-path";

export function LoginPage() {
  const year = new Date().getFullYear();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");

  useEffect(() => {
    if (isLoading || !user) return;
    router.replace(rawNext ? safeNextPath(rawNext) : homeForRole(user.role));
  }, [isLoading, user, router, rawNext]);

  if (isLoading || user) {
    return <LoginPageShell year={year} />;
  }

  return (
    <div className="auth-surface grid min-h-dvh lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="relative flex flex-col bg-background">
        <div className="pointer-events-none absolute inset-0 lg:hidden" aria-hidden>
          <AuthBackdrop subdued />
        </div>

        <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
          <div className="lg:hidden">
            <SiteBrand />
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-88">
            <LoginForm />
          </div>
        </main>

        <footer className="relative z-10 px-6 py-6 text-xs text-muted-foreground sm:px-10 lg:hidden">
          <p>{year} ticketim</p>
        </footer>
      </div>
    </div>
  );
}

/** Keep the login chrome while auth resolves — no literal “Carregando…”. */
function LoginPageShell({ year }: { year: number }) {
  return (
    <div className="auth-surface grid min-h-dvh lg:grid-cols-2" aria-busy="true">
      <div className="auth-brand-panel relative hidden overflow-hidden border-r border-border/60 bg-muted lg:block" />
      <div className="relative flex flex-col bg-background">
        <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
          <div className="lg:hidden">
            <SiteBrand />
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-88 space-y-5" aria-hidden>
            <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
            <div className="mt-8 h-11 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-11 w-full animate-pulse rounded-md bg-muted" />
            <div className="h-11 w-full animate-pulse rounded-md bg-primary/30" />
          </div>
        </main>
        <footer className="relative z-10 px-6 py-6 text-xs text-muted-foreground sm:px-10 lg:hidden">
          <p>{year} ticketim</p>
        </footer>
      </div>
    </div>
  );
}
