"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthBackdrop } from "@/features/auth/components/auth-backdrop";
import { AuthBrandPanel } from "@/features/auth/components/auth-brand-panel";
import { useAuth } from "@/features/auth/components/auth-provider";
import { LoginForm } from "@/features/auth/components/login-form";
import { safeNextPath } from "@/features/auth/lib/safe-next-path";

export function LoginPage() {
  const year = new Date().getFullYear();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(nextPath);
    }
  }, [isLoading, user, router, nextPath]);

  if (isLoading || user) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <div className="auth-surface grid min-h-[100dvh] lg:grid-cols-2">
      <AuthBrandPanel />

      <div className="relative flex flex-col bg-background">
        <div className="pointer-events-none absolute inset-0 lg:hidden" aria-hidden>
          <AuthBackdrop subdued />
        </div>

        <header className="relative z-10 px-6 py-6 sm:px-10 lg:hidden">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            ticketim
          </Link>
        </header>

        <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[22rem]">
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
