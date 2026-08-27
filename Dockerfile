FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=builder /app/dist-web ./dist-web
COPY --from=builder /app/dist-server ./dist-server

EXPOSE 8000
CMD sh -c "PORT=${PORT:-8000} node dist-server/server/index.js"
