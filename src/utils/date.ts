/**
 * Processa datas em formato brasileiro DD/MM/AAAA, ISO AAAA-MM-DD ou palavras-chave como 'hoje'
 */
export function parseFlexibleDate(str?: string): Date | null {
  if (!str) return null;
  const trimmed = str.trim().toLowerCase();

  if (trimmed === "hoje" || trimmed === "today") {
    return new Date();
  }

  // Formato brasileiro: DD/MM/AAAA
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split("/");
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return isNaN(d.getTime()) ? null : d;
  }

  // Formato ISO ou padrão: AAAA-MM-DD
  const parsed = new Date(str.trim());
  return isNaN(parsed.getTime()) ? null : parsed;
}

