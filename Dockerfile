FROM node:22-alpine3.22 AS web-builder
WORKDIR /app
RUN npm install -g pnpm@10.13.1
COPY package.json pnpm-workspace.yaml ./
COPY packages/web/package.json ./packages/web/
RUN pnpm install --filter web
COPY packages/web ./packages/web
RUN pnpm --filter web run build

FROM node:22-alpine3.22 AS api-builder
WORKDIR /app
RUN npm install -g pnpm@10.13.1
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY packages/api/package.json ./packages/api/
RUN pnpm install --filter api --frozen-lockfile
COPY packages/api ./packages/api
RUN pnpm --filter api run build

FROM api-builder AS api
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=api-builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=api-builder --chown=appuser:appgroup /app/packages/api/package.json ./packages/api/package.json
COPY --from=api-builder --chown=appuser:appgroup /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=api-builder --chown=appuser:appgroup /app/packages/api/dist ./packages/api/dist

WORKDIR /app/packages/api

USER appuser

EXPOSE 4000
CMD ["node", "dist/index.js"]

FROM nginx:stable-alpine AS web
WORKDIR /usr/share/nginx/html

COPY --from=web-builder /app/packages/web/dist/web/browser .

RUN mkdir -p /run /var/cache/nginx /var/log/nginx && \
    chown -R nginx:nginx /run /var/cache/nginx /var/log/nginx

RUN apk add --no-cache libcap && \
    setcap 'cap_net_bind_service=+ep' /usr/sbin/nginx && \
    apk del libcap

USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
