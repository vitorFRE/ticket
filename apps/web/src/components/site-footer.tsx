export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-auto">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 pb-24 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-6 md:px-6 md:pb-8 lg:px-8">
        <p className="flex flex-wrap items-center gap-x-2">
          <span>© {year} ticketim</span>
          <span aria-hidden className="text-foreground/20">
            ·
          </span>
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            TMDb
          </a>
          <span aria-hidden className="text-foreground/20">
            ·
          </span>
          <a
            href="https://developer.ticketmaster.com"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Ticketmaster
          </a>
        </p>
        <p className="sm:text-right">Sem endosso da TMDb nem da Ticketmaster.</p>
      </div>
    </footer>
  );
}
