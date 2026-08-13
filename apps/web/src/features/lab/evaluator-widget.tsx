"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  CheckIcon,
  FlaskIcon,
  SignOutIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/features/auth/components/auth-provider";
import {
  homeForRole,
  roleLabel,
  SEED_ACCOUNTS,
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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-70 flex justify-end p-4 md:p-6">
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        {open ? (
          <aside className="shadow-panel w-[min(calc(100vw-2rem),20.5rem)] overflow-hidden rounded-lg border border-border bg-background">
            <header className="flex items-start justify-between gap-3 px-4 pt-4">
              <div>
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  Lab avaliador
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Troque de usuário com um clique — sem digitar senha.
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggle(false)}
                className="flex size-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Fechar lab avaliador"
              >
                <XIcon size={16} weight="bold" />
              </button>
            </header>

            <div className="space-y-5 px-4 py-4">
              <section className="rounded-md bg-muted px-3 py-2.5">
                <p className="text-[11px] text-muted-foreground">Sessão atual</p>
                {isLoading ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">...</p>
                ) : user ? (
                  <div className="mt-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {user.name ?? user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {roleLabel(user.role)} · {user.email}
                    </p>
                  </div>
                ) : (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Ninguém logado — escolha uma conta abaixo
                  </p>
                )}
              </section>

              <section>
                <p className="mb-2 text-xs text-muted-foreground">
                  Contas seed — clique para entrar
                </p>
                <ul className="space-y-1.5">
                  {SEED_ACCOUNTS.map((account) => {
                    const active = user?.email === account.email;
                    const loading = busyId === account.id;
                    return (
                      <li key={account.id}>
                        <button
                          type="button"
                          disabled={busyId !== null}
                          onClick={() => void switchTo(account)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors",
                            "disabled:opacity-50",
                            active
                              ? "border-primary/40 bg-primary/8"
                              : "border-border bg-background hover:bg-muted",
                          )}
                        >
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-sm border",
                              active
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border",
                            )}
                            aria-hidden
                          >
                            {active ? (
                              <CheckIcon size={12} weight="bold" />
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center justify-between gap-2">
                              <span className="block text-sm font-medium text-foreground">
                                {account.name}
                              </span>
                              <span className="shrink-0 text-[11px] text-muted-foreground">
                                {loading ? "Entrando..." : roleLabel(account.role)}
                              </span>
                            </span>
                            <span className="mt-0.5 block text-[11px] text-muted-foreground">
                              {active
                                ? "Conta ativa — clique para ir à home do papel"
                                : account.hint}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {error ? <p className="text-xs text-destructive">{error}</p> : null}

              {user ? (
                <button
                  type="button"
                  disabled={busyId !== null}
                  onClick={() => void onLogout()}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                >
                  <SignOutIcon size={13} weight="bold" />
                  Encerrar sessão
                </button>
              ) : null}

              <section>
                <p className="mb-2 text-xs text-muted-foreground">Atalhos</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <LabLink href="/">Início</LabLink>
                  <LabLink href="/tickets">Ingressos</LabLink>
                  <LabLink href="/organizer/events">Área org</LabLink>
                  <LabLink href="/gate">Portaria</LabLink>
                </div>
              </section>

              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                senha {SEED_PASSWORD}
                <br />
                api {getApiBaseUrl()}
              </p>
            </div>
          </aside>
        ) : null}

        <button
          type="button"
          onClick={() => toggle(!open)}
          className={cn(
            "shadow-panel inline-flex h-12 min-w-44 items-center justify-center gap-2.5 rounded-lg border border-border bg-background px-5",
            "text-sm font-medium tracking-tight text-foreground",
            "transition-[transform,opacity] hover:opacity-80 active:scale-[0.98]",
          )}
          aria-expanded={open}
          aria-label={open ? "Fechar lab avaliador" : "Abrir lab avaliador"}
        >
          <FlaskIcon size={18} weight="bold" />
          Lab avaliador
        </button>
      </div>
    </div>
  );
}

function LabLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
    </Link>
  );
}
