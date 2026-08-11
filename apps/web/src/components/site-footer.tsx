import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-white/8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pt-10 pb-24 md:px-6 md:pb-12 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-3">
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-foreground"
            >
              ticketim
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Filmes via TMDb. Shows via Ticketmaster Discovery.
            </p>
            <p className="text-xs leading-relaxed text-white/40">
              Este produto usa a API do TMDb, sem endosso ou certificação da TMDb.
              Também usa a Ticketmaster Discovery API, sem afiliação ou certificação
              da Ticketmaster.
            </p>
          </div>

          <ul className="flex flex-col gap-2 text-sm text-muted-foreground md:items-end">
            <li>
              <a
                href="https://www.themoviedb.org"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                TMDb
              </a>
            </li>
            <li>
              <a
                href="https://developer.ticketmaster.com"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Ticketmaster Discovery
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
