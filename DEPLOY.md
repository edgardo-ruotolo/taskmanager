# Deploy en VPS — TaskManager

Guía paso a paso para levantar TaskManager en una VPS limpia usando el `docker-compose.yml` del propio repo.

## Prerequisitos en la VPS

| Software | Versión mínima | Verificar |
|---|---|---|
| Docker Engine | 24.x | `docker --version` |
| Docker Compose plugin v2 | 2.20+ | `docker compose version` |
| Git | 2.30+ | `git --version` |
| Puertos libres en el host | 5000 + 8081 (configurable via `.env`) | `lsof -i :5000` |

Recomendado (no obligatorio): `curl`, `openssl`, `vim`/`nano`.

---

## 1. Clonar el repo

```bash
cd /opt
git clone <URL-del-repo-GitHub>.git taskmanager
cd taskmanager
```

> Reemplazar `<URL-del-repo-GitHub>` por la URL real del repo (ej. `git@github.com:eruotolo/taskmanager.git`).

---

## 2. Configurar variables de entorno

Copiar la plantilla y completar:

```bash
cp .env.example .env
nano .env   # o vim, code, etc.
```

Variables **obligatorias** (sin valor por defecto):

| Variable | Para qué |
|---|---|
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Credenciales del Postgres del compose. Usar password fuerte. |
| `REDIS_PASSWORD` | Password de Redis (SignalR backplane + IDistributedCache). |
| `AUTH_MAGIC_LINK_SECRET` | Secret 32 bytes base64. Generar con `openssl rand -base64 32`. |
| `AUTH_REFRESH_TOKEN_SECRET` | Idem, otro secret distinto. |
| `ADMIN_USERNAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_FIRST_NAME` / `ADMIN_LAST_NAME` | Bootstrap del SuperAdmin (se crea solo si la DB está vacía). |
| `BACKEND_PUBLIC_URL` | URL pública del API (ej. `https://api.midominio.com`). |
| `FRONTEND_PUBLIC_URL` | URL pública del frontend (ej. `https://app.midominio.com`). |
| `FRONTEND_BUILD_API_URL` | URL del API embebida en el bundle del frontend en build-time. Suele ser igual a `BACKEND_PUBLIC_URL`. |
| `BACKEND_HOST_PORT` / `FRONTEND_HOST_PORT` | Puertos del host donde Docker publica backend y frontend. Apuntar el reverse proxy de la VPS acá. |

Variables **opcionales**:

| Variable | Default | Cuándo setearla |
|---|---|---|
| `EMAIL_USE_REAL_PROVIDER` | `false` (LogOnly) | Poner `true` cuando quieras enviar emails reales via Brevo. |
| `BREVO_API_KEY` | vacío | Si `EMAIL_USE_REAL_PROVIDER=true`. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | vacío | Si usas OpenTelemetry. |
| `VITE_SENTRY_DSN` / `VITE_POSTHOG_KEY` / `VITE_POSTHOG_HOST` | vacío | Frontend observability. Se inyectan en build-time. |

> ⚠️ El archivo `.env` está en `.gitignore` y NO se commitea nunca. La VPS debe tener su propio `.env` real.

---

## 3. Build de las imágenes Docker

```bash
docker compose build
```

Esto construye 3 imágenes:
- `taskmanager-backend` (multi-stage: SDK 9 build → ASP.NET 9 runtime, usuario no-root, curl para healthcheck).
- `taskmanager-migrate` (SDK 9 + dotnet-ef, init container).
- `taskmanager-frontend` (Vite build → nginx alpine).

Tiempo aprox. en VPS estándar: 3-6 minutos primera vez, <30s en builds incrementales.

---

## 4. Levantar la stack

```bash
docker compose up -d
```

Orden interno (gestionado por `depends_on` + healthchecks):
1. `postgres` arranca → espera `pg_isready` → marca `healthy`.
2. `redis` arranca → `redis-cli ping` → `healthy`.
3. `migrate` se ejecuta `dotnet ef database update` → exit 0.
4. `backend` arranca, corre los **5 seeders** (`State`, `AdminUser`, `WorkspaceBootstrap`, `ProjectBootstrap`, `CompanyLabels`), expone `:8080` interno y `${BACKEND_HOST_PORT}` en el host. Health endpoint `/health` debe responder 200.
5. `frontend` arranca, nginx sirve el SPA en `${FRONTEND_HOST_PORT}`.

---

## 5. Verificación post-arranque

```bash
docker compose ps
docker compose logs -f backend   # ver seeders y arranque
curl http://localhost:${BACKEND_HOST_PORT}/health         # esperado: "Healthy"
curl http://localhost:${BACKEND_HOST_PORT}/health/ready   # esperado: 200
curl -I http://localhost:${FRONTEND_HOST_PORT}            # esperado: 200 + nginx/1.27
```

Verificar seeders en DB:
```bash
docker exec taskmanager-postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c '
SELECT (SELECT COUNT(*) FROM "AspNetUsers") AS users,
       (SELECT COUNT(*) FROM "Workspaces") AS workspaces,
       (SELECT COUNT(*) FROM "Projects") AS projects,
       (SELECT COUNT(*) FROM "Labels") AS labels;'
```
Esperado en primer arranque:
- users = 1 (el SuperAdmin del `.env`).
- workspaces = 1 (`RBV Consultores`).
- projects = 1 (`Fluentoc` / `FLU`).
- labels = 47 (en workspace `rbv-consultores`).

Login de prueba (sustituir password por la del `.env`):
```bash
curl -X POST http://localhost:${BACKEND_HOST_PORT}/api/auth/login \
  -H "Origin: ${FRONTEND_PUBLIC_URL}" \
  -H "Content-Type: application/json" \
  -d '{"email":"'"$ADMIN_EMAIL"'","password":"'"$ADMIN_PASSWORD"'"}'
```
Esperado: HTTP 200 + JSON con el usuario y `isSuperAdmin: true`.

---

## 6. Reverse proxy y HTTPS

El compose **no incluye reverse proxy ni TLS** — se asume que la VPS ya tiene uno por delante (Caddy, Traefik, nginx, Cloudflare Tunnel, etc.).

Configuración mínima del reverse proxy:

| Hostname | Backend interno |
|---|---|
| `app.midominio.com` → | `http://localhost:${FRONTEND_HOST_PORT}` |
| `api.midominio.com` → | `http://localhost:${BACKEND_HOST_PORT}` |

Asegurarse de:
- Forwardear `Host` original (para CORS y URLs absolutas en emails).
- Si hay WebSocket (SignalR), pasar `Upgrade` y `Connection` headers.
- HTTPS termina en el reverse proxy; el tráfico al backend puede ir HTTP en loopback.

---

## 7. Operaciones comunes

### Ver logs en vivo
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs --since 10m
```

### Reiniciar un servicio (sin tocar el resto)
```bash
docker compose restart backend
docker compose up -d --no-deps backend     # si cambió la imagen
```

### Aplicar nuevos cambios del repo
```bash
git pull
docker compose build
docker compose up -d
```

El servicio `migrate` correrá `ef database update` automáticamente y aplicará las migraciones nuevas. Los seeders son idempotentes — no duplican datos.

### Backup de la DB
```bash
docker exec taskmanager-postgres pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  > backup-$(date +%Y%m%d-%H%M%S).sql
```

### Restore de la DB
```bash
docker exec -i taskmanager-postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < backup.sql
```

### Bajar la stack (preserva volumes)
```bash
docker compose down
```

### Bajar y **borrar todo** (destructivo, incluye DB)
```bash
docker compose down -v
```

---

## 8. Troubleshooting

### El backend queda en restart loop
Ver `docker compose logs backend`. Causas comunes:
- `Auth__RefreshTokenSecret` o `Auth__MagicLinkSecret` vacíos → arranca pero falla validación. Generar con `openssl rand -base64 32`.
- Connection string a Postgres mal — verificar que `POSTGRES_USER`/`POSTGRES_PASSWORD` del `.env` coincidan con los que el compose pasa al backend (variable `ConnectionStrings__Postgres`).

### `migrate` exit 1 — `password authentication failed`
El volumen `postgres_data` tiene credenciales viejas (cambiaste `POSTGRES_PASSWORD` después del primer arranque). Postgres solo aplica el password en el primer init.
**Fix destructivo** (borra la DB):
```bash
docker compose down -v && docker compose up -d --build
```
**Fix no destructivo** (mantiene la DB, cambia el password):
```bash
docker exec -it taskmanager-postgres psql -U <user-viejo> -c "ALTER USER ... WITH PASSWORD '...';"
```

### Puerto ocupado en el host
Ajustar `BACKEND_HOST_PORT` / `FRONTEND_HOST_PORT` en `.env` y reiniciar:
```bash
docker compose down && docker compose up -d
```
> ⚠️ En macOS, el puerto 5000 lo ocupa AirPlay Receiver. En Linux suele estar libre.

### El frontend muestra "Failed to connect to API"
- `FRONTEND_BUILD_API_URL` se embebe en el bundle al hacer `docker compose build frontend`. Si la cambiás en `.env`, hay que rebuildear el frontend:
  ```bash
  docker compose build frontend && docker compose up -d --no-deps frontend
  ```
- Verificar CORS: el backend permite el origen de `FRONTEND_PUBLIC_URL`. Si cambiaste el dominio, ajustá `.env` y reiniciá el backend.

### Health endpoint devuelve "Unhealthy"
```bash
curl http://localhost:${BACKEND_HOST_PORT}/health/ready
```
Te dice qué dependencia falla (postgres, redis, etc.).

---

## 9. Estructura del compose

```
postgres (postgres:17-alpine)
   └─ volume postgres_data
   └─ healthcheck pg_isready
redis (redis:7-alpine, requirepass)
   └─ volume redis_data
   └─ healthcheck redis-cli ping
migrate (build target ef, init container, exit 0)
   └─ depends_on postgres (healthy)
backend (build target runtime, ASP.NET Core 9, no-root user)
   └─ depends_on postgres, redis, migrate (completed)
   └─ volume uploads_data (/app/wwwroot/uploads)
   └─ volume dpkeys_data (/app/dpkeys)
   └─ healthcheck curl /health
   └─ port ${BACKEND_HOST_PORT}:8080
frontend (nginx alpine)
   └─ depends_on backend (healthy)
   └─ port ${FRONTEND_HOST_PORT}:80
```

---

## 10. Validación previa al deploy

Antes de subir cambios a la VPS, validar localmente con el sandbox `TestManager`:

```bash
cd /Users/edgardoruotolo/Sites/blazor_projects/TestManager
docker compose down -v        # ambiente limpio
docker compose up -d --build  # exactamente como va a quedar en la VPS
```

Si todo arranca healthy ahí, lo mismo va a pasar en la VPS al hacer `git pull && docker compose up -d --build`.
