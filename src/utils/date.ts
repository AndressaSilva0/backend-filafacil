/**
 * Processa datas com segurança em formato brasileiro (DD/MM/AAAA), ISO (AAAA-MM-DD),
 * objetos Date ou palavras-chave como 'hoje'.
 * Retorna null se a data for inválida ou vazia, evitando exceções no Prisma.
 */
export function parseFlexibleDate(val?: any): Date | null {
  if (!val) return null;

  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }

  if (typeof val === "string") {
    const trimmed = val.trim();
    const lower = trimmed.toLowerCase();

    if (!trimmed || lower === "undefined" || lower === "null" || lower === "invalid date") {
      return null;
    }

    if (lower === "hoje" || lower === "today") {
      return new Date();
    }

    // Formato brasileiro: DD/MM/AAAA ou DD-MM-AAAA
    const brMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (brMatch) {
      const day = Number(brMatch[1]);
      const month = Number(brMatch[2]) - 1;
      const year = Number(brMatch[3]);
      const d = new Date(Date.UTC(year, month, day));
      return isNaN(d.getTime()) ? null : d;
    }

    // Formato ISO: AAAA-MM-DD
    const isoMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (isoMatch) {
      const year = Number(isoMatch[1]);
      const month = Number(isoMatch[2]) - 1;
      const day = Number(isoMatch[3]);
      const d = new Date(Date.UTC(year, month, day));
      return isNaN(d.getTime()) ? null : d;
    }

    // Outros formatos com timestamp ou timezone
    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}
