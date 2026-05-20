# 05 · Plan de implementación por fases

Implementar este rebranding **TODO de un jalón es imposible** — son ~50 pantallas. Aquí va el orden que minimiza riesgo y maximiza valor temprano.

---

## Fase 1 — Foundations (1-2 sesiones de Claude Code)

**Objetivo:** que TODA la app cambie de paleta sin tocar componentes individuales.

### Tareas
1. Instalar fonts (Geist, Geist Mono, Instrument Serif)
2. Actualizar tokens en `src/index.css` según `01-design-tokens.md`
3. Actualizar `--font-heading`, `--font-body`, `--font-code`, `--font-serif`
4. Ajustar sombras a tinte cálido
5. Crear componentes shared nuevos:
   - `src/components/ui/eyebrow.tsx`
   - `src/components/ui/state-pip.tsx`
   - `src/components/ui/priority-dot.tsx`

### Criterio de éxito
- Dev server arranca sin errores
- TODA la app se ve cream + ink + terracota (aunque algunas pantallas se vean "raras" todavía)
- No hay regresiones funcionales
- Screenshot del login: fondo cream, botón primario ink, accent terracota visible

---

## Fase 2 — Shell & navigation (1 sesión)

**Objetivo:** el contenedor de la app (sidebar, topbar) se ve completamente Atlas.

### Tareas
1. Refactorizar `WorkspaceLayout.tsx` — sidebar de 232px, cream-2 background, terra accent line
2. Crear/refactorizar `<Topbar>` para todas las páginas autenticadas
3. Implementar Command Palette (⌘K) — usa `cmdk` (ya está en deps)
4. Refactorizar mobile responsive del sidebar (drawer pattern)

### Criterio de éxito
- Sidebar visualmente idéntico al prototipo
- ⌘K abre el command palette
- Navegación entre módulos funciona

---

## Fase 3 — Componentes shadcn (1-2 sesiones)

**Objetivo:** que cada `<Button>`, `<Card>`, `<Badge>`, etc. se vea Atlas.

### Tareas
Siguiendo `03-components.md`, ajustar variants en:
- Button (añadir `accent` variant)
- Input
- Badge (refactorizar tones)
- Card
- Tabs (los dos estilos)
- Dialog / Sheet
- DropdownMenu / Popover
- Table

### Criterio de éxito
- Visitar cualquier página existente: los componentes ya se ven Atlas
- Tests visuales (Storybook si lo tienes, o screenshots manuales) pasan

---

## Fase 4 — Pantallas críticas (2-3 sesiones)

**Objetivo:** las 8 pantallas que tus usuarios ven más se sienten 100% pixel-perfect.

### Orden de prioridad (impacto × frecuencia de uso)
1. **Login + Register + Forgot/Reset** (primer toque, primera impresión)
2. **Home / Dashboard** (cada mañana, cada usuario)
3. **Issues — List view** (la pantalla más usada del producto)
4. **Issues — Kanban** (segunda más usada)
5. **Issue Detail** (donde pasan el día)
6. **Sidebar/Topbar refinement** (ya hecho en Fase 2, ajustes finos)
7. **Inbox** (notificaciones diarias)
8. **Command Palette** (power users)

### Criterio de éxito
- Compara cada una lado-a-lado con el prototipo en `design-reference/index.html`
- Diferencias < 5px en cualquier elemento

---

## Fase 5 — Pantallas de gestión (2-3 sesiones)

**Objetivo:** ya que el core está hecho, completar las pantallas administrativas.

### Pantallas
- Companies list + Company settings
- Cycles overview + Cycle detail (con burndown)
- Modules overview + Module detail
- Pages list + Page editor (Tiptap ya está integrado — solo refactor visual)
- Analytics (con charts — usar Recharts que ya está en deps)
- Issues Calendar + Gantt views
- Intake / Triage
- Views list + View detail
- Issue types
- **Recurrentes list + detail** ← esta es la que pediste explícitamente
- Archives + Estimates

### Criterio de éxito
- Cada feature module tiene su pantalla rediseñada
- Funcionalidad existente intacta

---

## Fase 6 — Settings, admin, modos extras (1-2 sesiones)

**Objetivo:** cerrar.

### Pantallas
- Workspace settings (estados, etiquetas, webhooks, tokens, equipos, integraciones, importer)
- Profile
- Public space
- Deploy boards
- God Mode (3 pantallas)
- **Dark mode** — duplicar la lógica de `@variant dark` en `index.css` para que los tokens también funcionen en dark

### Criterio de éxito
- 100% de las rutas en `App.tsx` están rediseñadas
- Dark mode funciona con un toggle

---

## Resumen de esfuerzo

| Fase | Tiempo estimado | Riesgo |
|---|---|---|
| 1 — Foundations | 1-2 sesiones | Alto (puede romper cosas si tokens no propagan bien) |
| 2 — Shell | 1 sesión | Medio |
| 3 — Componentes | 1-2 sesiones | Bajo |
| 4 — Pantallas críticas | 2-3 sesiones | Medio |
| 5 — Gestión | 2-3 sesiones | Bajo |
| 6 — Settings + dark mode | 1-2 sesiones | Bajo |
| **TOTAL** | **8-13 sesiones de Claude Code** | — |

A 1-2 horas por sesión, eso es **~2-3 semanas de trabajo** a un ritmo realista (no full-time).

---

## Consejos para trabajar con Claude Code

1. **Una fase por sesión.** No le pidas todo de un jalón. Si pides "implementa Atlas completo" se va a perder y vas a tener un diff masivo imposible de revisar.

2. **Pídele screenshots después de cada cambio importante.** Claude Code puede correr el dev server y tomar screenshots. Hazle el hábito de mostrarte el "before/after".

3. **Commit por fase.** Cada fase = un commit (o un PR) en main. Esto te da rollback granular si algo se rompe.

4. **Prueba en runtime, no solo build.** Después de Fase 1, abre el navegador. Si algún componente shadcn revienta porque cambiaste un token mal, verás un error de runtime, no de build.

5. **Mantén el dev server corriendo.** Las propagaciones de tokens Tailwind v4 a veces requieren restart. Si algo se ve raro, mata el server y vuelve a levantarlo.

6. **El prototipo está en otra carpeta — Claude Code lo puede ABRIR.** Pídele que abra `design_handoff_atlas_rebrand/design-reference/index.html` en su preview para que vea el target.

---

## Cuando algo no quede igual

Si después de implementar una pantalla, Claude Code dice "ya está" pero no se ve igual:

1. Pídele que abra el prototipo en su preview
2. Pídele que abra el dev server en otro tab del preview
3. Pídele que tome screenshots de los dos a la misma resolución
4. Pídele que liste las diferencias visuales una por una
5. Iteren

Este flujo de "verificación visual" suele convertir un 80% → 99% sin frustración.
