"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CaretDownIcon, FlaskIcon, SignOutIcon, XIcon } from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/components/auth-provider";
import {
  homeForRole,
  roleLabel,
  SEED_ACCOUNTS,
  SEED_EVENT_LINKS,
  SEED_PASSWORD,
  type SeedAccount,
} from "@/features/lab/seed-accounts";
import { getApiBaseUrl } from "@/shared/config/api-base";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "ticketim.lab.open";

export function EvaluatorWidget() {
  const { user, login, logout, isLoading } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setOpen(sessionStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function toggle(next: boolean) {
    setOpen(next);
    sessionStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  }

  async function switchTo(account: SeedAccount) {
    if (busyId) return;
    setError(null);
    if (user?.email === account.email) {
      router.push(homeForRole(account.role));
      return;
    }
    setBusyId(account.id);
    try {
      const next = await login(account.email, SEED_PASSWORD);
      router.push(homeForRole(next.role));
      router.refresh();
    } catch {
      setError("Login falhou. A API está no ar?");
    } finally {
      setBusyId(null);
    }
  }

  async function onLogout() {
    if (busyId) return;
    setError(null);
    setBusyId("out");
    try {
      await logout();
      router.push("/");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className='pointer-events-none fixed inset-x-0 bottom-0 z-70 flex justify-end p-4 md:p-6'>
      <div className='pointer-events-auto flex flex-col items-end gap-3'>
        {open ? (
          <aside
            className={cn(
              "w-[min(calc(100vw-2rem),20.5rem)] overflow-hidden rounded-lg",
              "border border-white/10 bg-background/92 shadow-[0_16px_48px_rgba(0,0,0,0.45)] backdrop-blur-md"
            )}
          >
            <header className='flex items-start justify-between gap-3 border-b border-white/6 px-4 py-3'>
              <div>
                <p className='text-[10px] font-medium uppercase tracking-[0.18em] text-primary'>
                  Lab avaliador
                </p>
                <p className='mt-0.5 text-sm font-medium text-foreground'>Contas seed</p>
              </div>
              <button
                type='button'
                onClick={() => toggle(false)}
                className='flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/6 hover:text-foreground'
                aria-label='Fechar lab avaliador'
              >
                <XIcon size={16} weight='bold' />
              </button>
            </header>

            <div className='space-y-4 px-4 py-3.5'>
              <section>
                <p className='text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground'>
                  Sessão
                </p>
                {isLoading ? (
                  <p className='mt-1 text-sm text-muted-foreground'>...</p>
                ) : user ? (
                  <div className='mt-1'>
                    <p className='text-sm font-medium text-foreground'>
                      {user.name ?? user.email}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {roleLabel(user.role)} · {user.email}
                    </p>
                  </div>
                ) : (
                  <p className='mt-1 text-sm text-muted-foreground'>Sem sessão</p>
                )}
              </section>

              <ul className='space-y-1'>
                {SEED_ACCOUNTS.map((account) => {
                  const active = user?.email === account.email;
                  return (
                    <li key={account.id}>
                      <button
                        type='button'
                        disabled={busyId !== null}
                        onClick={() => void switchTo(account)}
                        className={cn(
                          "flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                          "disabled:opacity-50",
                          active ? "bg-primary/12 text-foreground" : "hover:bg-white/5"
                        )}
                      >
                        <span>
                          <span className='block text-sm font-medium'>
                            {account.name}
                          </span>
                          <span className='block text-[11px] text-muted-foreground'>
                            {account.hint}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-[10px] font-medium uppercase tracking-wider",
                            active ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {busyId === account.id ? "..." : roleLabel(account.role)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {error ? <p className='text-xs text-destructive'>{error}</p> : null}

              {user ? (
                <button
                  type='button'
                  disabled={busyId !== null}
                  onClick={() => void onLogout()}
                  className='inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50'
                >
                  <SignOutIcon size={13} weight='bold' />
                  Encerrar sessão
                </button>
              ) : null}

              <section className='border-t border-white/6 pt-3'>
                <p className='text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground'>
                  Atalhos
                </p>
                <div className='mt-2 flex flex-wrap gap-1.5'>
                  <LabChip href='/'>Início</LabChip>
                  <LabChip href='/tickets'>Ingressos</LabChip>
                  <LabChip href='/organizer/events'>Área org</LabChip>
                  <LabChip href='/gate'>Portaria</LabChip>
                  {SEED_EVENT_LINKS.map((link) => (
                    <LabChip key={link.href} href={link.href} hint={link.hint}>
                      {link.label}
                    </LabChip>
                  ))}
                </div>
              </section>

              <p className='border-t border-white/6 pt-3 font-mono text-[11px] leading-relaxed text-muted-foreground'>
                senha {SEED_PASSWORD}
                <br />
                api {getApiBaseUrl()}
              </p>
            </div>
          </aside>
        ) : null}

        <button
          type='button'
          onClick={() => toggle(!open)}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-full border border-white/12 bg-background/90 px-3.5",
            "text-sm font-medium text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md",
            "transition-[transform,background-color] hover:bg-white/6 active:scale-[0.98]"
          )}
          aria-expanded={open}
          aria-label={open ? "Fechar lab avaliador" : "Abrir lab avaliador"}
        >
          <FlaskIcon size={16} weight='bold' className='text-primary' />
          Lab avaliador
          <CaretDownIcon
            size={12}
            weight='bold'
            className={cn(
              "text-muted-foreground transition-transform",
              open ? "rotate-0" : "rotate-180"
            )}
          />
        </button>
      </div>
    </div>
  );
}

function LabChip({
  href,
  hint,
  children,
}: {
  href: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      title={hint}
      className='rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground'
    >
      {children}
    </Link>
  );
}
