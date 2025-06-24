FROM node:20-alpine AS builder
WORKDIR /app
COPY ./package*.json tsconfig.json ./
RUN npm install
COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
ENV NODE_ENV=production
USER node
#CMD ["node", "dist/app.js"]
CMD ["npm", "run", "start"]
