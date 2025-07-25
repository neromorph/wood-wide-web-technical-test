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
RUN pnpm install --filter web...
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
# Copy dependency manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/api/package.json ./packages/api/
# Install only api dependencies
RUN pnpm install --filter api... --prod
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

# Copy built application files from the builder stage with correct ownership
COPY --from=api-builder --chown=appuser:appgroup /app/packages/api/dist ./dist
COPY --from=api-builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=api-builder --chown=appuser:appgroup /app/packages/api/package.json ./

# Switch to the non-root user
USER appuser

EXPOSE 4000
CMD ["node", "dist/index.js"]

# -----------------------------------------------------------------------------
# Final Frontend Stage
# -----------------------------------------------------------------------------
FROM nginx:stable-alpine AS web
# Copy built static files from the builder stage
COPY --from=web-builder /app/packages/web/dist/web/browser /usr/share/nginx/html

# Switch to the non-root nginx user (best practice for clarity)
USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
