FROM node:20-alpine AS builder
WORKDIR /app
COPY ./package*.json tsconfig.json ./
RUN npm install
COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN mkdir /static_data
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
ENV NODE_ENV=production
USER node
CMD ["npm", "run", "start"]


#FROM node:20 AS builder
#WORKDIR /app
#COPY package*.json ./
#RUN npm install
#COPY src/ ./src/
#COPY tsconfig.json ./
#COPY src/types ./types/
#RUN npx tsc
#
#FROM node:20-slim
#WORKDIR /app
#COPY --from=builder /app/dist ./dist
#COPY --from=builder /app/package.json ./
#RUN npm install --production
#ENV NODE_ENV=production
#CMD ["npm", "start"]