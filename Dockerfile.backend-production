# Dockerfile para Producción (Runtime)
# Este archivo asume que los binarios ya fueron compilados y copiados aquí
FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

# Copiar binarios desde el contexto actual (que será publish/backend)
COPY . .

# Configurar puerto 80 (Estándar para Easypanel)
ENV ASPNETCORE_HTTP_PORTS=80
EXPOSE 80

# Variables de entorno para producción
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "SoftSportAPI.dll"]
