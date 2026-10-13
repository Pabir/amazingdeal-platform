# Stage 1: Build Vite Static Assets
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy monorepo configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared-types ./packages/shared-types
COPY apps/admin-web ./apps/admin-web

# Install dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm --filter shared-types build
RUN pnpm --filter admin-web build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine
COPY apps/admin-web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/admin-web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
