# ---------- Dependencies ----------
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile


# ---------- Builder ----------
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat
RUN corepack enable

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm --filter web run build


# ---------- Runtime ----------
FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat
RUN corepack enable

ENV NODE_ENV=production

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --prod --filter web --frozen-lockfile

COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/next.config.ts

EXPOSE 3000

WORKDIR /app/apps/web

CMD ["pnpm", "start"]