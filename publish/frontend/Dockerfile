# Dockerfile para ADHSOFT SPORT Frontend
FROM nginx:alpine

# Crear directorio
WORKDIR /usr/share/nginx/html

# Copiar archivos HTML y assets
COPY index.html ./
COPY assets ./assets
COPY images ./images
COPY js ./js
COPY *.css ./

# Copiar configuración nginx  
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Verificar instalación
RUN ls -la /usr/share/nginx/html/ && \
    test -f /usr/share/nginx/html/index.html || (echo "ERROR: index.html no encontrado!" && exit 1)

# Exponer puerto
EXPOSE 80

# Iniciar nginx en foreground
CMD ["nginx", "-g", "daemon off;"]
