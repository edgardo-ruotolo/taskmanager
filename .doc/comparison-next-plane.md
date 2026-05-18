
# Comparación funcional: TaskManager vs next-plane (Plane original)

> Generado: 2026-05-17
> Stack TaskManager: ASP.NET Core 9 + EF Core + SignalR + Hangfire + React 19 + Vite SPA + Zustand + TanStack Query + DDD
> Stack next-plane: Django 4.2 + DRF + Celery + Channels + Hocuspocus + React Router 7 + MobX + SWR

## Resumen ejecutivo

| Métrica | Valor |
|---|---|
| Módulos de dominio en next-plane | ~30 |
| Módulos completos en TaskManager | **34** (45%) |
| Módulos parciales | **15** (20%) |
| Módulos esqueleto | **4** (5%) |
| Módulos ausentes | **22** (29%) |
| **Paridad funcional global (ponderada)** | **~65–70%** |
| Paridad en core (workspace/issues/cycles/modules/labels/states) | ~95% |
| Paridad en features avanzadas (AI, i18n, realtime, deploy boards) | ~10% |

## Tabla comparativa

Leyenda: ✅ Completo · 🟡 Parcial · 🟠 Esqueleto · ❌ Ausente

| # | Dominio / Feature | Estado | Gap |
|---|---|---|---|
| 1 | Auth — email/password | ✅ | — |
| 2 | Auth — forgot/reset password | ✅ | — |
| 3 | Auth — magic link | ❌ | Falta endpoint + UI |
| 4 | Auth — OAuth (Google/GitHub/GitLab/Gitea) | 🟠 | Entidad y controller existen, sin flujo OAuth real |
| 5 | Auth — API tokens | ✅ | — |
| 6 | Users / Profile | ✅ | — |
| 7 | Onboarding wizard | 🟡 | Página existe; falta flujo completo de tour/checklist |
| 8 | Workspaces (multi-tenant) | ✅ | — |
| 9 | Workspace members + invitations | ✅ | — |
| 10 | Workspace themes custom | ❌ | Falta `WorkspaceTheme` (colors JSON) |
| 11 | Teams (sub-grupos en workspace) | ❌ | Falta entidad `Team` |
| 12 | Projects / Companies | ✅ | TaskManager renombra Project→Company |
| 13 | Project members + invitations | ✅ | — |
| 14 | States (con grupos) | ✅ | States globales con `StateGroup` |
| 15 | Labels (workspace + project) | ✅ | — |
| 16 | Issues — CRUD + sub-issues | ✅ | — |
| 17 | Issues — assignees, labels, priority | ✅ | — |
| 18 | Issues — comments + reactions + threading | ✅ | — |
| 19 | Issues — activity log | ✅ | — |
| 20 | Issues — relations (blocked_by, duplicate, etc.) | ✅ | — |
| 21 | Issues — subscribers + mentions | 🟡 | Subscribers OK; mentions parser TipTap por confirmar |
| 22 | Issues — links + attachments | 🟡 | Links OK; attachments solo metadata, sin storage real |
| 23 | Issues — versions / history | ✅ | — |
| 24 | Issues — sequence ID con advisory locks PG | 🟡 | SequenceId existe; lock distribuido por confirmar |
| 25 | Issue Types / Epics | ✅ | — |
| 26 | Issues — bulk operations (archive/delete/update) | 🟡 | Faltan endpoints bulk explícitos |
| 27 | Issue Views (filtros guardados) | ✅ | — |
| 28 | Drafts (borradores de issue) | ❌ | Falta entidad `DraftIssue` + conversión draft→issue |
| 29 | Cycles (sprints) | ✅ | — |
| 30 | Cycles — transfer-issues / progress / analytics | 🟡 | CRUD OK; faltan endpoints especializados |
| 31 | Modules (agrupación temática) | ✅ | — |
| 32 | Estimates (story points) | ✅ | — |
| 33 | Intake / Triage | ✅ | — |
| 34 | Notifications (in-app) | ✅ | — |
| 35 | Notifications — preferences | ✅ | — |
| 36 | Notifications — email | 🟡 | BrevoEmailService existe; templates por evento por verificar |
| 37 | Notifications — realtime (SignalR) | ✅ | NotificationHub + IssueHub |
| 38 | Webhooks salientes | ✅ | — |
| 39 | Favorites | ✅ | — |
| 40 | Search global | 🟡 | Backend OK; frontend sin `presentation/` |
| 41 | Analytics — overview + charts | ✅ | — |
| 42 | Analytics — advance analytics + saved views | 🟡 | Falta `AnalyticView`/`SavedAnalyticView` |
| 43 | Analytics — export (xlsx/csv/json) | ❌ | Falta `ExporterHistory` + tareas Hangfire |
| 44 | Recurring Issues | 🟡 | Backend completo; frontend ausente (sin módulo DDD ni rutas) |
| 45 | Pages / Wiki | 🟠 | Frontend tiene store; sin backend ni infrastructure |
| 46 | Pages — versioning + history | ❌ | — |
| 47 | Pages — labels | ❌ | — |
| 48 | Stickies (post-it) | 🟠 | Frontend tiene store; sin backend |
| 49 | Archives (issues/cycles/modules) | 🟠 | Solo página y types en frontend |
| 50 | Files / Assets (S3 + multi-entity) | 🟡 | Solo metadata; falta storage real (S3/Azure Blob) |
| 51 | Realtime collaborative editing (Yjs/Hocuspocus) | ❌ | SignalR existe pero no editor colaborativo |
| 52 | Integraciones GitHub | ❌ | — |
| 53 | Integraciones Slack | ❌ | — |
| 54 | AI Assistant (Anthropic/Gemini) | ❌ | Planeado en memorias pero sin código |
| 55 | Unsplash integration | ❌ | — |
| 56 | Deploy Boards / publishing público | ❌ | Plane tiene apps/space separado |
| 57 | Public votes / reactions (deploy) | ❌ | — |
| 58 | Instance / License admin (God Mode) | ✅ | 8 páginas God Mode |
| 59 | i18n (19 idiomas) | ❌ | Solo español hardcoded |
| 60 | Theming dark/light | ✅ | next-themes instalado |
| 61 | Quick Links / Recent Visits / Home widgets | 🟡 | Favorites OK; faltan widgets de home |
| 62 | Importer (Jira/CSV/etc.) | ❌ | — |
| 63 | Time tracking (worklogs) | ❌ | — |
| 64 | Drag & drop (kanban) | 🟡 | @dnd-kit instalado; verificar uso en tableros |
| 65 | Gantt chart / Timeline | ❌ | — |
| 66 | Calendar layout | ❌ | react-day-picker instalado pero no como layout de issues |
| 67 | Spreadsheet / List layouts | 🟡 | @tanstack/react-table instalado; falta vista spreadsheet |
| 68 | Command palette | ✅ | CommandPalette.tsx |
| 69 | Rich text editor (TipTap) | ✅ | — |
| 70 | PDF / CSV export desde UI | ❌ | — |
| 71 | Background jobs (Hangfire) | ✅ | Dashboard en /hangfire |
| 72 | OpenAPI / Swagger | ✅ | Scalar |
| 73 | Soft delete global | ✅ | AuditableEntity con query filters |
| 74 | API pública v1 con tokens | ✅ | — |
| 75 | Telemetry (PostHog / Scout) | ❌ | — |

## Roadmap hacia paridad 100%

### Prioridad ALTA — completar core
1. Recurring Issues UI frontend (backend listo)
2. Pages / Wiki — backend + infrastructure frontend
3. Stickies — backend + infrastructure frontend
4. Archives — application + infrastructure frontend
5. Search — presentation frontend
6. Drafts — backend + frontend completo
7. Mentions reales en TipTap
8. Bulk operations Issues
9. Attachments reales (S3/Azure Blob)

### Prioridad MEDIA — features avanzadas comunes
- OAuth flow real (Google/GitHub)
- Magic link auth
- Email templates completos por evento
- Exporter (xlsx/csv/json) con Hangfire
- Cycles especializados (transfer/progress/analytics)
- Advance Analytics + Saved Views
- Workspace Themes custom
- Teams
- Home widgets (quick links, recent visits)
- Calendar / Gantt / Spreadsheet layouts

### Prioridad BAJA — enterprise / opcional
- i18n (react-i18next)
- AI Assistant (Anthropic/Gemini)
- Unsplash
- Editor colaborativo realtime (Yjs)
- Deploy Boards públicos (apps/space equivalente)
- Integraciones GitHub / Slack
- Importer
- Time tracking
- PostHog telemetry
- PDF export
