export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("pt-BR");
}
