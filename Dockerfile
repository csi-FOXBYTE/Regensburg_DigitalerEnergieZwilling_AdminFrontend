# ==========================================
# Stage 1: Build
# ==========================================
FROM node:22-alpine AS builder

RUN corepack enable pnpm

WORKDIR /app

RUN chown -R 1000:1000 /app
USER 1000:1000

COPY --chown=1000:1000 package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=secret,id=github_token,env=PACKAGE_TOKEN pnpm install --frozen-lockfile

COPY --chown=1000:1000 . .
RUN pnpm run build

# ==========================================
# Stage 2: Production (nginx non-root)
# ==========================================
FROM nginxinc/nginx-unprivileged:alpine

COPY --chown=101:101 nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=101:101 /app/dist /usr/share/nginx/html

USER 101:101

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
