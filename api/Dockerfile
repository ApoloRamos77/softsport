# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["SoftSportAPI.csproj", "./"]
RUN dotnet restore "./SoftSportAPI.csproj"

# Copy everything else and build
COPY . .
WORKDIR "/src/."
RUN dotnet build "SoftSportAPI.csproj" -c Release -o /app/build

# Publish Stage
FROM build AS publish
RUN dotnet publish "SoftSportAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SoftSportAPI.dll"]
