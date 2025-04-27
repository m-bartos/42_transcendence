FROM node:20
WORKDIR /app
RUN mkdir -p /friends_db_data
COPY package.json package-lock.json* ./
RUN npm install --include=dev
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]
#CMD ["tail", "-f", "/dev/null"]