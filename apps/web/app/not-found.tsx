import { MissingPage } from "@/components/missing-page";
import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <MissingPage
        title="Página não encontrada"
        body="Esse endereço não leva a nenhum evento ou área do ticketim."
        imageSrc="/images/page-missing.jpg"
      />
    </>
  );
}
