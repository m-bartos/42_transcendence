FROM nginx:1.27.5
COPY nginx.conf /etc/nginx/nginx.conf
RUN mkdir /frontend_data
RUN mkdir /static_data
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]