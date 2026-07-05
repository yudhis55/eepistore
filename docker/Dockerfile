# ─── Stage 1: Dependencies ───
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* .npmrc ./
RUN npm ci

FROM deps AS prod-deps
RUN npm prune --omit=dev

# ─── Stage 2: Builder ───
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Git does not preserve empty directories, but the runner stage always copies public assets.
RUN mkdir -p public

# Provide dummy values for build-time page data collection only
# These are NOT used at runtime - real secrets are injected via env vars
ARG BUILD_DATABASE_URL=postgresql://build:build@localhost:5432/build?schema=public

# Generate Prisma client
RUN DATABASE_URL="$BUILD_DATABASE_URL" npx prisma generate

# Build Next.js (standalone output)
RUN DATABASE_URL="$BUILD_DATABASE_URL" AUTH_SECRET="build-time-dummy-not-used-at-runtime" npm run build

# ─── Stage 3: Runner ───
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files for migrations at runtime
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/lib/database-url.ts ./lib/database-url.ts
COPY --from=builder --chown=nextjs:nodejs /app/lib/generated ./lib/generated
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/package-lock.json ./package-lock.json
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# npm/npx are not needed in the runtime image; migrations call Prisma's packaged CLI directly.
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
