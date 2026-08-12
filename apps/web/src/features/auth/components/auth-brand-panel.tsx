"use client";

import Image from "next/image";
import { SiteBrand } from "@/components/site-brand";
import { useThemeImage } from "@/hooks/use-theme-image";

export function AuthBrandPanel() {
  const year = new Date().getFullYear();
  const imageSrc = useThemeImage(
    "/images/login-brand-venue-light.png",
    "/images/login-brand-venue-dark.png",
  );

  return (
    <aside className="auth-brand-panel relative hidden overflow-hidden border-r border-border/60 lg:flex lg:flex-col lg:justify-between lg:p-14">
      <Image
        src={imageSrc}
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-cover object-center"
      />
      {/* Scrim: keeps brand + copy readable on light and dark photos */}
      <div
        className="pointer-events-none absolute inset-0 z-1"
        aria-hidden
        style={{
          background: `
            linear-gradient(
              to bottom,
              color-mix(in oklch, var(--auth-brand-scrim) 78%, transparent) 0%,
              color-mix(in oklch, var(--auth-brand-scrim) 28%, transparent) 28%,
              transparent 48%
            ),
            linear-gradient(
              to top,
              color-mix(in oklch, var(--auth-brand-scrim) 88%, transparent) 0%,
              color-mix(in oklch, var(--auth-brand-scrim) 55%, transparent) 38%,
              color-mix(in oklch, var(--auth-brand-scrim) 18%, transparent) 62%,
              transparent 78%
            ),
            radial-gradient(
              ellipse 70% 50% at 20% 75%,
              color-mix(in oklch, var(--primary) 22%, transparent),
              transparent 60%
            )
          `,
        }}
      />

      <div className="relative z-10">
        <SiteBrand tone="onMedia" />
      </div>

      <div className="relative z-10 max-w-md space-y-5">
        <p className="inline-flex rounded-md bg-primary/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground shadow-sm">
          Eventos e ingressos
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] xl:text-[2.75rem] xl:leading-[1.1]">
          Reserve assentos e valide na porta no mesmo fluxo.
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
          Entre para acompanhar reservas, ingressos e a portaria do seu evento.
        </p>
      </div>

      <p className="relative z-10 text-xs text-white/70">{year} ticketim</p>
    </aside>
  );
}
