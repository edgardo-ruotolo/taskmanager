# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Este archivo proporciona instrucciones permanentes a Claude Code cuando trabaja en este repositorio.

## ⚠️ INSTRUCCIONES CRÍTICAS (NO NEGOCIABLES)

**SIEMPRE comunicarse en ESPAÑOL** — Todas las preguntas, explicaciones, planes y respuestas deben estar en español.

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
6. **Commits**: usar conventional commits con scope cuando corresponda  
   Ejemplos: `feat(auth): implementar recuperación de contraseña`, `fix: corregir validación en formulario`

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

La infraestructura de base de datos (Docker con PostgreSQL + Adminer) se gestiona en un repositorio separado:

**`/Users/edgardoruotolo/Sites/db_projetcs/db_taskmaneger`**

No existe ni existirá un `docker-compose.yml` dentro de este repositorio.
