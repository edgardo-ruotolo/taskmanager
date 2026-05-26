# Bootstrap de producción + arquitectura de ambientes

> Fecha: 2026-05-25
> Sesión que dejó el proyecto listo para salir a producción en VPS.

## Context

Después de tener Dockerfiles y `docker-compose.yml` (ver `.doc/auditoria-y-docker-produccion.md`), faltaban tres piezas para que un `git clone && docker compose up -d` en una VPS quedara funcionando de primera:

1. **Seeders de bootstrap** que dejen el sistema usable sin pasos manuales: usuario SuperAdmin, su workspace inicial, un primer project y un set de Labels.
2. **Una arquitectura clara de ambientes** que permita validar localmente el flujo de producción antes de pushear.
3. **Un `DEPLOY.md`** que documente el flujo VPS paso a paso.

Esta doc resume todo lo que se hizo y por qué.

---

## 1. Arquitectura de ambientes

Tres repos colaboran. Cada uno tiene un rol distinto:

| Repo | Path | Rol |
|---|---|---|
| **TaskManager** | `/Users/edgardoruotolo/Sites/blazor_projects/TaskManager` | **Source of truth.** El código que va a GitHub y se buildea en la VPS de producción. Todo desarrollo se hace acá. |
| **TestManager** | `/Users/edgardoruotolo/Sites/blazor_projects/TestManager` | **Sandbox local de "ambiente de producción".** Copia espejo del repo donde se levanta la app con `docker compose up -d --build` exactamente como va a quedar en la VPS. NO va a GitHub. |
| **db_taskmaneger** | `/Users/edgardoruotolo/Sites/db_projetcs/db_taskmaneger` | **Postgres de desarrollo.** Container postgres:17 + adminer, expone `localhost:5432`. Es la DB que usa `make dev` del TaskManager (nativo, no dockerizado). |

### Flujo end-to-end

```
        ┌─────────────────────────────────────────────────────────┐
        │  DESARROLLO (nativo en macOS)                           │
        │                                                         │
        │   make dev en TaskManager                               │
        │       │                                                 │
        │       ├─ backend (.NET 9 en :5209) ────┐                │
        │       └─ frontend (Vite en :5173) ───┐ │                │
        │                                      │ │                │
        │                                      ▼ ▼                │
        │   db_taskmaneger (Postgres en :5432, adminer en :8080)  │
        └─────────────────────────────────────────────────────────┘
                                  │
                                  │ (cuando funciona OK)
                                  ▼
        ┌─────────────────────────────────────────────────────────┐
        │  VALIDACIÓN DE PRODUCCIÓN (Docker local)                │
        │                                                         │
        │   cp TaskManager/* TestManager/*  (sync de cambios)     │
        │   cd TestManager && docker compose up -d --build        │
        │       │                                                 │
        │       ├─ taskmanager-postgres (red interna)             │
        │       ├─ taskmanager-redis (red interna)                │
        │       ├─ taskmanager-migrate (corre EF Core update)     │
        │       ├─ taskmanager-backend (:5050 → :8080)            │
        │       └─ taskmanager-frontend (:8081 → :80)             │
        └─────────────────────────────────────────────────────────┘
                                  │
                                  │ (si arriba healthy → push OK)
                                  ▼
        ┌─────────────────────────────────────────────────────────┐
        │  PRODUCCIÓN (VPS)                                       │
        │                                                         │
        │   git pull (desde GitHub) en /opt/taskmanager           │
        │   docker compose up -d --build                          │
        │   Reverse proxy → app.midominio.com / api.midominio.com │
        └─────────────────────────────────────────────────────────┘
```

### Regla de sincronización TaskManager → TestManager

**Todo cambio aplicado en `TaskManager/backend/` o `TaskManager/frontend/` debe replicarse inmediatamente al path equivalente en `TestManager/` en la misma respuesta**, incluso si el usuario solo mencionó al repo TaskManager. Esto garantiza que el sandbox sigue siendo fiel reflejo de lo que va a producción.

Comando:
```bash
cp TaskManager/<ruta>  TestManager/<misma-ruta>
diff -q TaskManager/<ruta> TestManager/<misma-ruta>   # verificación
```

Después de copiar, rebuildear el contenedor afectado en TestManager:
- Backend: `cd TestManager && docker compose build backend && docker compose up -d --no-deps backend`
- Frontend: `cd TestManager && docker compose build frontend && docker compose up -d --no-deps frontend`
- Cambios en `docker-compose.yml` / `.env` / Dockerfile: `cd TestManager && docker compose up -d --build`

Esta regla está documentada también en:
- `CLAUDE.md` (sección "Roles de los repos") — la lee toda sesión nueva de Claude Code.
- `~/.claude/projects/.../memory/feedback_testmanager_mirror.md` — memoria persistente.

---

## 2. Bootstrap seeders nuevos

Los seeders viven en `backend/Data/Seeders/` y se ejecutan en orden al startup, en `Program.cs`:

```csharp
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    await StateSeeder.SeedAsync(services);              // ya existía
    await AdminUserSeeder.SeedAsync(services);          // ya existía
    await WorkspaceBootstrapSeeder.SeedAsync(services); // NUEVO
    await ProjectBootstrapSeeder.SeedAsync(services);   // NUEVO
    await CompanyLabelsSeeder.SeedAsync(services);      // NUEVO
}
```

Todos son **idempotentes**: se pueden correr múltiples veces sin duplicar datos.

### 2.1 `WorkspaceBootstrapSeeder.cs`

Crea el workspace inicial **"RBV Consultores"** (slug `rbv-consultores`), asocia al SuperAdmin como `Owner` + `WorkspaceMember.Admin`, y además **marca el onboarding del SuperAdmin como completado** (`OnboardingCompletedAt = NOW`, `OnboardingCompletedSteps = ['welcome','profile','workspace','invite']`).

Sin ese último paso, el frontend redirigía al wizard de onboarding al loguearse aunque ya hubiera workspace asignado (porque `User.OnboardingCompletedAt` quedaba `null` y el frontend chequea ese flag para decidir si mostrar el wizard).

### 2.2 `ProjectBootstrapSeeder.cs`

Crea el primer project **"Fluentoc"** con `Identifier='FLU'` dentro del workspace bootstrap-eado. Asocia al SuperAdmin como `Owner` + `ProjectMember.Admin`. Usa el `StateGroup` default (el que crea `StateSeeder`).

### 2.3 `CompanyLabelsSeeder.cs`

Inserta **47 Labels** (razones sociales chilenas: SPA, LTDA, EIRL, S.A.) en el workspace `rbv-consultores`. Colores asignados desde una paleta fija de 10 (cíclica por índice). La lista de 47 nombres está hardcodeada en el seeder.

Las Labels en TaskManager son scope **workspace**, no project — un Label se asocia a issues de cualquier project dentro del workspace.

### Datos esperados después de bootstrap

| Tabla | Filas esperadas en primer arranque |
|---|---|
| `AspNetUsers` | 1 (el SuperAdmin del `.env`) |
| `Workspaces` | 1 (`RBV Consultores` / `rbv-consultores`) |
| `WorkspaceMembers` | 1 (admin como Role=20) |
| `Projects` | 1 (`Fluentoc` / `FLU`) |
| `ProjectMembers` | 1 |
| `Labels` | 47 (todas en `rbv-consultores`) |
| `States` | 6 (Backlog, Todo, In Progress, In Review, Done, Cancelled) |
| `StateGroups` (IsDefault=true) | 1 |

---

## 3. Cómo levantar cada ambiente

### 3.1 Desarrollo (`make dev`)

```bash
# 1. Asegurarse de que la DB de testing esté arriba
cd /Users/edgardoruotolo/Sites/db_projetcs/db_taskmaneger
docker compose up -d

# 2. Arrancar dev (backend nativo + frontend Vite)
cd /Users/edgardoruotolo/Sites/blazor_projects/TaskManager
make dev
```

- Backend en `http://localhost:5209`.
- Frontend en `http://localhost:5173`.
- DB en `localhost:5432` (con datos persistidos en `db_taskmaneger/postgres-data`).
- Adminer en `http://localhost:8080`.

El `appsettings.Local.json` (gitignored) ya tiene la connection string apuntando a esa DB.

### 3.2 Sandbox de producción (TestManager con Docker)

```bash
# Validar que la stack docker compose levanta limpia (como en VPS)
cd /Users/edgardoruotolo/Sites/blazor_projects/TestManager
docker compose down -v        # ambiente limpio desde cero
docker compose up -d --build  # build + arranque

# Verificar
docker compose ps
docker compose logs -f backend
curl http://localhost:5050/health
```

- Backend en `http://localhost:5050` (puerto cambiado del 5000 porque AirPlay Receiver de macOS ocupa ese puerto).
- Frontend en `http://localhost:8081`.
- Postgres y Redis en red Docker interna (no expuestos al host).

### 3.3 Producción (VPS)

Ver `DEPLOY.md` en la raíz del repo (10 secciones con prereqs, configuración, build, verificación, troubleshooting).

Resumen:
```bash
git clone <repo-github> /opt/taskmanager && cd /opt/taskmanager
cp .env.example .env && nano .env   # completar variables
docker compose build
docker compose up -d
curl http://localhost:${BACKEND_HOST_PORT}/health
```

---

## 4. Fixes colaterales aplicados en la sesión

### 4.1 Fix de onboarding del SuperAdmin

**Síntoma:** el SuperAdmin bootstrap entraba al frontend pero le pedía "crear espacio de trabajo" aunque el workspace ya existía en la DB.

**Causa raíz:** el frontend chequea `User.OnboardingCompletedAt`. El `AdminUserSeeder` creaba al admin sin tocar ese flag (default `null`), y el `WorkspaceBootstrapSeeder` original solo creaba workspace+membership pero no el flag.

**Fix:** al final del `WorkspaceBootstrapSeeder`, si `admin.OnboardingCompletedAt is null`, setearlo a `DateTime.UtcNow` y poblar `OnboardingCompletedSteps` con `['welcome', 'profile', 'workspace', 'invite']` (los nombres canónicos que usa `OnboardingPage.tsx:449`).

### 4.2 Fix de scroll en `ThemedMultiSelect`

**Síntoma:** el selector de Labels (usado en crear/editar issue, recurring template) solo mostraba ~7 etiquetas aunque el backend devolvía las 47, y no había scroll para ver el resto.

**Causa raíz:** el componente `<Command>` de shadcn trae `overflow-hidden` por defecto, lo cual suprimía silenciosamente el scroll del `<CommandList>` hijo aunque éste tuviera `max-h` definido internamente.

**Fix** en `frontend/src/shared/components/ThemedMultiSelect.tsx`:
```diff
- <Command className="bg-transparent">
+ <Command className="bg-transparent overflow-visible">
      ...
-     <CommandList>
+     <CommandList className="max-h-60 overflow-y-auto">
```

Cubre los 3 lugares afectados (crear issue, editar issue, recurring template) porque todos usan el mismo componente compartido.

---

## 5. Decisiones tomadas en la sesión

| Tema | Decisión | Por qué |
|---|---|---|
| Scope de Labels | Workspace (no Project) | Respeta la arquitectura existente. Las 47 Labels viven en `rbv-consultores` y son visibles para cualquier project del workspace. |
| Cantidad de SuperAdmins | 1, del `.env` (reutilizar `AdminUserSeeder`) | El usuario quiere un único admin global. |
| Identifier del project | `FLU` (3 caracteres) | Prefijo corto para issues tipo `FLU-1`, `FLU-2`. |
| DB reset en sandbox | `docker compose down -v` + `up -d --build` | Limpia volumes (incluido postgres_data con credenciales viejas). |
| Email de password (`appsettings.Local.json`) | `Guns026772!A` | La que ya estaba en config local del TaskManager. |
| Email de password (TestManager `.env`) | `Guns026772!A` | Misma que local — flow idéntico al ambiente prod. |
| Puerto del backend en TestManager | `5050` (no `5000`) | El puerto `5000` lo ocupa AirPlay Receiver de macOS. |
| `appsettings.Local.json` en producción | Excluido vía `.dockerignore` | No viaja a la imagen Docker. Las credenciales prod se inyectan vía env vars del compose. |
| Documentación de deploy | `DEPLOY.md` en raíz del repo | Visible al clonar; complementa `.doc/` para uso operativo. |

---

## 6. Archivos creados o modificados en la sesión

### Backend
- `backend/Data/Seeders/CompanyLabelsSeeder.cs` — **NUEVO**, 47 labels
- `backend/Data/Seeders/WorkspaceBootstrapSeeder.cs` — **NUEVO**, workspace + membership + flag onboarding
- `backend/Data/Seeders/ProjectBootstrapSeeder.cs` — **NUEVO**, project Fluentoc
- `backend/Program.cs` — registra los 3 nuevos seeders en orden

### Frontend
- `frontend/src/shared/components/ThemedMultiSelect.tsx` — fix scroll del popover

### Documentación
- `DEPLOY.md` — **NUEVO**, guía de deploy en VPS
- `CLAUDE.md` — actualizada sección "Base de datos" y agregada "Roles de los repos"
- `.doc/bootstrap-y-ambientes-produccion.md` — **este archivo**

### Sincronización
Todos los archivos anteriores quedaron idénticos byte a byte en `TaskManager/` y `TestManager/` (verificado con `diff -q`).

---

## 7. Verificación final

```bash
# DB de testing arriba con datos seedeados
PGPASSWORD=*** psql -h localhost -p 5432 -U eruotolo -d taskmanager -c \
  'SELECT (SELECT COUNT(*) FROM "AspNetUsers") AS users,
          (SELECT COUNT(*) FROM "Workspaces") AS workspaces,
          (SELECT COUNT(*) FROM "Projects") AS projects,
          (SELECT COUNT(*) FROM "Labels") AS labels;'
# Esperado: users=1 workspaces=1 projects=1 labels=47

# Sandbox de producción
docker compose -f /Users/edgardoruotolo/Sites/blazor_projects/TestManager/docker-compose.yml ps
curl http://localhost:5050/health   # Healthy

# Login funciona contra el sandbox
curl -X POST http://localhost:5050/api/auth/login \
  -H "Origin: http://localhost:8081" \
  -H "Content-Type: application/json" \
  -d '{"email":"eruotolo@fluentoc.com","password":"Guns026772!A"}'
# Esperado: 200 + JSON con isSuperAdmin: true, onboardingCompletedAt no-null
```

---

## 8. Próximos pasos sugeridos

1. **Subir TaskManager a GitHub** — el repo está listo (`.gitignore` correcto, `.env.example` completo, sin secrets en commits).
2. **Configurar un workflow CI** que corra `dotnet build` + `pnpm build` + `docker compose build` en cada PR.
3. **Definir el reverse proxy de la VPS** (Caddy / Traefik / nginx) con HTTPS automático (Let's Encrypt).
4. **Definir estrategia de backup** del volume `postgres_data` en la VPS (`pg_dump` programado + storage externo).
5. **Smoke test post-deploy en VPS**: las queries y endpoints listados en sección 5 de `DEPLOY.md`.
