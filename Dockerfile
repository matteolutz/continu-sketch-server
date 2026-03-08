FROM node:22-bookworm-slim AS base

FROM base as build-frontend
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production=false
COPY src ./src
RUN yarn build

FROM base as run
WORKDIR /app
COPY --from=build-frontend /app/dist ./dist
COPY src ./src

CMD ["yarn", "start-prod"]
