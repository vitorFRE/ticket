export function eventStatusLabel(status: string) {
  if (status === "PUBLISHED") return "Publicado";
  if (status === "DRAFT") return "Rascunho";
  return status;
}
