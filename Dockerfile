# Dockerfile para ADHSOFT SPORT Backend - .NET 9.0
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiar archivos de proyecto y restaurar dependencias
COPY api/SoftSportAPI.csproj api/
RUN dotnet restore "api/SoftSportAPI.csproj"

# Copiar todo el código fuente
COPY api/ api/

# Compilar y publicar la aplicación
WORKDIR /src/api
RUN dotnet publish "SoftSportAPI.csproj" -c Release -o /app/publish

# Imagen final optimizada
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app

# Copiar los archivos publicados desde la etapa de build
COPY --from=build /app/publish .

# Exponer el puerto (Easypanel puede usar cualquier puerto)
EXPOSE 8080

# Variables de entorno por defecto - IMPORTANTE: Deshabilitar launchSettings.json
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_LAUNCH_PROFILE=""

# Comando de inicio
ENTRYPOINT ["dotnet", "SoftSportAPI.dll"]
