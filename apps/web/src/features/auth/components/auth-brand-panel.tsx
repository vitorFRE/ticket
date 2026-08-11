import Image from "next/image";
import Link from "next/link";
import { AuthBackdrop } from "@/features/auth/components/auth-backdrop";

export function AuthBrandPanel() {
  const year = new Date().getFullYear();

  return (
    <aside className="auth-brand-panel relative hidden overflow-hidden border-r border-border/60 lg:flex lg:flex-col lg:justify-between lg:p-14">
      <Image
        src="/images/login-brand-venue.png"
        alt=""
        fill
        priority
        sizes="50vw"
        className="object-cover object-center"
      />
      <AuthBackdrop />
      <div className="relative z-10">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          ticketim
        </Link>
      </div>

      <div className="relative z-10 max-w-md space-y-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
          Eventos e ingressos
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance xl:text-[2.75rem] xl:leading-[1.1]">
          Reserve assentos e valide na porta no mesmo fluxo.
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-white/75">
          Entre para acompanhar reservas, ingressos e a portaria do seu evento.
        </p>
      </div>

      <p className="relative z-10 text-xs text-white/55">{year} ticketim</p>
    </aside>
  );
}
