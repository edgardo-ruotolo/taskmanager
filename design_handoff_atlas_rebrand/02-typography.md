# 02 · Tipografía — Atlas

## Stack

Tres familias, con roles bien definidos:

| Familia | Uso | Google Fonts URL |
|---|---|---|
| **Geist** | Todo: UI, body, headings | `Geist:wght@300;400;500;600;700;800;900` |
| **Geist Mono** | IDs, fechas, datos numéricos, código, eyebrows | `Geist+Mono:wght@400;500;600` |
| **Instrument Serif** | SOLO italic, como acento editorial en titulares | `Instrument+Serif:ital@0;1` |

---

## Instalación

### Opción A — Google Fonts (recomendado para empezar)

En `frontend/index.html` (antes de `<title>`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
```

### Opción B — @fontsource (mejor para prod, sin requests externos)

```bash
pnpm add @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource/instrument-serif
```

En `src/main.tsx`:
```ts
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
```

---

## Actualizar tokens en `src/index.css`

```css
@theme {
  --font-heading: "Geist", "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --font-body: "Geist", "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --font-code: "Geist Mono", "Geist Mono Variable", ui-monospace, monospace;
  --font-serif: "Instrument Serif", Georgia, serif;
}
```

Y en `body`:
```css
body {
  font-family: var(--font-body);
  font-feature-settings: "ss01", "cv11";  /* alternates más limpias en Geist */
  -webkit-font-smoothing: antialiased;
}
```

---

## Escala tipográfica

Ya existe la escala `--text-*` en index.css y está bien dimensionada. Solo asegúrate de aplicar los siguientes pesos y tracking en los componentes:

| Token | Tamaño | Peso | Letter-spacing | Uso |
|---|---|---|---|---|
| `text-9` | 9px | 500 | 0.15em | Eyebrow mono, micro-labels |
| `text-10` | 10px | 500 | 0.1em | Mono badges, IDs |
| `text-11` | 11px | 400 | 0 | Mono metadata |
| `text-12` | 12px | 400 | 0 | Captions, hints |
| `text-13` | 13px | 500 | -0.005em | Body de UI (botones, chips, table cells) |
| `text-14` | 14px | 400 | -0.005em | Body de párrafos cortos |
| `text-16` | 16px | 400 | -0.005em | Body de párrafos largos |
| `text-18` | 18px | 500 | -0.02em | Subtítulos en cards |
| `text-20` | 20px | 500 | -0.025em | Section headers |
| `text-24` | 24px | 500 | -0.03em | Card titles |
| `text-32` | 32px | 500 | -0.04em | Page titles (compactos) |
| `text-40` | 40px | 500 | -0.045em | Hero titles (settings, profile) |
| **56px+** | 56px+ | 500 | **-0.05em** | Hero displays (home, brand) |

### Regla crítica
**Cuanto más grande el texto, MÁS negativo el letter-spacing.** Es lo que da el "look editorial" de Atlas. Headings sin letter-spacing negativo se ven amateur.

---

## Reglas de uso

### Geist Sans — 95% del tiempo
- Todo el UI: botones, inputs, body text, navegación
- Headings, subtítulos, párrafos
- Labels de formularios

### Geist Mono — solo para "datos"
- IDs de issues (`ATL-247`)
- Fechas en formato técnico (`14:32:18`, `2026-09-18`)
- Métricas numéricas grandes (en heatmaps, gráficos)
- Eyebrows (small caps con letter-spacing wide)
- Códigos de error, hashes, tokens API
- Endpoints URL

### Instrument Serif — el acento editorial
**SOLO se usa italic.** Aparece en:
- Una palabra suelta dentro de un hero title (`"Buenos días, Marina." "Cuatro" issues vencen hoy`)
- Tagline en login (`El trabajo... compounded.`)
- Quotes de testimonios
- **NUNCA** en body de párrafo
- **NUNCA** en UI funcional (botones, inputs)
- **NUNCA** sin italic

Ejemplo correcto:
```jsx
<h1 className="font-heading text-[56px] font-medium tracking-[-0.05em]">
  El trabajo de tu equipo, <span className="font-serif italic text-terra-deep">en orden.</span>
</h1>
```

---

## Eyebrows (pattern común)

Pequeñas etiquetas mono uppercase que aparecen antes de headers. Patrón:

```jsx
<div className="font-mono text-[10.5px] font-medium tracking-[0.14em] uppercase text-ink-mute">
  02 · Tipografía
</div>
```

Crea un componente reutilizable:
```tsx
export const Eyebrow = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("font-mono text-[10.5px] font-medium tracking-[0.14em] uppercase text-ink-mute", className)}>
    {children}
  </div>
);
```

---

## Tabular numbers

Para tablas, KPIs, contadores, métricas — siempre usa `tnum`:
```jsx
<span className="font-mono tabular-nums">{count.toLocaleString()}</span>
```

Esto alinea los dígitos en columnas — crítico para que las tablas no "bailen".

---

## ✅ Checklist Fase 2 — Typography

- [ ] Geist instalado (Google Fonts o @fontsource)
- [ ] Geist Mono instalado
- [ ] Instrument Serif instalado
- [ ] Tokens `--font-heading`, `--font-body`, `--font-code`, `--font-serif` actualizados
- [ ] `font-feature-settings: "ss01", "cv11"` activado en `body`
- [ ] Componente `<Eyebrow>` creado en `src/components/ui/eyebrow.tsx`
- [ ] Headings de páginas tienen `tracking-[-0.04em]` o similar negativo
- [ ] Verificado: italics editoriales usan Instrument Serif (`font-serif italic`)
- [ ] Verificado: IDs, fechas, métricas usan Geist Mono
