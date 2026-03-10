FROM node:22-bookworm-slim AS base

RUN apt-get update -y && apt-get install -y openssl

FROM base AS builder
WORKDIR /app

RUN yarn global add turbo@^2
COPY . .

# Create partial monorepo for server in out/
RUN turbo prune server --docker


FROM base AS installer
WORKDIR /app

COPY --from=builder /app/out/json/ .
RUN yarn install --frozen-lockfile

COPY --from=builder /app/out/full .
COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma


ARG STORAGE_POSTGRES_URL
ENV STORAGE_POSTGRES_URL=$STORAGE_POSTGRES_URL
RUN yarn prisma generate

RUN yarn turbo run build


FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/out/json/ .

RUN yarn install --production --frozen-lockfile

COPY --from=installer /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=installer /app/prisma ./prisma
COPY --from=installer /app/prisma.config.ts .

COPY --from=installer /app/packages/server/dist/ ./packages/server/dist/

ENV PORT=3000
EXPOSE 3000

CMD ["yarn", "start-prod"]
