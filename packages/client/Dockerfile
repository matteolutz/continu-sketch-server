FROM node:22-bookworm-slim AS base

FROM base AS builder
WORKDIR /app

RUN yarn global add turbo@^2
COPY . .

# Create partial monorepo for server in out/
RUN turbo prune client --docker


FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN yarn install --frozen-lockfile

ENV NODE_ENV=production

COPY --from=builder /app/out/full .
RUN yarn prisma generate

# Vite uses quite a lot of memory while building
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV GENERATE_SOURCEMAP=false

RUN yarn turbo run build

FROM nginx
WORKDIR /app

COPY ./packages/client/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=installer /app/packages/client/dist /usr/share/nginx/html

EXPOSE 80
