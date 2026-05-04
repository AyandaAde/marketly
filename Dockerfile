FROM node:20-bookworm-slim AS base
ARG OPENSSL_VERSION=3.0.*
ARG CA_CERTIFICATES_VERSION=20230311*
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    openssl=${OPENSSL_VERSION} \
    ca-certificates=${CA_CERTIFICATES_VERSION} \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1 \
  NODE_ENV=production \
  DATABASE_URL="mongodb://127.0.0.1:27017/docker-build" \
  EMAIL_USER="docker-build@local" \
  EMAIL_PASSWORD="docker-build" \
  CLERK_SIGNING_SECRET="docker-build-clerk-signing-secret-placeholder" \
  REDIS_URL="redis://127.0.0.1:6379" \
  NEXT_PUBLIC_AUTHORIZATION_TOKEN="docker-build-public-token"

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  PORT=3000 \
  HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
