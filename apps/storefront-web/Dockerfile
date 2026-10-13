# Stage 1: Build Next.js Application
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy monorepo configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared-types ./packages/shared-types
COPY apps/storefront-web ./apps/storefront-web

# Install dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm --filter shared-types build
RUN pnpm --filter storefront-web build

# Stage 2: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/apps/storefront-web/public ./apps/storefront-web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront-web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/storefront-web/.next/static ./apps/storefront-web/.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "apps/storefront-web/server.js"]
