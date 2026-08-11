"use client";

import { ListIcon, SignOutIcon, UserIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { AuthUser } from "@/features/auth/types";
import { cn } from "@/lib/utils";

type AreaLink = { href: string; label: string };

type SiteHeaderAccountProps = {
  user: AuthUser | null;
  isLoading: boolean;
  area: AreaLink | null;
  onLogin: () => void;
  onLogout: () => void;
};

export function SiteHeaderAccount({
  user,
  isLoading,
  area,
  onLogin,
  onLogout,
}: SiteHeaderAccountProps) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (isLoading) {
    return (
      <div
        aria-hidden
        className="h-10 w-18 animate-pulse rounded-md border border-white/8 bg-white/4"
      />
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={open ? "Fechar menu da conta" : "Abrir menu da conta"}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-md border border-white/12 bg-transparent px-2 text-foreground",
          "transition-colors hover:bg-white/5 active:scale-[0.98]",
          open && "bg-white/5",
        )}
      >
        <ListIcon size={16} weight="bold" />
        <span className="flex size-7 items-center justify-center rounded-md bg-white/10 text-[11px] font-medium">
          {user ? avatarGlyph(user) : <UserIcon size={14} weight="bold" />}
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-56 overflow-hidden rounded-md border border-white/10 bg-card py-1 shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
        >
          {user ? (
            <>
              {area ? (
                <Link
                  href={area.href}
                  role="menuitem"
                  className="block px-4 py-3 text-sm text-foreground transition-colors hover:bg-white/5"
                  onClick={() => setOpen(false)}
                >
                  {area.label}
                </Link>
              ) : null}
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-2 border-t border-white/8 px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-white/5"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
              >
                <SignOutIcon size={14} weight="bold" />
                Sair
              </button>
            </>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="block w-full px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-white/5"
              onClick={() => {
                setOpen(false);
                onLogin();
              }}
            >
              Entrar
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

function avatarGlyph(user: AuthUser) {
  const source = user.name?.trim() || user.email;
  return source.charAt(0).toUpperCase();
}
