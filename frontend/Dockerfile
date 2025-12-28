FROM nginx:alpine

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy frontend files to nginx html directory
COPY frontend /usr/share/nginx/html/frontend

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
