"use client";

import { ArrowRightIcon } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/components/auth-provider";
import { safeNextPath } from "@/features/auth/lib/safe-next-path";
import { loginSchema } from "@/features/auth/schemas/login-schema";

const reveal = {
  hidden: { opacity: 0, y: 12 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
};

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const next: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "email" || key === "password") {
          next[key] = issue.message;
        }
      }
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    setIsPending(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      router.replace(nextPath);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Erro ao entrar. Tente novamente.",
      );
    } finally {
      setIsPending(false);
    }
  }

  const MotionDiv = reduce ? "div" : motion.div;

  return (
    <div className="w-full space-y-7">
      <MotionDiv
        className="space-y-2"
        {...(reduce
          ? {}
          : {
              initial: "hidden",
              animate: "visible",
              custom: 0,
              variants: reveal,
            })}
      >
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-[1.75rem]">
          Bem-vindo de volta
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground lg:hidden">
          Entre com e-mail e senha para ver eventos e ingressos.
        </p>
      </MotionDiv>

      <MotionDiv
        {...(reduce
          ? {}
          : {
              initial: "hidden",
              animate: "visible",
              custom: 0.08,
              variants: reveal,
            })}
      >
        <form className="space-y-5" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email ? (
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password ? (
              <p className="text-xs text-destructive">{fieldErrors.password}</p>
            ) : null}
          </div>

          {submitError ? (
            <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {submitError}
            </div>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={isPending}>
            {isPending ? "Entrando..." : "Entrar"}
            {!isPending ? <ArrowRightIcon size={16} weight="bold" /> : null}
          </Button>
        </form>
      </MotionDiv>
    </div>
  );
}
