# -----------------------------------------------------------------------------
# Frontend Builder Stage
# -----------------------------------------------------------------------------
FROM node:22-alpine3.22 AS web-builder
WORKDIR /app
# Install pnpm globally
RUN npm install -g pnpm@10.13.1
# Copy dependency manifests
COPY package.json pnpm-workspace.yaml ./
COPY packages/web/package.json ./packages/web/
# Install only web dependencies
RUN pnpm install --filter web
# Copy source code and build
COPY packages/web ./packages/web
RUN pnpm --filter web run build

# -----------------------------------------------------------------------------
# Backend Builder Stage
# -----------------------------------------------------------------------------
FROM node:22-alpine3.22 AS api-builder
WORKDIR /app
# Install pnpm globally
RUN npm install -g pnpm@10.13.1
# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY packages/api/package.json ./packages/api/
RUN pnpm install --filter api --frozen-lockfile
# Copy source code and build
COPY packages/api ./packages/api
RUN pnpm --filter api run build

# -----------------------------------------------------------------------------
# Final Backend Stage
# -----------------------------------------------------------------------------
FROM node:22-alpine3.22 AS api
WORKDIR /app

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install pnpm globally
RUN npm install -g pnpm@10.13.1

# Copy built application files from the builder stage
COPY --from=api-builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=api-builder --chown=appuser:appgroup /app/packages/api/package.json ./packages/api/package.json
COPY --from=api-builder --chown=appuser:appgroup /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=api-builder --chown=appuser:appgroup /app/packages/api/dist ./packages/api/dist

WORKDIR /app/packages/api
USER appuser

EXPOSE 4000
CMD ["node", "dist/index.js"]

# -----------------------------------------------------------------------------
# Final Frontend Stage
# -----------------------------------------------------------------------------
FROM nginx:stable-alpine AS web
WORKDIR /usr/share/nginx/html

# Copy built static files from builder
COPY --from=web-builder /app/packages/web/dist/web/browser .

# Fix permissions so the nginx user (UID 101) can write/cache
RUN mkdir -p /run /var/cache/nginx /var/log/nginx && \
    chown -R nginx:nginx /run /var/cache/nginx /var/log/nginx

RUN apk add --no-cache libcap && \
    setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx && \
    apk del libcap

# Switch to nginx user **after** permissions are set
USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]