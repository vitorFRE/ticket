import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { getPublicTicket } from "@/features/tickets/api/tickets-api";
import { PublicTicketView } from "@/features/tickets/components/public-ticket-view";
import { HttpError } from "@/shared/api/http-error";

export default async function PublicTicketRoute({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  try {
    const ticket = await getPublicTicket(token);
    return <PublicTicketView ticket={ticket} />;
  } catch (err) {
    const missing = err instanceof HttpError && err.status === 404;
    return (
      <div className="relative z-10 flex-1">
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-20 md:px-6 lg:px-8 lg:pt-10">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon size={16} weight="bold" />
            Eventos
          </Link>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">
            {missing ? "Link não encontrado" : "Não foi possível carregar"}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            {missing
              ? "Esse convite não existe ou já não está disponível."
              : "Tente de novo em instantes."}
          </p>
        </div>
      </div>
    );
  }
}
