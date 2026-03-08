FROM node:22-bookworm-slim AS base

FROM base as build-frontend
WORKDIR /app

COPY package.json yarn.lock index.html vite.config.ts ./
RUN yarn install --production=false
COPY . .
RUN yarn build

FROM base as run
WORKDIR /app
COPY --from=build-frontend /app/dist ./dist
COPY . .

RUN yarn install

ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT

CMD ["yarn", "start-prod"]
