# syntax=docker/dockerfile:1.7

# =============================================================================
# Stage 1: build — compila y publica la API
# =============================================================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY TaskManager.Api.csproj .
RUN dotnet restore TaskManager.Api.csproj
COPY . .
RUN dotnet publish TaskManager.Api.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# =============================================================================
# Stage 2: ef — imagen con SDK + dotnet-ef para correr migraciones
# (la usa el servicio `migrate` del docker-compose)
# =============================================================================
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS ef
WORKDIR /src
COPY --from=build /src .
RUN dotnet tool restore

# =============================================================================
# Stage 3: runtime — imagen final para producción
# =============================================================================
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# curl para HEALTHCHECK
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Usuario no-root
RUN useradd -u 1001 -U -s /bin/false appuser

COPY --from=build /app/publish .

# Directorios persistentes (montados como volumes)
RUN mkdir -p /app/wwwroot/uploads /app/dpkeys \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_RUNNING_IN_CONTAINER=true

HEALTHCHECK --interval=15s --timeout=5s --retries=10 --start-period=20s \
    CMD curl -fsS http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "TaskManager.Api.dll"]
