# 04 · Mapeo de pantallas — Atlas → Codebase

Cada pantalla del prototipo HTML tiene su contraparte exacta en `frontend/src/modules/`. Esta tabla es tu mapa de implementación.

| # | Sección prototipo | Archivo prototipo (`design-reference/src/`) | Ruta en codebase | Página/Layout target |
|---|---|---|---|---|
| 01 | Login | `auth.jsx` → `AuthLogin` | `/login` | `modules/auth/presentation/pages/LoginPage.tsx` |
| 02 | Crear cuenta | `auth.jsx` → `AuthRegister` | `/register` | `modules/auth/presentation/pages/RegisterPage.tsx` |
| 03 | Recuperar contraseña | `auth-extra.jsx` → `ForgotPassword` | `/forgot-password` | `modules/auth/presentation/pages/ForgotPasswordPage.tsx` |
| 04 | Reset password | `auth-extra.jsx` → `ResetPassword` | `/reset-password` | `modules/auth/presentation/pages/ResetPasswordPage.tsx` |
| 05 | Magic link verify | `auth-extra.jsx` → `MagicLink` | `/magic-link/:token` | `modules/auth/presentation/pages/MagicLinkVerifyPage.tsx` |
| 06 | Onboarding | `auth.jsx` → `Onboarding` | `/onboarding` | `modules/auth/presentation/pages/OnboardingPage.tsx` |
| 07 | Workspaces list | `workspace.jsx` → `WorkspacesList` | `/workspaces` | `modules/workspaces/presentation/pages/WorkspacesPage.tsx` |
| 08 | Sidebar global | `shell.jsx` → `Sidebar` | (layout) | `modules/workspaces/presentation/layouts/WorkspaceLayout.tsx` |
| 09 | Command palette ⌘K | `shell.jsx` → `CommandPalette` | (overlay) | `shared/components/CommandPalette.tsx` (crear si no existe) |
| 10 | Home / dashboard | `home.jsx` → `Home` | `/:workspaceSlug/home` | `modules/workspaces/presentation/pages/WorkspaceHomePage.tsx` |
| 11 | Activity feed | `workspace.jsx` → `Activity` | `/:workspaceSlug/activity` | `modules/workspaces/presentation/pages/WorkspaceActivityPage.tsx` |
| 12 | Favoritos | `workspace.jsx` → `Favorites` | `/:workspaceSlug/favorites` | `modules/favorites/presentation/pages/FavoritesPage.tsx` |
| 13 | Borradores | `workspace.jsx` → `Drafts` | `/:workspaceSlug/drafts` | `modules/drafts/presentation/pages/DraftsPage.tsx` |
| 14 | Búsqueda | `workspace.jsx` → `SearchPage` | `/:workspaceSlug/search` | `modules/search/presentation/pages/SearchPage.tsx` |
| 15 | Companies listing | `companies.jsx` → `CompaniesList` | `/:workspaceSlug/companies` | `modules/companies/presentation/pages/CompaniesPage.tsx` |
| 16 | Company settings | `companies.jsx` → `CompanySettings` | `/:workspaceSlug/companies/:companyId/settings` | `modules/companies/presentation/pages/CompanySettingsPage.tsx` |
| 17 | Issues — List view | `issues.jsx` → `IssuesList` | `/:workspaceSlug/companies/:companyId/issues` | `modules/issues/presentation/pages/IssuesPage.tsx` (vista: list) |
| 18 | Issues — Kanban | `issues.jsx` → `IssuesKanban` | `/:workspaceSlug/companies/:companyId/issues?view=board` | Misma página, render condicional |
| 19 | Issues — Calendar | `issues-extra.jsx` → `IssuesCalendar` | `?view=calendar` | Misma página, render condicional |
| 20 | Issues — Gantt | `issues-extra.jsx` → `IssuesGantt` | `?view=gantt` | Misma página, render condicional |
| 21 | Intake / Triage | `issues-extra.jsx` → `IntakePage` | `/:workspaceSlug/companies/:companyId/inbox` | `modules/intake/presentation/pages/InboxPage.tsx` |
| 22 | Issue Detail | `detail.jsx` → `IssueDetail` | `/:workspaceSlug/companies/:companyId/issues/:issueId` | `modules/issues/presentation/pages/IssueDetailPage.tsx` |
| 23 | Vistas guardadas | `issues-extra.jsx` → `ViewsList` | `/:workspaceSlug/settings/views` | `modules/issues/presentation/pages/IssueViewsPage.tsx` |
| 24 | Vista detalle | `issues-extra.jsx` → `ViewDetail` | `/:workspaceSlug/settings/views/:viewId` | `modules/issues/presentation/pages/IssueViewDetailPage.tsx` |
| 25 | Tipos de issue | `issues-extra.jsx` → `IssueTypes` | `/:workspaceSlug/settings/issue-types` | `modules/issues/presentation/pages/IssueTypesPage.tsx` |
| 26 | Cycles overview | `cycles.jsx` → `CyclesOverview` | `/:workspaceSlug/companies/:companyId/cycles` | `modules/cycles/presentation/pages/CyclesPage.tsx` |
| 27 | Cycle detail | `details-extra.jsx` → `CycleDetail` | `/:workspaceSlug/companies/:companyId/cycles/:cycleId` | `modules/cycles/presentation/pages/CycleDetailPage.tsx` |
| 28 | Modules overview | `cycles.jsx` → `ModulesOverview` | `/:workspaceSlug/companies/:companyId/modules` | `modules/project-modules/presentation/pages/ModulesPage.tsx` |
| 29 | Module detail | `details-extra.jsx` → `ModuleDetail` | `/:workspaceSlug/companies/:companyId/modules/:moduleId` | `modules/project-modules/presentation/pages/ModuleDetailPage.tsx` |
| 30 | **Recurrentes — list** | `recurring.jsx` → `RecurringList` | `/:workspaceSlug/recurring` | `modules/recurring/presentation/pages/RecurringListPage.tsx` |
| 31 | **Recurrentes — detail** | `recurring.jsx` → `RecurringDetail` | `/:workspaceSlug/recurring/:recurringId` | `modules/recurring/presentation/pages/RecurringDetailPage.tsx` |
| 32 | Pages list | `pages.jsx` → `PagesList` | `/:workspaceSlug/pages` | `modules/pages/presentation/pages/PagesPage.tsx` |
| 33 | Page editor | `pages.jsx` → `PageEditor` | `/:workspaceSlug/pages/:pageId` | `modules/pages/presentation/pages/PageDetailPage.tsx` |
| 34 | Analytics | `analytics.jsx` → `Analytics` | `/:workspaceSlug/analytics` | `modules/analytics/presentation/pages/AnalyticsPage.tsx` |
| 35 | Archives | `archives-estimates.jsx` → `Archives` | `/:workspaceSlug/companies/:companyId/archives` | `modules/archives/presentation/pages/ArchivesPage.tsx` |
| 36 | Estimates | `archives-estimates.jsx` → `Estimates` | `/:workspaceSlug/companies/:companyId/estimates` | `modules/estimates/presentation/pages/EstimatesPage.tsx` |
| 37 | Inbox / notifications | `settings.jsx` → `Inbox` | `/:workspaceSlug/notifications` | `modules/notifications/presentation/pages/NotificationsPage.tsx` |
| 38 | Stickies (notas) | `settings.jsx` → `Stickies` | `/:workspaceSlug/stickies` | `modules/stickies/presentation/pages/StickiesPage.tsx` |
| 39 | Workspace settings (estados) | `settings.jsx` → `Settings` | `/:workspaceSlug/settings/states` | `modules/states/presentation/pages/StatesPage.tsx` |
| 40 | Labels settings | `settings-extra.jsx` → `Labels` | `/:workspaceSlug/settings/labels` | `modules/labels/presentation/pages/LabelsPage.tsx` |
| 41 | Webhooks | `settings-extra.jsx` → `Webhooks` | `/:workspaceSlug/settings/webhooks` | `modules/webhooks/presentation/pages/WebhooksPage.tsx` |
| 42 | API Tokens | `settings-extra.jsx` → `ApiTokens` | `/:workspaceSlug/settings/tokens` | `modules/auth/presentation/pages/ApiTokensPage.tsx` |
| 43 | Teams & members | `settings-extra.jsx` → `Teams` | `/:workspaceSlug/settings/teams` | `modules/teams/presentation/pages/TeamsPage.tsx` |
| 44 | Integrations | `archives-estimates.jsx` → `Integrations` | `/:workspaceSlug/settings/integrations` | `modules/integrations/presentation/pages/IntegrationsPage.tsx` |
| 45 | Importer | `archives-estimates.jsx` → `Importer` | `/:workspaceSlug/companies/:companyId/importer` | `modules/importer/presentation/pages/ImporterPage.tsx` |
| 46 | Profile | `settings.jsx` → `Profile` | `/:workspaceSlug/profile` | `modules/auth/presentation/pages/ProfilePage.tsx` |
| 47 | Public space | `public-deploy.jsx` → `PublicSpace` | `/public/:token` | `modules/space/presentation/pages/PublicSpacePage.tsx` |
| 48 | Deploy boards | `public-deploy.jsx` → `DeployBoards` | `/:workspaceSlug/companies/:companyId/deploy-boards` | `modules/space/presentation/pages/DeployBoardsPage.tsx` |
| 49 | God Mode — General | `godmode.jsx` → `GodModeGeneral` | `/god-mode/general` | `modules/admin/presentation/pages/GodModeGeneralPage.tsx` |
| 50 | God Mode — Workspaces | `godmode.jsx` → `GodModeUsers` | `/god-mode/workspaces` | `modules/admin/presentation/pages/GodModeWorkspacesPage.tsx` |
| 51 | God Mode — AI | `godmode.jsx` → `GodModeAi` | `/god-mode/ai` | `modules/admin/presentation/pages/GodModeAiPage.tsx` |

---

## Cómo trabajar pantalla por pantalla

Para cada pantalla:

1. **Abre el archivo del prototipo** en `design_handoff_atlas_rebrand/design-reference/src/<file>.jsx`
2. **Identifica el componente exportado** (ej. `RecurringList`)
3. **Abre la página equivalente** en `frontend/src/modules/<feature>/presentation/pages/`
4. **Compara la estructura visual** — copia el JSX layout, NO el código inline
5. **Refactoriza usando componentes del codebase**:
   - Reemplaza `<div style={{...}}>` por `<Card>` de shadcn
   - Reemplaza `<button style={{...}}>` por `<Button>` con el variant adecuado
   - Reemplaza chips inline por `<Badge>`
   - Reemplaza el sidebar custom por `<Sidebar>` del layout
6. **Conecta a los hooks de datos reales** (TanStack Query) — el prototipo tiene datos hardcoded; tú tienes que jalar de la API real
7. **Verifica accesibilidad**: ¿los botones son `<button>` de verdad? ¿los inputs tienen label asociado? ¿el focus se ve?

---

## Datos hardcoded en el prototipo

El prototipo usa nombres ficticios para hacerlo realista:
- Workspace: "Contadores Asociados"
- Usuarios: Marina Ruiz (MR), Javier Cano (JC), Eli Tagle (EL), Diana Silva (DS)
- Company: "Cierre Fiscal Q3"
- Issues: ATL-247, ATL-251, etc.

Cuando implementes, **reemplaza con datos reales del API**. No copies los nombres.
