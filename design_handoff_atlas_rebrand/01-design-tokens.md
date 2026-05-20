# 01 · Design Tokens — Atlas

## Filosofía
El codebase ya tiene un sistema de tokens muy completo en `src/index.css`. **NO renombramos variables** — solo reemplazamos sus valores OKLCH. Esto propaga automáticamente el rebranding a TODOS los componentes shadcn sin tocar archivos individuales.

---

## 🎨 Color — paleta base

| Token Atlas | Valor (hex) | Valor (OKLCH aprox) | Uso |
|---|---|---|---|
| `--bg-cream` | `#f5f3ee` | `oklch(0.9626 0.0058 91.51)` | Fondo principal de la app |
| `--bg-cream-2` | `#efece4` | `oklch(0.9381 0.0095 91.50)` | Fondo de paneles secundarios (sidebars) |
| `--bg-cream-3` | `#e8e4d8` | `oklch(0.9100 0.0148 90.83)` | Fondo cream oscuro (hover, chips) |
| `--ink` | `#1a1a1a` | `oklch(0.2178 0 0)` | Texto primario, fondo dark, brand mark |
| `--ink-soft` | `#2a2724` | `oklch(0.2778 0.0040 90.83)` | Texto secundario (más cálido que pure black) |
| `--ink-mute` | `#6b6660` | `oklch(0.4886 0.0072 87.95)` | Labels, eyebrows, metadata |
| `--ink-faint` | `#a8a299` | `oklch(0.7050 0.0125 89.22)` | Placeholder, disabled |
| `--ink-line` | `#d8d2c4` | `oklch(0.8595 0.0177 89.22)` | Borders fuertes |
| `--ink-line-soft` | `#e6e1d3` | `oklch(0.9043 0.0157 89.22)` | Borders sutiles, dividers |
| `--paper` | `#ffffff` | `oklch(1 0 0)` | Cards, modals, inputs |
| **`--terra`** | `#d97757` | `oklch(0.6798 0.1322 45.45)` | **ACENTO PRIMARIO — usar con disciplina** |
| `--terra-soft` | `#f4d9c8` | `oklch(0.8997 0.0506 45.45)` | Backgrounds suaves del acento |
| `--terra-deep` | `#b35a3d` | `oklch(0.5614 0.1247 39.62)` | Hover/active del acento, texto sobre soft |
| `--moss` | `#5d7256` | `oklch(0.4798 0.0399 135.04)` | Success, on-track |
| `--moss-soft` | `#d8e0d2` | `oklch(0.8761 0.0227 130.32)` | Background success |
| `--gold` | `#c79e3d` | `oklch(0.7012 0.1115 86.70)` | Warning, in-review |
| `--plum` | `#6b4a5c` | `oklch(0.4148 0.0395 358.40)` | Acento alternativo (audit, plum people) |

### Mapeo a tokens existentes en `frontend/src/index.css`

Reemplaza los valores OKLCH de estos tokens:

```css
/* Brand scale (light) — REEMPLAZAR */
--brand-default: oklch(0.6798 0.1322 45.45);  /* era azul, ahora terracota */
--brand-100: oklch(0.9626 0.0058 91.51);      /* cream */
--brand-200: oklch(0.9381 0.0095 91.50);      /* cream-2 */
--brand-300: oklch(0.9100 0.0148 90.83);      /* cream-3 */
--brand-700: oklch(0.6798 0.1322 45.45);      /* terra primary */
--brand-900: oklch(0.5614 0.1247 39.62);      /* terra deep / hover */
--brand-1000: oklch(0.4886 0.1247 39.62);     /* terra active */
--brand-1200: oklch(0.2178 0 0);              /* ink negro */

/* Neutral scale (light) — REEMPLAZAR para que sean cálidos en vez de fríos */
--neutral-100: oklch(0.9626 0.0058 91.51);    /* cream */
--neutral-200: oklch(0.9381 0.0095 91.50);    /* cream-2 */
--neutral-300: oklch(0.9100 0.0148 90.83);    /* cream-3 — antes era casi gris azulado */
--neutral-400: oklch(0.8595 0.0177 89.22);    /* ink-line */
--neutral-500: oklch(0.7050 0.0125 89.22);    /* ink-faint */
--neutral-900: oklch(0.4886 0.0072 87.95);    /* ink-mute */
--neutral-1100: oklch(0.2778 0.0040 90.83);   /* ink-soft */
--neutral-1200: oklch(0.2178 0 0);            /* ink primario */
--neutral-black: oklch(0.1689 0.0040 90.83);

/* Layer-2 (light) — derivados, deben actualizarse automáticamente, pero verifica */
--bg-canvas: var(--neutral-300);              /* cream-3 como fondo principal */
--bg-surface-1: var(--neutral-100);           /* cream para cards */
--bg-surface-2: var(--paper);                 /* paper blanco para cards elevadas */
```

### Estado / semánticos

Los siguientes ya existen en `index.css` — solo cambia sus valores para que combinen con cream:

```css
--green-700: oklch(0.4798 0.0399 135.04);     /* moss */
--amber-700: oklch(0.7012 0.1115 86.70);      /* gold */
--red-700: oklch(0.5814 0.1834 28.51);        /* rust (más cálido que rojo puro) */

/* Priority */
--priority-urgent: oklch(0.5814 0.1834 28.51);     /* rust */
--priority-high: oklch(0.6798 0.1322 45.45);       /* terra */
--priority-medium: oklch(0.7012 0.1115 86.70);     /* gold */
--priority-low: oklch(0.4148 0.0395 358.40);       /* plum (en vez de indigo) */
--priority-none: oklch(0.7050 0.0125 89.22);       /* ink-faint */
```

### Label colors
El sistema existente con 8 tonos de label (indigo/emerald/grey/crimson/yellow/orange/pink/purple) **se queda igual** en estructura. Los componentes Label de tu app pueden seguir usando estos tokens, solo asegúrate de que combinen visualmente sobre cream. Si quieres ajustarlos, suaviza la chroma en un 10% para que armonice mejor con la paleta cálida.

---

## 📏 Spacing — sistema de 4px

Los tokens de spacing de Tailwind v4 (1=4px, 2=8px, etc.) **no cambian**. Solo asegúrate de seguir la escala canónica de Atlas:

| Token | Valor | Uso |
|---|---|---|
| `s-1` | 4px | Gaps micro (íconos a texto en chips) |
| `s-2` | 8px | Padding de chips, gaps en pills |
| `s-3` | 12px | Gaps internos de cards |
| `s-4` | 16px | Padding de cards, gaps verticales |
| `s-6` | 24px | Separación entre secciones |
| `s-8` | 32px | Margins grandes de hero |
| `s-12` | 48px | Padding de páginas |
| `s-16` | 64px | Margins entre bloques mayores |

**Padding de página**: `--padding-page-x: 1.35rem;` ya está en index.css. Súbelo a `2rem` en desktop (1280+) para más aire. Mantén `1.35rem` en mobile.

---

## 🔲 Border radius

```css
--radius-sm: 3px;     /* checkboxes, chips muy pequeños */
--radius-md: 6px;     /* botones, inputs (default) */
--radius-lg: 8px;     /* cards */
--radius-xl: 10px;    /* hero blocks, dialogs */
--radius-pill: 9999px; /* tags pill, avatares */
```

El token `--radius` actual en index.css (`0.5rem` = 8px) está bien. **No lo cambies**, pero observa que los Buttons de shadcn usan `rounded-md` (6px) por default — eso encaja.

---

## 🌑 Sombras

Los `--shadow-raised-*` y `--shadow-overlay-*` actuales tienen tinte gris azulado `#292f3d`. **Cámbialos a un tinte cálido** para que se sientan en familia con el cream:

```css
/* Reemplazar #292f3d por #1a1a1a (ink) o un cálido neutro */
--shadow-raised-100: 0px 1px 6px -1px rgba(26,26,26,0.04), 0px 1px 4px 0px rgba(26,26,26,0.06);
--shadow-raised-200: 0px 1px 2px -1px rgba(26,26,26,0.06), 0px 1px 3px 0px rgba(26,26,26,0.05);
--shadow-raised-300: 0px 2px 4px -1px rgba(26,26,26,0.05), 0px 4px 6px -1px rgba(26,26,26,0.06);
--shadow-overlay-100: 0px 10px 10px -5px rgba(26,26,26,0.04), 0px 10px 40px -5px rgba(26,26,26,0.05);
--shadow-overlay-200: 0px 10px 10px -10px rgba(26,26,26,0.05), 0px 30px 60px -12px rgba(26,26,26,0.10);
```

---

## ✅ Checklist Fase 1 — Tokens

- [ ] `--brand-default` → terracota
- [ ] Toda la escala `--brand-*` actualizada
- [ ] `--neutral-*` actualizados (cream-warm en vez de gris-azulado)
- [ ] Estados `--green-*`, `--amber-*`, `--red-*` ajustados
- [ ] Priority tokens actualizados
- [ ] Sombras con tinte cálido
- [ ] `--bg-canvas` evaluado en runtime — debe ser cream-3
- [ ] Dev server arranca sin errores
- [ ] Screenshot del login muestra fondo cream y CTAs terracota
