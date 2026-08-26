FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run check

FROM node:22-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server.mjs ./
COPY --from=build /app/dist-web ./dist-web
RUN chown -R node:node /app
USER node

EXPOSE 8000
CMD ["sh", "-c", "node server.mjs"]
