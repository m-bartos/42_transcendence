# Use official Nginx image as base
FROM nginx:latest

# Copy the custom nginx.conf into the container
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir /index_data
RUN mkdir /static_data

COPY ./index_data/index.html /index_data
# Expose port 80
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]