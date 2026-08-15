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

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm --filter web run build


# ---------- Runtime ----------

FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV PORT=10000

WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./standalone
COPY --from=builder /app/apps/web/.next/static ./standalone/apps/web/.next/static
COPY --from=builder /app/apps/web/public ./standalone/apps/web/public

WORKDIR /app/standalone

EXPOSE 10000

CMD ["node", "apps/web/server.js"]