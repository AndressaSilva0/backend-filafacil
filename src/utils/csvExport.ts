/**
 * Exporta array de objetos para formato CSV com suporte a UTF-8 (BOM para compatibilidade com Excel)
 */
export function toCsvString(headers: { key: string; label: string }[], data: Record<string, any>[]): string {
  const bom = "\uFEFF";
  const headerRow = headers.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(";");

  const rows = data.map((item) => {
    return headers
      .map((h) => {
        const val = item[h.key];
        if (val === null || val === undefined) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(";");
  });

  return bom + [headerRow, ...rows].join("\r\n");
}

