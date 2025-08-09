# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src

# Copy csproj and restore dependencies
COPY CoolingManagerAPI/CoolingManagerAPI.csproj CoolingManagerAPI/
RUN dotnet restore CoolingManagerAPI/CoolingManagerAPI.csproj

# Copy everything else and build
COPY . .
WORKDIR /src/CoolingManagerAPI
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

# Copy published app
COPY --from=build /app/publish .

# Create logs directory
RUN mkdir -p /app/logs

# Expose ports
EXPOSE 80
EXPOSE 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["dotnet", "CoolingManagerAPI.dll"]
