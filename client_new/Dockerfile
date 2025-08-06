FROM node:20
WORKDIR /app
RUN mkdir /frontend_data
COPY package.json package-lock.json* ./
RUN npm install --include=dev

# Copy the contents of the client_new directory into /app
COPY ./ ./

# Run the build command and copy the output to /frontend_data
RUN #npm run docker-build && cp -r /app/dist/* /frontend_data/

CMD ["tail", "-f", "/dev/null"]