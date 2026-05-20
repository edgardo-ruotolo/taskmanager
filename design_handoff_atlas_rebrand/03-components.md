# 03 · Cambios por componente shadcn/ui

> Los componentes ya están en `src/components/ui/`. **No los reescribas** — solo ajusta los class variants donde sea necesario para que reflejen el look de Atlas.

---

## Button (`button.tsx`)

### Variants existentes a mantener
- `default` (primary)
- `secondary`
- `ghost`
- `destructive`
- `outline`
- `link`

### Cambios visuales

**Primary (`default`):**
- Background: `bg-ink` (negro tinta) — NO el azul brand
- Text: `text-paper` (cream-white)
- Hover: ligero lift de luminance (no cambia de color)
- Border-radius: `rounded-md` (6px)
- Padding default: `px-3.5 py-2` (más ajustado que el típico shadcn)
- Font weight: 500 (medium), no 600

**Accent (NUEVO variant — terracota):**
Crea un variant nuevo para CTAs muy específicos (AI, highlight actions):
```ts
accent: "bg-terra text-paper hover:bg-terra-deep"
```
Úsalo con disciplina — máx 1 por pantalla.

**Secondary:**
- Background: `bg-paper`
- Border: `border-ink-line` (no el `border-strong` actual)
- Text: `text-ink`
- Hover: `bg-cream-2`

**Ghost:**
- Sin background ni border en reposo
- Hover: `bg-cream-2`
- Text: `text-ink-soft`

### Tamaños
- `sm`: `text-xs px-2.5 py-1.5 h-7` — muy compacto, para toolbars
- `md` (default): `text-sm px-3.5 py-2 h-8`
- `lg`: `text-sm px-5 py-2.5 h-10` — para hero CTAs

---

## Input (`input.tsx`)

- Background: `bg-paper`
- Border: `border-ink-line`
- Focus: `border-ink` (1.5px) + `ring-4 ring-terra/12` (terracota suave)
- Border-radius: `rounded-md`
- Padding: `px-3.5 py-2.5`
- Placeholder: `text-ink-mute` (no faint, queremos que se lea)
- Text: `text-sm` con `tracking-[-0.005em]`

---

## Badge / Chip (`badge.tsx`)

Atlas usa tres tipos:

### Neutral chip (default)
```ts
"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border border-ink-line bg-transparent text-[11px] font-medium text-ink-soft"
```

### Solid chip
```ts
"... bg-cream-3 border-transparent text-ink"
```

### Accent chip (terracota suave)
```ts
"... bg-terra-soft border-transparent text-terra-deep"
```

### Moss chip (success)
```ts
"... bg-moss-soft border-transparent text-moss"
```

### Patrón con dot
Cuando el chip representa un estado o etiqueta de color, ponle un dot a la izquierda:
```jsx
<Badge>
  <span className="w-1.5 h-1.5 rounded-full bg-moss" />
  Done
</Badge>
```

---

## Avatar (`avatar.tsx`)

- Border-radius: `rounded-full` (siempre)
- Tamaños recomendados: 16, 20, 24, 28, 32, 40, 48, 64, 120
- Background: depende de la persona (asigna color por hash del nombre o de un set: terra, moss, plum, gold, ink)
- Iniciales: 2 chars, uppercase, weight 600, letter-spacing -0.02em
- Cuando se apilan (AvatarGroup), margen negativo de 35% del size

---

## Card (`card.tsx`)

- Background: `bg-paper`
- Border: `border border-ink-line-soft`
- Border-radius: `rounded-lg` (8px) — no `rounded-xl`
- Shadow: `shadow-raised-100` por default (sutil)
- Padding header: `p-4`
- Padding content: `p-4 pt-0`
- Padding footer: `p-4 pt-0`

---

## Tabs (`tabs.tsx`)

Hay DOS estilos según contexto:

### Tabs principales (página de settings, inbox filters)
Underline style:
```jsx
<TabsList className="border-b border-ink-line bg-transparent gap-1">
  <TabsTrigger className="px-4 py-2.5 border-b-2 border-transparent data-[state=active]:border-terra data-[state=active]:text-ink data-[state=inactive]:text-ink-mute rounded-none">
    Tab name
  </TabsTrigger>
</TabsList>
```

### Tabs segmentados (view switcher de issues: List/Board/Calendar/Gantt)
```jsx
<TabsList className="bg-cream-2 border border-ink-line-soft rounded-md p-[3px] gap-0">
  <TabsTrigger className="px-2.5 py-1 text-xs data-[state=active]:bg-paper data-[state=active]:shadow-sm rounded-[4px]">
    List
  </TabsTrigger>
</TabsList>
```

---

## Dialog / Sheet

- Border-radius: `rounded-xl` (10px)
- Background: `bg-paper`
- Shadow: `shadow-overlay-200`
- Padding: `p-6` (header), `p-6 pt-0` (content)
- Backdrop: `bg-ink/45` (no negro puro)

---

## DropdownMenu / Popover / CommandMenu

- Background: `bg-paper`
- Border: `border border-ink-line-soft`
- Border-radius: `rounded-lg`
- Shadow: `shadow-overlay-100`
- Item padding: `px-2.5 py-1.5`
- Item hover: `bg-cream-2`
- Item selected: `bg-cream border-l-2 border-terra` (acento sutil)
- Separator: `border-ink-line-soft`

---

## Checkbox / Radio / Switch

- Accent color: ink (negro tinta) en reposo
- Checked state: `bg-ink` con check blanco
- Switch ON: `bg-ink` (no terra — el switch es funcional, no decorativo)
- Border-radius checkbox: `rounded-[3px]`

---

## Table (`table.tsx`)

- Header background: `bg-cream`
- Header text: `font-mono text-[10px] uppercase tracking-[0.1em] text-ink-mute`
- Row border-bottom: `border-ink-line-soft`
- Row hover: `bg-cream/50`
- Cell padding: `px-4 py-3`
- Selected row: `bg-terra/4`

---

## Progress

- Track: `bg-ink-line-soft`
- Fill: `bg-ink` por default
- Height: 6px regular, 4px compact
- Border-radius: `rounded-full`

Para barras con contexto de status:
- On-track / done: `bg-moss`
- In-progress: `bg-terra`
- At-risk: `bg-gold`
- Overdue: `bg-rust`

---

## State Pips (nuevo componente)

Crear `src/components/ui/state-pip.tsx`. Los pips son círculos SVG segmentados que muestran el estado de un issue (backlog/todo/in-progress/done/cancelled). Ver el código en `design-reference/src/icons.jsx` — copia el componente `StatePip`.

---

## Priority Dots (nuevo componente)

Similar — círculos pequeños con borde/fill según prioridad. Copia `PrioDot` de `design-reference/src/icons.jsx`.

---

## Sidebar (rediseño)

El sidebar actual probablemente vive en `src/modules/workspaces/presentation/layouts/WorkspaceLayout.tsx`. Refactor:

- Background: `bg-cream-2` (no `bg-surface-2`)
- Width: 232px (no más, no menos — es lo que mantiene la jerarquía visual)
- Padding: 8px horizontal en items
- Item active: `bg-paper` + `border-l-2 border-terra` (margen negativo de -2px para que la línea esté pegada al borde)
- Item hover: `bg-cream-3` muy sutil
- Item font: 13px, weight 400 (500 si active)
- Eyebrows de sección (Workspace, Your teams): mono, uppercase, 10.5px, tracking 0.14em
- Workspace switcher arriba: card con `bg-paper` + border + `rounded-md`
- User panel abajo: avatar + nombre + status dot (moss = online)

---

## ✅ Checklist Fase 3 — Components

- [ ] Button: variants ajustados (primary=ink, accent NUEVO=terra)
- [ ] Input: focus ring terracota
- [ ] Badge: tres tones (neutral, solid, accent) + variantes con dot
- [ ] Avatar: colores asignables (terra, moss, plum, gold, ink)
- [ ] Card: shadow sutil, paper background, border ink-line-soft
- [ ] Tabs: dos estilos (underline vs segmentado)
- [ ] StatePip component creado
- [ ] PrioDot component creado
- [ ] Eyebrow component creado
- [ ] Sidebar refactorizado con cream-2 + terra accent line
