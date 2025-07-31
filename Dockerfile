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

# Make pnpm accessible to appuser
COPY --from=api-builder --chown=root:root /usr/local/bin/pnpm /usr/local/bin/pnpm

# Install ts-node globally for prisma:seed command
RUN npm install -g ts-node typescript

RUN mkdir -p /home/appuser/.npm-global && \
    chown -R appuser:appgroup /home/appuser/.npm-global && \
    echo "export PATH=/home/appuser/.npm-global/bin:$PATH" >> /home/appuser/.profile && \
    mkdir -p /app/.pnpm-store && \
    chown -R appuser:appgroup /app/.pnpm-store

ENV PATH="/usr/local/bin:$PATH"
ENV PNPM_HOME="/home/appuser/.npm-global"

# Copy prisma directory for seeding
COPY --from=api-builder --chown=appuser:appgroup /app/packages/api/prisma ./packages/api/prisma

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
    setcap "cap_net_bind_service=+ep" /usr/sbin/nginx && \
    apk del libcap

USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]