# Plan — Sistema de Roles y Permisos TaskManager

**Destino final del documento:** `.doc/permissions-roles-plan.md` (al ejecutar el plan, copiarlo desde este archivo al repo).

---

## 1. Context

El proyecto TaskManager hereda parcialmente el modelo de Plane.so: `WorkspaceRole {Guest=5, Member=15, Admin=20}` y `CompanyRole {Guest=5, Member=15, Lead=18, Admin=20}`. Hoy:

- El rol Identity global se llama `"Admin"` (ambiguo: choca conceptualmente con `WorkspaceRole.Admin`).
- `AdminUserSeeder` crea un único usuario con ese rol y `AdminController` está protegido con `[Authorize(Roles = "Admin")]`.
- Los atributos `RequireWorkspaceMember/Admin` y `RequireCompanyMember/Admin` validan membresía y rol, pero el SuperAdmin global **no puede saltar** estos filtros (no hay god-mode real).
- `Issue.RequiresAdminApproval / ApprovalRequiredStateIds / ApprovedById` existen pero **no hay endpoint de aprobación implementado** ni validación de rol del aprobador.
- El frontend tiene `AdminGuard` que solo lee `user.roles.includes('Admin')`, pero no diferencia roles por workspace ni company.

**Objetivo:** definir un sistema de roles claro de 3 niveles (Global / Workspace / Company), implementar god-mode real para SuperAdmin, formalizar el rol "Gestor de equipo" en Company para aprobar issues, y limpiar enums (eliminar `Guest` de ambos enums por no ser parte del modelo solicitado).

---

## 2. Árbol de permisos (modelo final)

```
┌──────────────────────────────────────────────────────────────┐
│  NIVEL GLOBAL (Identity Role)                                │
│  ────────────────────────────                                │
│  • SuperAdministrador  → rol Identity "SuperAdmin"           │
│      - God-mode: entra a cualquier workspace/company         │
│      - CRUD total de usuarios, workspaces, companies         │
│      - Auditoría y settings globales (panel /admin)          │
│      - Bypass de RequireWorkspaceMember/RequireCompanyMember │
└──────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼───────────────────────┐   ┌───────────▼─────────────────┐
│  NIVEL WORKSPACE              │   │  NIVEL COMPANY              │
│  WorkspaceRole {              │   │  CompanyRole {              │
│    Admin   = 20,              │   │    Admin   = 20,            │
│    Member  = 15               │   │    Lead    = 18,            │
│  }                            │   │    Member  = 15             │
│                               │   │  }                          │
│  • Admin (= "Administrador")  │   │  • Admin (admin de company) │
│      - Gestiona workspace     │   │      - CRUD issues/cycles/  │
│      - Invita/expulsa miembros│   │        modules/labels       │
│      - Crea companies         │   │      - Gestiona miembros    │
│      - Asigna roles workspace │   │      - Aprueba issues       │
│  • Member (= "Usuario")       │   │  • Lead (= "Gestor equipo") │
│      - Accede a workspace     │   │      - Puede aprobar issues │
│      - Ve sus companies       │   │      - NO gestiona miembros │
│      - Sin gestión            │   │  • Member (= "Usuario")     │
│                               │   │      - CRUD básico issues   │
│                               │   │      - Sin aprobar          │
└───────────────────────────────┘   └─────────────────────────────┘
```

### Reglas de cascada

1. `SuperAdmin` global → siempre tiene permisos de Admin en cualquier workspace/company (filtros lo dejan pasar).
2. `WorkspaceRole.Admin` → NO implica automáticamente Admin en companies de ese workspace (decisión: cada company tiene sus propios admins, asignados por el workspace admin al crear la company).
3. `WorkspaceRole.Member` → solo accede a las companies donde es `CompanyMember` (cualquier rol).
4. `CompanyRole.Lead` → puede aprobar issues que tengan `RequiresAdminApproval = true` en su company. `CompanyRole.Admin` también puede aprobar.

---

## 3. Cambios en Backend

### 3.1 Renombrado del rol global Identity

- En `backend/Data/Seeders/AdminUserSeeder.cs`:
  - Cambiar string literal `"Admin"` → `"SuperAdmin"` al crear el rol y asignarlo.
  - Migración runtime: agregar lógica idempotente que renombre el rol existente "Admin" a "SuperAdmin" si está presente en `AspNetRoles` (un único `UPDATE` controlado dentro del seeder).
- En `backend/Modules/Admin/Controllers/AdminController.cs`:
  - Cambiar `[Authorize(Roles = "Admin")]` → `[Authorize(Roles = "SuperAdmin")]`.
  - En el endpoint `POST /api/admin/users`: aceptar solo `"SuperAdmin"` o vacío (usuario regular). Eliminar `"Member"` como rol global válido (no existe en el modelo nuevo).
- En `backend/Common/Auth/HangfireDashboardAuthorizationFilter.cs`: actualizar la comprobación al nuevo nombre `"SuperAdmin"`.
- En `backend/Common/Filters/AdminAuditFilter.cs`: actualizar referencias al nombre `"SuperAdmin"`.

### 3.2 Limpieza de enums

**`backend/Modules/Workspaces/Entities/WorkspaceMember.cs`** (línea 6):

```csharp
// ANTES
public enum WorkspaceRole { Guest = 5, Member = 15, Admin = 20 }
// DESPUÉS
public enum WorkspaceRole { Member = 15, Admin = 20 }
```

**`backend/Modules/Companies/Entities/CompanyMember.cs`** (línea 6):

```csharp
// ANTES
public enum CompanyRole { Guest = 5, Member = 15, Lead = 18, Admin = 20 }
// DESPUÉS
public enum CompanyRole { Member = 15, Lead = 18, Admin = 20 }
```

**Migración EF**: crear migración que actualice cualquier registro con `Role = 5` (Guest) a `Role = 15` (Member) en `WorkspaceMembers` y `CompanyMembers` antes de eliminar el valor del enum, para evitar referencias huérfanas.

### 3.3 God-mode: bypass de filtros para SuperAdmin

Modificar los 4 filtros en `backend/Common/Authorization/`:

- `RequireWorkspaceMemberAttribute.cs`
- `RequireWorkspaceAdminAttribute.cs`
- `RequireCompanyMemberAttribute.cs`
- `RequireCompanyAdminAttribute.cs`

En cada uno, al inicio del `OnActionExecutionAsync`, verificar si el usuario actual está en el rol Identity `"SuperAdmin"`. Si lo está:

1. Saltar las verificaciones de membresía.
2. Inyectar manualmente en `HttpContext.Items["WorkspaceRole"]` o `["CompanyRole"]` el valor `Admin` (para que los handlers downstream piensen que es admin).
3. En `RequireCompanyMemberAttribute`, también establecer el `ICurrentCompanyContext.CompanyId` con el id de la ruta (sin validar membresía).

Helper recomendado: extraer la verificación a un método extensión `httpContext.User.IsSuperAdmin()` en `backend/Common/Authorization/AuthorizationExtensions.cs` (nuevo archivo) para no duplicar lógica.

### 3.4 Endpoint de aprobación de issues

Agregar en `backend/Modules/Issues/Controllers/IssuesController.cs`:

```
POST /api/workspaces/{workspaceSlug}/companies/{companyId}/issues/{issueId}/approve
POST /api/workspaces/{workspaceSlug}/companies/{companyId}/issues/{issueId}/reject
```

Protegidos con `[ServiceFilter(typeof(RequireCompanyMemberAttribute))]`. En el handler validar que `CompanyRole` (leído de `HttpContext.Items["CompanyRole"]`) sea `Lead` o `Admin`. Caso contrario, `403 Forbid`.

Comportamiento:
- `approve`: setea `Issue.ApprovedById = currentUser`, `ApprovedAt = UtcNow`. Mueve el issue al estado destino (el que el usuario intentó al disparar la aprobación). Emite evento SignalR vía `IssueHub`.
- `reject`: opcional para esta iteración. Si no se implementa, dejar TODO. Por ahora **incluir solo `approve`**; `reject` queda fuera de scope.

Validar también en `IssueService.MoveToStateAsync` (o equivalente que maneja drag&drop en el kanban): si `issue.RequiresAdminApproval == true` y el estado destino está en `ApprovalRequiredStateIds`, **rechazar el movimiento directo** y devolver `409 Conflict` con código `ApprovalRequired`. El frontend ya debe llamar al endpoint `/approve` para mover.

### 3.5 Servicio de gestión de roles en company

Ampliar `backend/Modules/Companies/Services/CompanyService.cs`:

- Asegurar que `UpdateMemberRoleAsync` acepta los 3 roles válidos (`Member`, `Lead`, `Admin`).
- Agregar validación: no permitir que el último Admin de una company se degrade a sí mismo.

### 3.6 ICurrentUser

Ampliar `backend/Common/Multitenancy/ICurrentUser.cs` (o donde esté la interfaz) para exponer:

```csharp
bool IsSuperAdmin { get; }
```

calculado leyendo los claims/roles del ClaimsPrincipal. Esto facilita usarlo en services sin repetir la lógica del helper de filtros.

---

## 4. Cambios en Frontend

### 4.1 Tipo `User` y store de auth

`frontend/src/modules/auth/domain/types.ts`:

```typescript
export interface User {
  // ... campos existentes
  roles?: string[];        // mantener; ahora contendrá 'SuperAdmin' si aplica
  isSuperAdmin?: boolean;  // derivado en el backend para conveniencia
}
```

`frontend/src/modules/auth/application/auth-store.ts` ya cachea via TanStack Query — no requiere cambios estructurales, solo asegurar que el DTO devuelto por `GET /api/auth/me` incluye `isSuperAdmin`.

### 4.2 Guards

**`frontend/src/modules/admin/presentation/guards/AdminGuard.tsx`**: cambiar `'Admin'` → `'SuperAdmin'`.

Crear nuevos guards en `frontend/src/shared/guards/`:

- `WorkspaceAdminGuard.tsx`: lee la membresía actual (hook `useCurrentWorkspaceMember`) y permite paso si `role === 'Admin'` **o** `user.isSuperAdmin === true`.
- `CompanyAdminGuard.tsx`: análogo para company.
- `CompanyLeadOrAdminGuard.tsx`: permite paso si `role` ∈ `{Admin, Lead}` o SuperAdmin. Usado para botones de aprobación.

### 4.3 UI de gestión de miembros

`frontend/src/modules/companies/presentation/pages/CompanyMembersPage.tsx` (o equivalente):

- En el `<Select>` de cambio de rol, mostrar las 3 opciones: `Admin`, `Gestor` (Lead), `Usuario` (Member).
- Mostrar el rol actual con label en español: `Admin → "Administrador"`, `Lead → "Gestor"`, `Member → "Usuario"`.

Análogo en `frontend/src/modules/workspaces/presentation/pages/WorkspaceMembersPage.tsx` con 2 opciones: `Admin → "Administrador"`, `Member → "Usuario"`.

### 4.4 Botón de aprobación en Issues

En `frontend/src/modules/issues/presentation/components/` (componente del detalle/card):

- Si `issue.requiresAdminApproval && approvalRequiredStateIds.includes(targetStateId)`:
  - Bloquear drag&drop (ya hay un toast hoy; cambiar el comportamiento para que abra un dialog).
  - Mostrar dialog `ApprovalRequiredDialog` con botón "Solicitar aprobación" o, si el current user es Lead/Admin de la company, botón directo "Aprobar y mover".
- Crear hook `useApproveIssue` en `frontend/src/modules/issues/application/` que llama al nuevo endpoint POST `/approve`.

### 4.5 Panel SuperAdmin (god-mode)

El módulo `frontend/src/modules/admin/` ya existe con páginas en presentación. Acciones:

- Renombrar referencias internas de "Admin" → "SuperAdmin" donde sea claridad de modelo (UI text se queda en español: "Panel del SuperAdministrador").
- Sidebar/menú: el item de god-mode solo aparece si `user.isSuperAdmin === true`.
- Asegurar que las llamadas a `/api/admin/*` desde el panel pasan por el cliente axios con el JWT con claim de rol.

---

## 5. Migraciones de base de datos

Crear migración EF Core en `backend/Migrations/`:

1. `UPDATE "WorkspaceMembers" SET "Role" = 15 WHERE "Role" = 5;`
2. `UPDATE "CompanyMembers" SET "Role" = 15 WHERE "Role" = 5;`
3. No es necesario `ALTER` sobre la columna porque sigue siendo `int`; el enum solo se reduce en código.

Comando:

```bash
cd backend
dotnet ef migrations add CleanupGuestRoles
dotnet ef database update
```

El renombrado del rol Identity `"Admin"` → `"SuperAdmin"` ocurre en el seeder (idempotente) al arrancar la app, no requiere migración EF.

---

## 6. Archivos críticos

### Backend — modificar

- `backend/Modules/Workspaces/Entities/WorkspaceMember.cs` (enum)
- `backend/Modules/Companies/Entities/CompanyMember.cs` (enum)
- `backend/Common/Authorization/RequireWorkspaceMemberAttribute.cs` (bypass SuperAdmin)
- `backend/Common/Authorization/RequireWorkspaceAdminAttribute.cs` (bypass)
- `backend/Common/Authorization/RequireCompanyMemberAttribute.cs` (bypass)
- `backend/Common/Authorization/RequireCompanyAdminAttribute.cs` (bypass)
- `backend/Modules/Admin/Controllers/AdminController.cs` (rol → SuperAdmin, eliminar "Member" como rol global)
- `backend/Data/Seeders/AdminUserSeeder.cs` (rol → SuperAdmin + rename idempotente)
- `backend/Common/Auth/HangfireDashboardAuthorizationFilter.cs`
- `backend/Common/Filters/AdminAuditFilter.cs`
- `backend/Modules/Issues/Controllers/IssuesController.cs` (endpoint approve)
- `backend/Modules/Issues/Services/IssueService.cs` (gate de movimiento por estado)
- `backend/Modules/Companies/Services/CompanyService.cs` (validar último admin)
- `backend/Modules/Auth/Services/AuthService.cs` (incluir `isSuperAdmin` en el DTO de `/me`)
- `backend/Common/Multitenancy/CurrentUser.cs` (propiedad `IsSuperAdmin`)

### Backend — crear

- `backend/Common/Authorization/AuthorizationExtensions.cs` (helper `IsSuperAdmin()` sobre `ClaimsPrincipal`)
- Migración `backend/Migrations/{timestamp}_CleanupGuestRoles.cs`

### Frontend — modificar

- `frontend/src/modules/auth/domain/types.ts` (campo `isSuperAdmin`)
- `frontend/src/modules/admin/presentation/guards/AdminGuard.tsx` (rol → SuperAdmin)
- `frontend/src/modules/workspaces/presentation/pages/WorkspaceMembersPage.tsx` (2 roles)
- `frontend/src/modules/companies/presentation/pages/CompanyMembersPage.tsx` (3 roles)
- Componentes del kanban/detalle de issues (dialog de aprobación)
- Sidebar principal (mostrar entrada SuperAdmin condicional)

### Frontend — crear

- `frontend/src/shared/guards/WorkspaceAdminGuard.tsx`
- `frontend/src/shared/guards/CompanyAdminGuard.tsx`
- `frontend/src/shared/guards/CompanyLeadOrAdminGuard.tsx`
- `frontend/src/modules/issues/application/use-approve-issue.ts`
- `frontend/src/modules/issues/presentation/components/ApprovalRequiredDialog.tsx`

### Documentación

- Mover este plan a `.doc/permissions-roles-plan.md` al ejecutar.

---

## 7. Delegación a skills

Por instrucción crítica del `CLAUDE.md` del proyecto:

- Cambios en `backend/` → ejecutar con skill `taskmanager-backend`.
- Cambios en `frontend/` → ejecutar con skill `taskmanager-frontend`.
- Claude solo coordina y delega.

---

## 8. Verificación

Al terminar la implementación, ejecutar (en orden):

```bash
# Backend
cd backend
dotnet build
dotnet ef database update
dotnet test    # si hay tests; si no, omitir

# Frontend
cd ../frontend
pnpm type-check
pnpm lint
pnpm build
```

**Pruebas funcionales manuales:**

1. **SuperAdmin god-mode**:
   - Loguear como SuperAdmin → ir a `/admin` → confirmar acceso al panel.
   - Como SuperAdmin (no miembro), abrir un workspace ajeno via URL directa → debe permitir acceso.
   - Como usuario sin rol SuperAdmin, intentar lo mismo → debe redirigir o 403.

2. **Workspace Admin vs Usuario**:
   - Como `WorkspaceRole.Admin`: invitar a un nuevo miembro, cambiar el rol de un miembro, crear una company → debe funcionar.
   - Como `WorkspaceRole.Member`: intentar lo mismo → debe ver 403 / botones deshabilitados.

3. **Company roles**:
   - Asignar a un usuario como `CompanyRole.Lead` → debe ver botón "Aprobar" en issues que lo requieran.
   - Como `Member`: NO debe ver botón aprobar.
   - Crear issue con `RequiresAdminApproval = true` y un estado de aprobación. Como Member, intentar drag&drop al estado → debe abrir el dialog "Requiere aprobación" sin mover.
   - Como Lead, aprobar → el issue debe moverse al estado y registrar `ApprovedById/ApprovedAt`.

4. **Limpieza de Guest**:
   - Confirmar que `WorkspaceMembers` y `CompanyMembers` no tienen registros con `Role = 5`.
   - Confirmar que la UI ya no ofrece "Guest" como opción.

5. **Rename Identity role**:
   - Tras arrancar la app con el seeder modificado, verificar en `AspNetRoles` que existe `"SuperAdmin"` y no `"Admin"`.
   - El usuario admin existente debe seguir teniendo acceso (la asignación se mantiene).

---

## 9. Fuera de scope (decisiones explícitas)

- **No** se implementa endpoint `reject` de issue en esta iteración (solo `approve`).
- **No** se introduce sistema de permisos granulares por recurso (tabla `Permissions/RolePermissions`). Roles simples hardcoded.
- **No** se modifica `TeamMember.Role` (sigue como string `"member" | "admin"` por ahora — Teams es feature ortogonal a este plan).
- **No** se agrega cascada automática Workspace.Admin → Company.Admin (cada company gestiona sus propios admins).
- **No** se renombra `WorkspaceRole` ni `CompanyRole` a nombres en español (el código sigue en inglés, solo la UI muestra "Administrador/Gestor/Usuario").
