# Dockerfile para ADHSOFT SPORT Backend
FROM mcr.microsoft.com/dotnet/aspnet:9.0

WORKDIR /app

# Copiar los archivos publicados
COPY . .

# Exponer el puerto
EXPOSE 5081

# Variables de entorno
ENV ASPNETCORE_URLS=http://+:5081
ENV ASPNETCORE_ENVIRONMENT=Production

# Comando de inicio
ENTRYPOINT ["dotnet", "SoftSportAPI.dll"]
