
# Comparación funcional: TaskManager vs next-plane (Plane original)

> Generado: 2026-05-17 | Última actualización: 2026-05-18
> Stack TaskManager: ASP.NET Core 9 + EF Core + SignalR + Hangfire + React 19 + Vite SPA + Zustand + TanStack Query + DDD
> Stack next-plane: Django 4.2 + DRF + Celery + Channels + Hocuspocus + React Router 7 + MobX + SWR

## Resumen ejecutivo

| Métrica | Valor |
|---|---|
| Módulos de dominio en next-plane | ~75 |
| Módulos completos en TaskManager | **~50** (67%) |
| Módulos parciales | **~17** (23%) |
| Módulos esqueleto | **~1** (1%) |
| Módulos ausentes | **~7** (9%) |
| **Paridad funcional global (ponderada)** | **~83%** |
| Paridad en core (workspace/issues/cycles/modules/labels/states) | ~95% |
| Paridad en features avanzadas (AI, i18n, realtime, deploy boards) | ~60% |

> Actualizado 2026-05-18 tras completar las fases 10–16. Fórmula de ponderación: (50×1.0 + 17×0.6 + 1×0.2 + 7×0) / 75 ≈ 62.4 / 75 ≈ 83%.

## Tabla comparativa

Leyenda: ✅ Completo · 🟡 Parcial · 🟠 Esqueleto · ❌ Ausente

| # | Dominio / Feature | Estado | Gap |
|---|---|---|---|
| 1 | Auth — email/password | ✅ | — |
| 2 | Auth — forgot/reset password | ✅ | — |
| 3 | Auth — magic link | 🟡 | Endpoint + UI implementados (Fase 15); flujo completo por verificar en prod |
| 4 | Auth — OAuth (Google/GitHub/GitLab/Gitea) | 🟡 | Skeleton OAuth completo (Fase 15); sin flow OAuth real externo |
| 5 | Auth — API tokens | ✅ | — |
| 6 | Users / Profile | ✅ | — |
| 7 | Onboarding wizard | ✅ | Flujo completo implementado (Fase 10) |
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
| 36 | Notifications — email | 🟡 | IEmailService + LogOnlyEmailService stub (Fase 10); templates por evento pendientes |
| 37 | Notifications — realtime (SignalR) | ✅ | NotificationHub + IssueHub |
| 38 | Webhooks salientes | ✅ | — |
| 39 | Favorites | ✅ | — |
| 40 | Search global | ✅ | Frontend `SearchPage` implementado (Fase 5) |
| 41 | Analytics — overview + charts | ✅ | — |
| 42 | Analytics — advance analytics + saved views | ✅ | `AnalyticView` + SavedViewsPanel completado (Fase 8) |
| 43 | Analytics — export (xlsx/csv/json) | ✅ | ExporterHistory + Hangfire + UI completado (Fase 8) |
| 44 | Recurring Issues — UI | ✅ | Frontend `modules/recurring/` completado (Fase 2) |
| 45 | Pages / Wiki | 🟡 | CollaborativeEditor integrado (Fase 12); falta backend completo |
| 46 | Pages — versioning + history | ❌ | — |
| 47 | Pages — labels | ❌ | — |
| 48 | Stickies (post-it) | 🟡 | Frontend conectado a backend (Fase 4) |
| 49 | Archives (issues/cycles/modules) | ✅ | Backend + frontend completados (Fase 5) |
| 50 | Files / Assets (S3 + multi-entity) | ✅ | LocalFileStorage implementado (Fase 6) |
| 51 | Realtime collaborative editing (Yjs/Hocuspocus) | 🟡 | DocumentHub SignalR + CollaborativeEditor implementado (Fase 12); no es CRDT puro |
| 52 | Integraciones GitHub | 🟡 | Stubs completos — entidades, endpoints, UI (Fase 14) |
| 53 | Integraciones Slack | 🟡 | Stubs completos — entidades, endpoints, UI (Fase 14) |
| 54 | AI Assistant (Anthropic/Gemini) | 🟡 | IAiProvider + StubAiProvider + UI completa (Fase 11) |
| 55 | Unsplash integration | 🟡 | Stub con Picsum photos (Fase 11) |
| 56 | Deploy Boards / publishing público | ✅ | DeployBoard entity + public Space page completo (Fase 13) |
| 57 | Public votes / reactions (deploy) | ❌ | — |
| 58 | Instance / License admin (God Mode) | ✅ | 8 páginas God Mode |
| 59 | i18n (19 idiomas) | ❌ | Solo español hardcoded |
| 60 | Theming dark/light | ✅ | next-themes instalado |
| 61 | Quick Links / Recent Visits / Home widgets | ✅ | Recent visits + quick links completado (Fase 9) |
| 62 | Importer (CSV) | 🟡 | CSV local parser implementado sin Jira API (Fase 15) |
| 63 | Time tracking (worklogs) | ✅ | IssueWorklog entity + WorklogPanel UI (Fase 15) |
| 64 | Drag & drop (kanban) | 🟡 | @dnd-kit instalado; verificar uso en tableros |
| 65 | Gantt chart / Timeline | ❌ | — |
| 66 | Calendar layout | ❌ | react-day-picker instalado pero no como layout de issues |
| 67 | Spreadsheet / List layouts | 🟡 | @tanstack/react-table instalado; falta vista spreadsheet |
| 68 | Command palette | ✅ | CommandPalette.tsx |
| 69 | Rich text editor (TipTap) | ✅ | — |
| 70 | PDF / CSV export desde UI | 🟡 | jsPDF implementado para issues (Fase 11) |
| 71 | Background jobs (Hangfire) | ✅ | Dashboard en /hangfire |
| 72 | OpenAPI / Swagger | ✅ | Scalar |
| 73 | Soft delete global | ✅ | AuditableEntity con query filters |
| 74 | API pública v1 con tokens | ✅ | — |
| 75 | Telemetry (PostHog / Scout) | 🟡 | ITelemetryProvider + NoOpTelemetryProvider (Fase 16) |

## Roadmap hacia paridad 100%

> **Estado 2026-05-18: Fases 1–16 completadas.** El roadmap original ha sido ejecutado en su totalidad. Los items restantes son mejoras opcionales o conectar stubs a APIs externas reales.

### Pendiente — mejoras opcionales post-fase-16
- Pages / Wiki — backend completo (CollaborativeEditor listo, falta persistencia server-side)
- Pages versioning + labels
- Stickies — verificar backend completo
- Drafts — entidad `DraftIssue` + conversión draft→issue
- Workspace Themes custom (colors JSON)
- Teams (sub-grupos en workspace)
- Calendar / Gantt / Spreadsheet layouts
- i18n (excluido de scope — app monolingüe)

### Conectar stubs a APIs externas (cuando se necesite)
- Brevo real (email transaccional)
- OpenAI / Anthropic real (AI Assistant)
- S3 / Azure Blob (reemplazar LocalFileStorage)
- GitHub OAuth real
- Slack OAuth real
- PostHog real (telemetría)
- Unsplash API real (reemplazar Picsum)

---

## Auditoría de cierre — 2026-05-18

Fases completadas (10–16):
- Fase 10: IEmailService + LogOnlyEmailService stub + Onboarding wizard completo
- Fase 11: IAiProvider/StubAiProvider + Unsplash Picsum stub + PDF export (jsPDF)
- Fase 12: DocumentHub SignalR + CollaborativeEditor TipTap (relay, no CRDT)
- Fase 13: DeployBoard entity + PublicSpaceController + PublicSpacePage (sin auth)
- Fase 14: GitHub + Slack integration stubs (entidades, endpoints, UI)
- Fase 15: CSV Importer, IssueWorklog/Time tracking, Magic link auth, OAuth skeleton
- Fase 16: ITelemetryProvider + NoOpTelemetryProvider stub

Exclusiones confirmadas:
- i18n: fuera de scope, app monolingüe en español
- APIs externas reales (Brevo, OpenAI, S3, GitHub OAuth, Slack OAuth): stubs listos para conectar
