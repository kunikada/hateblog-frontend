# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/devcontainers/typescript-node:24-bookworm AS build
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Build
COPY . .
RUN pnpm build

FROM nginx:1.28-alpine AS runtime
WORKDIR /usr/share/nginx/html

# Clean default assets and copy build output
RUN rm -rf ./*
COPY --from=build /app/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
