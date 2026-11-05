# ==========================================
# Estágio 1: Build da aplicação TypeScript
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Instala dependências necessárias para compilação do Prisma no Alpine
RUN apk add --no-cache openssl libc6-compat

# Copia manifestos de dependências e schema do Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instala dependências completas para o build
RUN npm ci

# Copia código-fonte e compila TypeScript
COPY . .

# Dummy DATABASE_URL apenas para o prisma generate compilar os tipos no build
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

RUN npm run build

# ==========================================
# Estágio 2: Imagem final enxuta de Produção
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=3001

# Cria usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 filafacil

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Cria diretório de uploads e ajusta permissões completas para o usuário filafacil
RUN mkdir -p /app/uploads/avatars && \
    chown -R filafacil:nodejs /app

USER filafacil

EXPOSE 3001

CMD ["npm", "run", "start"]
