FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./modules/ ./modules/
COPY ./plugins ./plugins/
COPY ./routes/ ./routes/
COPY ./types ./types/
COPY ./tsconfig.json ./
COPY ./app.ts ./
RUN npx tsc

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
RUN npm install --production
ENV NODE_ENV=production
CMD ["npm", "start"]