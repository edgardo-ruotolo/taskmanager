# Análisis de Arquitectura de UI/UX: Fragmentación de Configuración

## 1. Planteamiento del Problema
Actualmente, la plataforma sufre de una severa inconsistencia en su Arquitectura de Información (IA) respecto a la configuración del sistema. El usuario se ve obligado a interactuar con dos entornos de configuración completamente aislados y con diseños diferentes:
- **Configuración de Workspace:** Ubicada en `/settings`.
- **Configuración de Empresa:** Ubicada en `/:workspaceSlug/companies/:companyId/settings`.

Esto genera una alta carga cognitiva (anti-patrón enterprise) ya que las barreras conceptuales entre lo que le pertenece al "Workspace" y lo que le pertenece a la "Empresa" son ambiguas para el usuario final.

## 2. Hallazgos a Nivel de Código (Auditoría Técnica)

Al revisar el código fuente, se identificaron los siguientes problemas:

### A. Código Muerto en Workspace Settings
El archivo `WorkspaceSettingsPage.tsx` maneja configuraciones clave (Tema, Miembros, Nombre), pero su interfaz está rota:
- Existe un componente `_SettingsSidebar` definido en el archivo, pero **nunca se invoca** ni se renderiza.
- Existe un archivo `SettingsLayout.tsx` diseñado para envolver la configuración, pero **no está siendo utilizado** en el enrutador (`App.tsx`).
- La página renderiza el contenido de las pestañas directamente en la vista, perdiendo el contexto de navegación.

### B. Inconsistencia de Layout en Company Settings
Por otro lado, `CompanySettingsPage.tsx` (que maneja los features como Issues, Cycles, etc.) renderiza su propia barra lateral interna de manera rígida:
```tsx
<nav className="w-[220px] shrink-0 border-r border-subtle pr-4 space-y-1">
```
Esto crea dos experiencias de usuario totalmente distintas (layouts incompatibles) para lo que conceptualmente debería ser la misma acción: "Configurar el entorno de trabajo".

## 3. Resolución Basada en Estándares Élite (Linear, Notion, GitHub)
Los productos B2B SaaS de clase mundial no fragmentan la configuración de esta manera. En lugar de ello, utilizan un **Settings Hub Centralizado**.

En este modelo, existe un único modal o página de configuración global:
- **Nivel Global (Workspace):** Secciones de Facturación, Miembros Globales, Seguridad y Tema.
- **Nivel Equipos (Empresa):** Dentro de la misma barra lateral del Workspace, aparece una subsección para gestionar los "Equipos" o "Empresas", donde el usuario selecciona la entidad y ajusta sus módulos (Issues, Ciclos, Intake).

## 4. Plan de Remediación Propuesto

1. **Unificación de Enrutamiento:** Eliminar la ruta aislada de la empresa y consolidar todas las rutas de configuración bajo `/settings/*`.
2. **Implementación de SettingsLayout:** Revivir y refactorizar `SettingsLayout.tsx` para que sirva como el *layout maestro* de toda la configuración de la plataforma.
3. **Migración de Vistas:** Mover el contenido de `CompanySettingsPage.tsx` para que sea consumido como un sub-módulo dentro de la pestaña "Equipos/Empresas" del `SettingsLayout`.
4. **Limpieza de Código:** Eliminar las barras laterales hardcodeadas en las páginas individuales, dejando que el *layout maestro* se encargue de la navegación.
