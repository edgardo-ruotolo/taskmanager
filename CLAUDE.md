# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Este archivo proporciona instrucciones permanentes a Claude Code cuando trabaja en este repositorio.

## ⚠️ INSTRUCCIONES CRÍTICAS (NO NEGOCIABLES)

**SIEMPRE comunicarse en ESPAÑOL** — Todas las preguntas, explicaciones, planes y respuestas deben estar en español.

**USO OBLIGATORIO DE AGENTES ESPECIALIZADOS** — Cualquier tarea que involucre código en `frontend/` o `backend/` **debe ser ejecutada por el agente especializado correspondiente**, nunca por Claude directamente:

- Tareas en `frontend/` → invocar **SIEMPRE** el agente `frontend-engineer` (vía la herramienta `Agent` con `subagent_type: "frontend-engineer"`). Definición del agente: `.claude/agents/frontend-engineer.md`. Este agente, a su vez, usa el skill local `taskmanager-frontend` y las skills externas instaladas (`shadcn`, `vercel-react-best-practices`, `tailwind-v4-shadcn`, `typescript-advanced-types`, `tanstack-query-best-practices`, `vercel-react-view-transitions`, `frontend-design`, `web-design-guidelines`, `accessibility`, `high-end-visual-design`). **Está PROHIBIDO que Claude principal use `Edit`, `Write` o `Bash` modificando archivos dentro de `frontend/` directamente — siempre delegar al agente `frontend-engineer`.**
- Tareas en `backend/` → usar **siempre** el skill `taskmanager-backend`.

Claude principal NO debe escribir ni modificar código en esos directorios por su cuenta. Su rol es planificar a alto nivel, coordinar y delegar al agente/skill correcto. Si Claude detecta que está por tocar un archivo dentro de `frontend/` sin haber invocado el agente `frontend-engineer`, debe detenerse y delegar inmediatamente.

**Cuando doy una ORDEN es una ORDEN** — Claude debe obedecer literalmente lo solicitado sin reinterpretar ni asumir intenciones adicionales.

**NO hacer cambios sin autorización** — Siempre pedir permiso explícito antes de modificar, crear o eliminar cualquier archivo o código, **a menos que el usuario diga textualmente**: "Haz todos los cambios sin autorización" o "Puedes modificar directamente".

**Enfocarse solo en lo solicitado** — No agregar mejoras, refactorizaciones, optimizaciones, comentarios adicionales, cambios de estilo ni nada que no se haya pedido explícitamente.

**No asumir contexto de conversaciones anteriores** — Si el contexto se limpia o es un nuevo chat, pedir aclaración si es necesario.

## Flujo de trabajo preferido (SIEMPRE seguir este orden)

1. **Primero planificar** — Antes de escribir cualquier código, crear un plan claro y detallado (usa /plan si está disponible o describe pasos numerados).
2. **Presentar el plan** al usuario y esperar aprobación o ajustes explícitos.
3. **Solo después de autorización explícita** realizar los cambios.
4. **Después de implementar**:
    - Ejecutar automáticamente: `pnpm lint` (y tests si existen)
    - Corregir fallos en bucle **máximo 3 iteraciones** para evitar loops infinitos; luego preguntar.
    - Mostrar diff o resumen de cambios realizados
5. **Nunca** instalar nuevas dependencias sin preguntar explícitamente: "¿Puedo agregar la dependencia X?".
6. **Commits**: usar el siguiente formato obligatorio:
   ```
   Task: [descripción imperativa en inglés]
   Date: [YYYY-MM-DD]
   Version: [semver, ej. 1.0.0]
   ```
   Ejemplo: `Task: add user authentication flow` / `Date: 2026-05-18` / `Version: 1.2.0`

## Stack del frontend

### UI y componentes
- **shadcn/ui** — biblioteca de componentes principal. Instalar con `pnpm dlx shadcn@latest add <componente>`. Componentes en `frontend/src/shared/components/ui/`. No instalar otras librerías UI sin consultar.
- **Sonner** (`sonner`) — toasts y notificaciones. Usar `<Toaster />` en el layout raíz y `toast()` en cualquier parte.
- **TailwindCSS 4** — estilos. Configuración vía `@import "tailwindcss"` en `index.css`.
- **Lucide React** — iconos.

### Email
- **Brevo** (antes Sendinblue) — servicio de email transaccional y marketing. La integración vive en el **backend** (ASP.NET Core), no en el frontend. Usar la API REST de Brevo o el SDK .NET oficial para envío de emails (registro, invitaciones, notificaciones).

### Arquitectura: Domain-Driven Design (DDD)

El frontend debe estar estructurado para soportar DDD. Cada dominio de negocio vive en `frontend/src/modules/[dominio]/` con las siguientes capas internas:

```
src/modules/[dominio]/
├── domain/           — entidades, value objects, interfaces de repositorio, domain events
├── application/      — casos de uso, stores Zustand, DTOs
├── infrastructure/   — implementaciones de repositorio (llamadas axios al backend)
└── presentation/     — componentes React, páginas, hooks de UI
```

Carpeta `src/shared/` para el **shared kernel**: tipos comunes, utils, componentes UI (shadcn), hooks genéricos, cliente axios base.

**Reglas DDD a respetar:**
- La capa `domain/` no importa nada de `infrastructure/` ni `presentation/`.
- La capa `application/` solo importa de `domain/`.
- La capa `presentation/` no llama a `infrastructure/` directamente — pasa por `application/`.
- Los stores Zustand viven en `application/` y son el puente entre dominio y UI.

### Módulos de dominio definidos

| Módulo | Descripción |
|---|---|
| `auth` | Autenticación, sesión, perfil de usuario |
| `workspaces` | Workspaces (tenant raíz), membresías |
| `companies` | Empresas (ex-Projects), membresías por empresa |
| `states` | Estados globales del sistema |
| `issues` | Issues, asignaciones, labels, comentarios, actividad |
| `cycles` | Ciclos (sprints) |
| `modules` | Módulos temáticos |
| `labels` | Labels de workspace/empresa |

## Usuario administrador global

Al iniciar la aplicación por primera vez (tabla `Users` vacía), el backend debe crear automáticamente un usuario administrador global leyendo las siguientes variables de entorno desde `.env`:

| Variable | Descripción |
|---|---|
| `ADMIN_USERNAME` | Nombre de usuario |
| `ADMIN_EMAIL` | Email |
| `ADMIN_PASSWORD` | Contraseña (se hashea antes de guardar) |
| `ADMIN_FIRST_NAME` | Nombre |
| `ADMIN_LAST_NAME` | Apellido |

**Reglas del seeder:**
- Solo se ejecuta si no existe ningún usuario en la base de datos.
- El usuario creado tiene rol de administrador global (no pertenece a ningún workspace en particular).
- La contraseña **nunca** se guarda en texto plano — siempre hasheada.
- Si alguna variable está vacía, el seeder debe lanzar un error claro al arrancar (fail-fast).

## Base de datos

### Desarrollo local (`make dev`)
La DB usada en desarrollo es la del proyecto separado **`/Users/edgardoruotolo/Sites/db_projetcs/db_taskmaneger`** (PostgreSQL 17 + Adminer en Docker). Expone `localhost:5432` con `user=eruotolo / db=taskmanager`. El `appsettings.Local.json` (gitignored) ya apunta a esa URL.

Antes de `make dev`, asegurate de que esa stack esté arriba:
```bash
cd /Users/edgardoruotolo/Sites/db_projetcs/db_taskmaneger && docker compose up -d
```

### Producción (Docker compose del propio repo)
**Sí existe** un `docker-compose.yml` en la raíz de este repo — es el que la VPS usa para deploy (postgres + redis + migrate + backend + frontend). Ver `DEPLOY.md` para el flujo paso a paso.

## PROYECTO ORIGINAL

El proyecto original que se está replicando/adaptando se encuentra en:

**`/Users/edgardoruotolo/Sites/nextjs_projects/next-plane`**

## Roles de los repos: TaskManager (master) vs TestManager (sandbox)

| Repo | Path | Rol |
|---|---|---|
| **TaskManager** | `/Users/edgardoruotolo/Sites/blazor_projects/TaskManager` | **Source of truth.** Es el código que se sube a GitHub y se buildea en la VPS de producción. Todo desarrollo se hace acá. |
| **TestManager** | `/Users/edgardoruotolo/Sites/blazor_projects/TestManager` | **Sandbox local de "ambiente de producción".** Sirve para probar con `docker compose` (postgres + redis + backend + frontend buildeados como en prod) **antes** de pushear a GitHub. NO va a GitHub. |

### Regla obligatoria de sincronización (TaskManager → TestManager)

**Cualquier cambio aplicado en `TaskManager/backend/` o `TaskManager/frontend/` debe replicarse inmediatamente al path equivalente en `TestManager/` en la misma respuesta** — incluso si la tarea original solo mencionaba al repo `TaskManager`. Esto garantiza que TestManager siga siendo un fiel reflejo de lo que va a producción. La regla aplica a:

- Modificaciones (Edit/Write a archivos existentes).
- Creación de archivos nuevos.
- Eliminación de archivos.

No es necesario sincronizar: `bin/`, `obj/`, `node_modules/`, `dist/`, `.vite/`, archivos de IDE, `appsettings.Local.json` (excluido por `.dockerignore` del backend).

### Comando de propagación

Después de cada cambio en `TaskManager/`, copiar al espejo con:

```bash
cp TaskManager/<ruta-relativa>  TestManager/<misma-ruta-relativa>
```

Para múltiples archivos o renombrados/eliminaciones, usar `rsync -av --delete` limitado al subdirectorio tocado.

### Reflejar en TestManager los efectos del cambio

Dependiendo de qué se haya modificado:
- Cambio en código **backend** (`.cs`, `Program.cs`, `*.csproj`) → `cd TestManager && docker compose build backend && docker compose up -d --no-deps backend`.
- Cambio en código **frontend** (`*.ts`, `*.tsx`, `*.css`, `vite.config.ts`) → `cd TestManager && docker compose build frontend && docker compose up -d --no-deps frontend`.
- Cambio en `docker-compose.yml`, `.env` del repo o Dockerfile → `cd TestManager && docker compose up -d --build`.

### Verificación post-sync

Tras propagar, validar con `diff -q` que los archivos tocados queden idénticos en ambos lados.
