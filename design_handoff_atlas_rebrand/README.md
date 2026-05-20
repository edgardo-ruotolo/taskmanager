# Atlas — Rebranding Handoff para Claude Code

> **Para Claude Code:** este es un paquete de handoff de diseño para implementar el rebranding "Atlas" en el frontend del proyecto TaskManager (React + TypeScript + Vite + Tailwind v4 + shadcn/ui).

---

## ⚠️ Importante: qué son estos archivos

La carpeta `design-reference/` contiene un **prototipo HTML** que muestra el look-and-feel final deseado. **NO es código para copiar tal cual** — está hecho con React + Babel inline, estilos inline, y un Design Canvas para presentación.

**Tu tarea como Claude Code:** recrear este diseño en el codebase real (`frontend/`), respetando la arquitectura existente:
- Módulos en `src/modules/<feature>/presentation/`
- Componentes shadcn/ui en `src/components/ui/`
- Tokens CSS en `src/index.css`
- Tailwind v4
- React 19 + TypeScript

No reescribas la arquitectura — **reemplaza los valores de tokens** y refactoriza visualmente.

---

## Fidelidad

**Hi-fi (pixel-perfect).** Colores, tipografías, espaciado y micro-interacciones están definidos exactamente. Replica con precisión.

---

## 📋 Orden de lectura

1. **Este README** — overview + prompt para Claude Code
2. **`01-design-tokens.md`** — todos los tokens de color, spacing, radii, sombras (con mapping a las variables existentes en `index.css`)
3. **`02-typography.md`** — fonts + escala tipográfica
4. **`03-components.md`** — cambios por componente shadcn/ui
5. **`04-screens.md`** — especificaciones por pantalla
6. **`05-implementation-plan.md`** — plan de migración por fases
7. **`design-reference/`** — el prototipo HTML completo (ábrelo en navegador para verlo)

---

## 🎨 Resumen ejecutivo del rebranding

- **Marca**: "Atlas" (nombre nuevo, opcional — puedes mantener "TaskManager" si el cliente decide)
- **Paleta**: cream `#f5f3ee` + ink `#1a1a1a` + terracota `#d97757` (en vez de los azules fríos actuales)
- **Tipografía**: Geist Sans + Geist Mono + Instrument Serif (italic, como acento editorial)
- **Personalidad**: editorial, cálida, profesional. Para contadores e ingenieros de sistemas.
- **Inspiración**: antigravity.google (mucho aire, tipo grande, monocromo con un acento)

---

## 🚀 Prompt para Claude Code (PEGA ESTO)

Copia este bloque y pégalo en Claude Code una vez que esté trabajando en `frontend/`:

```text
Voy a implementar un rebranding completo llamado "Atlas" en este frontend.

CONTEXTO:
- En la carpeta design_handoff_atlas_rebrand/ tienes la documentación completa
- design-reference/index.html es el prototipo visual (ábrelo para ver el resultado esperado)
- No reescribas la arquitectura de modules — solo refactoriza visualmente y reemplaza tokens
- Mantén el stack: React 19 + TS + Tailwind v4 + shadcn/ui + Radix

TAREA INICIAL — Fase 1 (Foundations):
1. Lee design_handoff_atlas_rebrand/README.md y 01-design-tokens.md
2. Reemplaza los valores de los tokens en src/index.css según el mapping documentado
   — NO renombres las variables (--bg-canvas, --ink-primary, etc. se quedan), solo cambia sus valores OKLCH
   — Esto debe propagarse automáticamente a todos los componentes vía Tailwind
3. Instala las fonts: Geist, Geist Mono, Instrument Serif (vía @fontsource o Google Fonts)
   — Actualiza --font-heading, --font-body, --font-code en index.css
4. Verifica que el dev server arranque sin errores y que NINGÚN componente se haya roto
5. Toma un screenshot del estado actual del login para confirmar que los tokens se aplicaron

NO toques pantallas individuales todavía. Solo foundations. Cuando termines, pídeme review.

REGLAS:
- Tipografía: usa Geist Sans para todo. Geist Mono solo para IDs, fechas, datos numéricos, código. Instrument Serif italic solo para acentos editoriales en titulares (palabras sueltas, no body).
- Color: el acento terracota (#d97757) se usa CON DISCIPLINA (<5% del píxel pintado). Es señalador, no decorativo.
- Iconografía: stroke 1.5px, outline. Filled solo para estados activos / pips.
- Densidad: listas densas, detalle respirado.
- Spacing: sistema de 4px. Padding generoso en hero/detail; compacto en tablas.
- Dark mode: implementarlo en una Fase posterior. Por ahora, light first.

CONVENCIONES DEL REPO:
- Cada feature está en src/modules/<feature>/presentation/{pages,components,layouts}/
- Usa los componentes shadcn de src/components/ui/ (no reinventes ruedas)
- Tipos compartidos en src/shared/

Confirmas que entiendes antes de empezar?
```

---

## 📦 Contenido del paquete

```
design_handoff_atlas_rebrand/
├── README.md                       ← ESTE ARCHIVO (overview + prompt)
├── 01-design-tokens.md             ← Colores, spacing, radii, sombras
├── 02-typography.md                ← Fonts + escala + reglas de uso
├── 03-components.md                ← Cambios por componente shadcn
├── 04-screens.md                   ← Especificación por pantalla (los 19 módulos)
├── 05-implementation-plan.md       ← Plan por fases
└── design-reference/               ← El prototipo HTML completo
    ├── index.html                  ← Punto de entrada — abre en navegador
    └── src/                        ← Todos los .jsx con las pantallas
```

---

## ❓ Preguntas frecuentes

**¿Nombre del producto?** Por ahora el prototipo usa "Atlas", pero también propone Cadence, Ledger, Plinth, Foliant, Vector. **Decide tú** y dile a Claude Code qué nombre usar — el sistema de tokens es independiente del nombre.

**¿Modo oscuro?** El prototipo es light-first. Las variables en `index.css` ya tienen un `@variant dark` configurado — Claude Code puede ampliar el dark mode en una fase posterior siguiendo la misma paleta.

**¿Qué hago si Claude Code se atora?** Pídele que abra `design-reference/index.html` en el preview y compare contra lo que está implementando. Cada pantalla del prototipo tiene un equivalente directo en `frontend/src/modules/`.

**¿Implementación en una sola sesión?** No es viable — son ~45 pantallas. El plan en `05-implementation-plan.md` está dividido en 6 fases que toman entre 1 y 5 sesiones cada una.
