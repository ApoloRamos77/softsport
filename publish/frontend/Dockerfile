# Dockerfile para ADHSOFT SPORT Frontend
FROM nginx:alpine

# Copiar archivos estáticos
COPY . /usr/share/nginx/html

# Copiar configuración nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Nginx se inicia automáticamente
CMD ["nginx", "-g", "daemon off;"]
