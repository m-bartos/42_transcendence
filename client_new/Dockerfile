FROM node:20
WORKDIR /app
RUN mkdir /app/frontend_data
COPY package.json package-lock.json* ./
RUN npm install --include=dev
CMD ["tail", "-f", "/dev/null"]