FROM node:20 AS builder
WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY src/ ./src/
COPY ./tsconfig.json ./
RUN npx tsc

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
RUN npm install --production
ENV NODE_ENV=production
CMD ["npm", "start"]