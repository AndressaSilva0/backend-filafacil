import { PrismaClient } from "@prisma/client";

declare global {
  // Evita múltiplas instâncias do Prisma Client em desenvolvimento com hot reload
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export function resolveDatabaseUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined;

  // Conexões diretas do Supabase (db.<ref>.supabase.co:5432) resolvem apenas para IPv6.
  // Em ambientes com suporte estrito a IPv4 (como Render, containers ou redes locais sem IPv6),
  // converte automaticamente para o pooler oficial IPv4 da AWS us-east-1.
  const match = rawUrl.match(/:\/\/postgres(:|%3A)([^@]+)@db\.([a-z0-9]+)\.supabase\.co/i);
  if (match) {
    const projectRef = match[3];
    return rawUrl
      .replace(/:\/\/postgres(:|%3A)/i, `://postgres.${projectRef}$1`)
      .replace(new RegExp(`db\\.${projectRef}\\.supabase\\.co(:5432)?`, "i"), `aws-0-us-east-1.pooler.supabase.com:5432`);
  }

  return rawUrl;
}

const resolvedUrl = resolveDatabaseUrl(process.env.DATABASE_URL);

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: resolvedUrl ? { db: { url: resolvedUrl } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
