FROM node:22-alpine AS builder
WORKDIR /app

ARG GITHUB_TOKEN
ENV GITHUB_TOKEN=$GITHUB_TOKEN

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install

COPY . .
RUN pnpm build

# ---- runtime ----
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY server.mjs .

RUN mkdir -p /data

VOLUME ["/data"]
EXPOSE 8090

CMD ["node", "server.mjs"]
