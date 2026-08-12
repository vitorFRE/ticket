import { SiteBrand } from "@/components/site-brand";
import { ThemeToggle } from "@/components/theme-toggle";

/** Suspense / auth shell for `/login` — no literal “Carregando…”. */
export function LoginSuspenseFallback() {
  const year = new Date().getFullYear();

  return (
    <div
      className="auth-surface grid min-h-dvh lg:grid-cols-2"
      aria-busy="true"
    >
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
