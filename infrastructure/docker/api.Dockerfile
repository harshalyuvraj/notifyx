# ---------- Dependencies ----------

FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json

RUN pnpm install --frozen-lockfile


# ---------- Builder ----------

FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat
RUN corepack enable

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api run build


# ---------- Runtime ----------

FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat
RUN corepack enable

ENV NODE_ENV=production

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json

# Copy already-installed dependencies
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

EXPOSE 3001

WORKDIR /app/apps/api

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/src/main.js"]