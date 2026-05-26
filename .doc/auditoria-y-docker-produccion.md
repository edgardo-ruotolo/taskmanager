# Plan — Auditoría de producción + Docker stack para VPS

## Context

El proyecto TaskManager (ASP.NET Core 9 + React 19 + PostgreSQL) está cerca de salir a producción en una VPS, pero hoy no tiene Dockerfile ni docker-compose propios. Toda la infraestructura local depende de procesos sueltos (`make dev`) y de un repo externo de DB (`db_taskmaneger`). Antes del deploy necesito:

1. **Auditar el estado real de producción** — qué falta, qué es bloqueante, qué es deseable.
2. **Dejar un stack Docker autocontenido** que con `docker compose up -d` levante toda la app (backend + frontend + postgres + redis + migraciones one-shot) en una VPS, listo para ser publicado vía un reverse proxy externo (Traefik/Caddy/NPM) con HTTPS.

Decisiones tomadas con vos:
- Postgres incluido en el nuevo compose (el repo `db_taskmaneger` queda obsoleto para prod).
- HTTPS resuelto por reverse proxy externo en la VPS (el compose solo expone puertos HTTP internos en el host).
- Auditoría se documenta acá, no se arreglan bugs en este trabajo.
- Migraciones EF Core vía servicio `migrate` one-shot que corre antes del backend.

---

## Parte 1 — Auditoría de producción

### Estado general

**Veredicto: NO está listo para producción tal cual.** Hay bloqueantes reales que romperían el deploy o degradarían la seguridad. Una vez resueltos los Críticos + Altos, está en condiciones de salir.

Resumen por capa:
- **Backend**: ~80% listo. Seguridad sólida (CORS validado, HSTS, rate limiting, FluentValidation, security headers), pero faltan piezas operativas (health checks, Data Protection Keys, auto-migrate, proteger Swagger/Hangfire).
- **Frontend**: ~75% listo. Build limpio, code splitting OK, Sentry/PostHog configurados con fallbacks. Faltan ajustes de env vars de producción y fallback SPA en el servidor estático.
- **Infra**: 0% listo. Sin Dockerfiles, sin compose, sin estrategia de secrets, sin CI de deploy.

### Bloqueantes Críticos (resolver antes del deploy)

| # | Tema | Archivo / lugar | Fix propuesto |
|---|---|---|---|
| C1 | Sin `appsettings.Production.json` | `backend/` | Crear archivo plantilla con todas las claves esperadas vacías; documentar que se completan vía env vars. |
| C2 | Migraciones EF Core no se aplican solas | `backend/Program.cs` | Resuelto por el servicio `migrate` del compose (ver Parte 2). |
| C3 | Data Protection Keys NO persistidos | `backend/Program.cs` | `services.AddDataProtection().PersistKeysToFileSystem(new DirectoryInfo("/app/dpkeys")).SetApplicationName("TaskManager")`. Volumen `dpkeys_data` en compose. Sin esto, todos los tokens/cookies se invalidan en cada restart. |
| C4 | Swagger/Scalar expuestos en producción | `backend/Program.cs` ~líneas 390-391 | Envolver el mapeo de Scalar/OpenAPI en `if (app.Environment.IsDevelopment())`. |
| C5 | `LogOnlyEmailService` activo, `BrevoEmailService` comentado | `backend/Program.cs` línea ~155 | Switch por config: si `Email:UseRealProvider=true` y `Brevo:ApiKey` no vacío → registrar Brevo, si no LogOnly. |
| C6 | Frontend `.env` apunta a `http://localhost:5209` | `frontend/.env` | `.env` de dev queda como está; el build de producción se hace con `VITE_API_URL` inyectado en build args del Dockerfile. |
| C7 | Variables admin no documentadas en `.env.example` raíz para Docker | `.env.example` | Crear `.env.example` nuevo en raíz con TODAS las vars del compose (Postgres, Auth secrets, Cors, Admin, Brevo, App URLs, Redis). |

### Riesgos Altos (resolver idealmente antes del deploy)

| # | Tema | Archivo / lugar | Fix propuesto |
|---|---|---|---|
| A1 | Sin health checks | `backend/Program.cs` | `services.AddHealthChecks().AddNpgSql(...).AddRedis(...)`; mapear `/health` y `/health/ready`. El compose los usa para `healthcheck` de Docker. |
| A2 | Hangfire dashboard en `/hangfire` | `backend/Program.cs` | Verificar que `HangfireDashboardAuthorizationFilter` exige admin global. Si no, restringir o no mapear en producción. |
| A3 | 3 warnings de Biome | `frontend/src/...` (ver auditoría) | Resolver antes de build: array index key, cognitive complexity, non-null assertion. |
| A4 | Auth flag persistida en `localStorage` | `frontend/src/modules/auth/...` | Mantener (no es secreto, solo flag); confirmar que el JWT/refresh viven en cookies httpOnly emitidas por backend. |
| A5 | Sin catch-all SPA en servidor estático | `frontend/` | Resuelto por config de nginx en el Dockerfile del frontend (`try_files $uri /index.html`). |
| A6 | Connection string sin pool tuning | `appsettings.json` comentario | Agregar `Maximum Pool Size=100;Minimum Pool Size=10;Connection Lifetime=300;Connection Idle Lifetime=180;` al string que se pasa vía env var. |
| A7 | Uploads en disco local (`wwwroot/uploads`) | `backend/Modules/Files/Services/LocalFileStorage.cs` | Para single-host está OK; montar volumen `uploads_data:/app/wwwroot/uploads`. Cuando se escale horizontal, migrar a S3 (stub ya existe). |

### Riesgos Medios (post-deploy aceptable)

| # | Tema | Notas |
|---|---|---|
| M1 | Sin observabilidad de OTLP en producción | OpenTelemetry está cableado pero requiere endpoint. Opcional para v1. |
| M2 | Sin backup automático de Postgres | Documentar `pg_dump` + cron en la VPS o usar un sidecar (fuera de scope del compose inicial). |
| M3 | Sin tests E2E en CI | Solo hay tests de integración. No bloqueante. |
| M4 | Source maps no configurados explícitamente | Vite los excluye por defecto en build; si se quieren para Sentry, configurar `build.sourcemap: 'hidden'`. |
| M5 | Bundle frontend sin análisis previo | Instalar `rollup-plugin-visualizer` puntualmente. |

### Riesgos Bajos

- Eliminar `<link>` redundante a Google Fonts en `index.html` (ya están vía `@fontsource`).
- Headers de seguridad en nginx del frontend (CSP, X-Frame-Options) — el backend ya los emite, conviene replicarlos en el static server.

---

## Parte 2 — Stack Docker para producción

### Arquitectura del stack

```
docker-compose.yml (en raíz del repo)
│
├── postgres   (postgres:17-alpine)        — DB principal, volumen persistente
├── redis      (redis:7-alpine)            — SignalR backplane + IDistributedCache
├── migrate    (build backend/Dockerfile)  — one-shot: dotnet ef database update; exit 0
├── backend    (build backend/Dockerfile)  — API + Hubs SignalR + Hangfire
└── frontend   (build frontend/Dockerfile) — nginx sirviendo dist/
```

Red Docker interna `taskmanager_net` (bridge). Solo `backend` (puerto API) y `frontend` (puerto 80 nginx) se publican al host en puertos configurables vía `.env` (`BACKEND_HOST_PORT`, `FRONTEND_HOST_PORT`). Postgres y Redis quedan SOLO en la red interna (sin `ports:` al host) — esto los protege en la VPS.

### Archivos a crear

#### 1. `backend/Dockerfile` (multi-stage)

```dockerfile
# syntax=docker/dockerfile:1.7
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY TaskManager.Api.csproj .
RUN dotnet restore TaskManager.Api.csproj
COPY . .
RUN dotnet publish TaskManager.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# Imagen para ef migrations (incluye SDK)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS ef
WORKDIR /src
RUN dotnet tool install --global dotnet-ef --version 9.0.5
ENV PATH="${PATH}:/root/.dotnet/tools"
COPY --from=build /src .

# Runtime final
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
RUN useradd -u 1001 -U -s /bin/false appuser
COPY --from=build /app/publish .
RUN mkdir -p /app/wwwroot/uploads /app/dpkeys && chown -R appuser:appuser /app
USER appuser
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
HEALTHCHECK --interval=15s --timeout=5s --retries=10 --start-period=20s \
  CMD curl -fsS http://localhost:8080/health || exit 1
ENTRYPOINT ["dotnet", "TaskManager.Api.dll"]
```

El stage `ef` es el que usa el servicio `migrate` para correr `dotnet ef database update`.

#### 2. `backend/.dockerignore`

```
bin/
obj/
Tests/
appsettings.Local.json
appsettings.Development.json
**/.vs/
**/.idea/
```

#### 3. `frontend/Dockerfile` (multi-stage build → nginx)

```dockerfile
# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG VITE_API_URL
ARG VITE_SENTRY_DSN
ARG VITE_ENV=production
ARG VITE_POSTHOG_KEY
ARG VITE_POSTHOG_HOST
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_ENV=$VITE_ENV
ENV VITE_POSTHOG_KEY=$VITE_POSTHOG_KEY
ENV VITE_POSTHOG_HOST=$VITE_POSTHOG_HOST
RUN pnpm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --retries=5 \
  CMD wget -qO- http://localhost/healthz || exit 1
```

#### 4. `frontend/nginx.conf`

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
  gzip_min_length 1024;

  add_header X-Frame-Options DENY always;
  add_header X-Content-Type-Options nosniff always;
  add_header Referrer-Policy strict-origin-when-cross-origin always;

  # Assets con hash → cache largo
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    try_files $uri =404;
  }

  location = /healthz { return 200 "ok\n"; add_header Content-Type text/plain; }

  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

#### 5. `frontend/.dockerignore`

```
node_modules/
dist/
.env
.env.local
**/.idea/
```

#### 6. `docker-compose.yml` (raíz del repo)

```yaml
name: taskmanager

networks:
  taskmanager_net:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  uploads_data:
  dpkeys_data:
  hangfire_data:

services:
  postgres:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks: [taskmanager_net]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes", "--requirepass", "${REDIS_PASSWORD}"]
    volumes:
      - redis_data:/data
    networks: [taskmanager_net]
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 3s
      retries: 10

  migrate:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: ef
    restart: "no"
    command: ["dotnet", "ef", "database", "update", "--no-build", "--project", "TaskManager.Api.csproj"]
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ConnectionStrings__Postgres: "Host=postgres;Port=5432;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD};Maximum Pool Size=100;Minimum Pool Size=10;Connection Lifetime=300;Connection Idle Lifetime=180;"
    depends_on:
      postgres:
        condition: service_healthy
    networks: [taskmanager_net]

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      target: runtime
    restart: unless-stopped
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: http://+:8080
      ConnectionStrings__Postgres: "Host=postgres;Port=5432;Database=${POSTGRES_DB};Username=${POSTGRES_USER};Password=${POSTGRES_PASSWORD};Maximum Pool Size=100;Minimum Pool Size=10;Connection Lifetime=300;Connection Idle Lifetime=180;"
      Redis__ConnectionString: "redis:6379,password=${REDIS_PASSWORD},abortConnect=false"
      Auth__MagicLinkSecret: ${AUTH_MAGIC_LINK_SECRET}
      Auth__RefreshTokenSecret: ${AUTH_REFRESH_TOKEN_SECRET}
      Cors__AllowedOrigins__0: ${FRONTEND_PUBLIC_URL}
      App__BaseUrl: ${BACKEND_PUBLIC_URL}
      App__FrontendUrl: ${FRONTEND_PUBLIC_URL}
      Brevo__ApiKey: ${BREVO_API_KEY}
      Email__UseRealProvider: ${EMAIL_USE_REAL_PROVIDER:-false}
      Admin__Username: ${ADMIN_USERNAME}
      Admin__Email: ${ADMIN_EMAIL}
      Admin__Password: ${ADMIN_PASSWORD}
      Admin__FirstName: ${ADMIN_FIRST_NAME}
      Admin__LastName: ${ADMIN_LAST_NAME}
      OTEL_EXPORTER_OTLP_ENDPOINT: ${OTEL_EXPORTER_OTLP_ENDPOINT:-}
    volumes:
      - uploads_data:/app/wwwroot/uploads
      - dpkeys_data:/app/dpkeys
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      migrate:
        condition: service_completed_successfully
    ports:
      - "${BACKEND_HOST_PORT:-5000}:8080"
    networks: [taskmanager_net]
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://localhost:8080/health"]
      interval: 15s
      timeout: 5s
      retries: 10
      start_period: 30s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: ${FRONTEND_BUILD_API_URL}
        VITE_SENTRY_DSN: ${VITE_SENTRY_DSN:-}
        VITE_ENV: production
        VITE_POSTHOG_KEY: ${VITE_POSTHOG_KEY:-}
        VITE_POSTHOG_HOST: ${VITE_POSTHOG_HOST:-}
    restart: unless-stopped
    depends_on:
      backend:
        condition: service_healthy
    ports:
      - "${FRONTEND_HOST_PORT:-8081}:80"
    networks: [taskmanager_net]
```

> `FRONTEND_BUILD_API_URL` se inyecta en build-time (queda hardcodeado en el bundle). Es la URL pública del backend (ej. `https://api.midominio.com`), no `http://backend:8080`.

#### 7. `.env.example` (raíz, reemplaza al actual)

```dotenv
# === PostgreSQL ===
POSTGRES_DB=taskmanager
POSTGRES_USER=taskmanager
POSTGRES_PASSWORD=change-me-strong-password

# === Redis ===
REDIS_PASSWORD=change-me-redis

# === Auth secrets (32 bytes base64 c/u) ===
# Generar con: openssl rand -base64 32
AUTH_MAGIC_LINK_SECRET=
AUTH_REFRESH_TOKEN_SECRET=

# === Admin global (seed inicial si DB vacía) ===
ADMIN_USERNAME=
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_FIRST_NAME=
ADMIN_LAST_NAME=

# === URLs públicas ===
BACKEND_PUBLIC_URL=https://api.midominio.com
FRONTEND_PUBLIC_URL=https://app.midominio.com
FRONTEND_BUILD_API_URL=https://api.midominio.com

# === Puertos host (publicados al reverse proxy de la VPS) ===
BACKEND_HOST_PORT=5000
FRONTEND_HOST_PORT=8081

# === Email (Brevo) ===
EMAIL_USE_REAL_PROVIDER=false
BREVO_API_KEY=

# === Observabilidad (opcional) ===
OTEL_EXPORTER_OTLP_ENDPOINT=
VITE_SENTRY_DSN=
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=https://app.posthog.com
```

#### 8. `.gitignore` — agregar (si no está)
- `.env` en raíz
- `frontend/.env.production`

### Cómo se usa en la VPS

```bash
# 1. Clonar el repo en la VPS
git clone <repo> taskmanager && cd taskmanager

# 2. Crear .env desde el ejemplo y completar valores
cp .env.example .env
nano .env   # rellenar secrets, dominios, admin user

# 3. Build + up
docker compose build
docker compose up -d

# 4. Verificar
docker compose ps
docker compose logs -f backend
curl http://localhost:5000/health
curl http://localhost:8081/healthz
```

El reverse proxy de la VPS (Traefik/Caddy/NPM/nginx-host) apunta:
- `https://api.midominio.com` → `127.0.0.1:5000`
- `https://app.midominio.com` → `127.0.0.1:8081`

WebSockets (SignalR) requieren que el proxy haga upgrade de HTTP/1.1 (`Upgrade`/`Connection` headers) en la ruta `/hubs/*`.

### Notas operativas para producción

- **Rebuild del frontend cuando cambia el dominio**: el `VITE_API_URL` queda embebido en el bundle. Si cambiás el dominio del backend, hay que rebuildear el frontend.
- **Backup de Postgres**: el volumen `postgres_data` debe respaldarse. Documentar `docker compose exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql` en cron.
- **Logs**: `docker compose logs -f backend` para diagnosticar. Considerar configurar driver `json-file` con rotación o enviar a Loki.
- **Actualización**: `git pull && docker compose build && docker compose up -d`. El servicio `migrate` corre solo en cada `up`, aplica las nuevas migraciones y termina antes de que arranque el backend nuevo.
- **Escalado horizontal**: hoy no es seguro por el `LocalFileStorage` (uploads locales). Migrar a S3 antes de poner réplicas.

---

## Archivos críticos a crear / modificar

Crear:
- `backend/Dockerfile`
- `backend/.dockerignore`
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `frontend/.dockerignore`
- `docker-compose.yml` (raíz)
- `.env.example` (raíz, reemplaza el actual con todas las vars)

Modificar (opcional, alineado con la auditoría):
- `backend/Program.cs` — `AddDataProtection().PersistKeysToFileSystem("/app/dpkeys")`, envolver Scalar en `IsDevelopment()`, switch de email provider por config, health checks con Postgres+Redis.
- `backend/appsettings.Production.json` — crear plantilla.

> Según lo decidido, los cambios en código del backend quedan documentados pero NO se aplican en este trabajo.

---

## Verificación end-to-end

1. **Build limpio local**: `docker compose build` sin errores.
2. **Arranque ordenado**: `docker compose up -d`; revisar `docker compose ps` — postgres y redis `healthy`, `migrate` `Exit 0`, `backend` y `frontend` `healthy`.
3. **Migraciones aplicadas**: `docker compose logs migrate` muestra todas las migraciones ejecutadas; `docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "\dt"` lista las tablas.
4. **Seed del admin**: primer login con `ADMIN_EMAIL` / `ADMIN_PASSWORD` funciona.
5. **Backend health**: `curl http://localhost:5000/health` → 200 (asumiendo que se agregó el endpoint).
6. **Frontend sirve SPA**: `curl http://localhost:8081/` devuelve `index.html`; rutas inexistentes (`/lalala`) también devuelven `index.html` (fallback OK).
7. **SignalR**: abrir la app en el browser, verificar en DevTools → Network → WS que `/hubs/notifications` hace upgrade y queda conectado.
8. **CORS**: el frontend en `FRONTEND_PUBLIC_URL` puede llamar al backend; un origen distinto recibe 403.
9. **Persistencia**: `docker compose down && docker compose up -d` — los datos siguen, las sesiones siguen válidas (Data Protection Keys persistidas).
10. **Restart-resistencia**: `docker compose restart backend` — sin pérdida de sesión, sin re-aplicación de migraciones.
