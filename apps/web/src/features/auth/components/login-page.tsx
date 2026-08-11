"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteBrand } from "@/components/site-brand";
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
    return (
      <div className='flex min-h-dvh items-center justify-center text-sm text-muted-foreground'>
        Carregando...
      </div>
    );
  }

  return (
    <div className='auth-surface grid min-h-dvh lg:grid-cols-2'>
      <AuthBrandPanel />

      <div className='relative flex flex-col bg-background'>
        <div className='pointer-events-none absolute inset-0 lg:hidden' aria-hidden>
          <AuthBackdrop subdued />
        </div>

        <header className='relative z-10 px-6 py-6 sm:px-10 lg:hidden'>
          <SiteBrand />
        </header>

        <main className='relative z-10 flex flex-1 items-center justify-center px-6 py-10 sm:px-10'>
          <div className='w-full max-w-88'>
            <LoginForm />
          </div>
        </main>

        <footer className='relative z-10 px-6 py-6 text-xs text-muted-foreground sm:px-10 lg:hidden'>
          <p>{year} ticketim</p>
        </footer>
      </div>
    </div>
  );
}
