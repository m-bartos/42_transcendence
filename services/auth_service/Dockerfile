FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src/ ./src/
COPY tsconfig.json ./
COPY src/types ./types/
RUN npx tsc

RUN npm prune --production

FROM node:20-slim
WORKDIR /app
RUN mkdir /static_data

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
CMD ["npm", "start"]