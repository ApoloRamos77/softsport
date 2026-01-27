# Dockerfile simplificado para frontend
FROM nginx:alpine

# Limpiar directorio por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar TODO el contenido
COPY . /usr/share/nginx/html/

# Mover nginx.conf
RUN mv /usr/share/nginx/html/nginx.conf /etc/nginx/conf.d/default.conf || true

# Limpiar archivos que no son necesarios
RUN rm -f /usr/share/nginx/html/Dockerfile /usr/share/nginx/html/.htaccess

# Verificar archivos
RUN echo "=== Archivos en /usr/share/nginx/html ===" && \
    ls -la /usr/share/nginx/html/ && \
    echo "=== Verificando index.html ===" && \
    cat /usr/share/nginx/html/index.html | head -5

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
