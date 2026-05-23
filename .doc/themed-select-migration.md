# Plan — Migración a `ThemedSelect`

**Estado:** pendiente
**Fecha de creación:** 2026-05-22
**Componente:** `frontend/src/shared/components/ThemedSelect.tsx`
**Ya aplicado en:** `frontend/src/modules/workspaces/presentation/pages/WorkspaceSettingsPage.tsx` (tab Miembros).

## Contexto

El componente shadcn `Select` (`frontend/src/components/ui/select.tsx`) usa tokens default (`bg-popover`, `bg-background`, `border-input`, `focus:bg-accent`) que no están tematizados para la paleta dark de TaskManager. Resultado: cuando se usa directo, el dropdown queda con fondo claro y sin contraste.

Para "arreglarlo", el resto de la app repite a mano las mismas clases en cada uso:

- `<SelectTrigger className="bg-layer-1 border-subtle text-primary">`
- `<SelectContent className="bg-layer-1 border-subtle">`
- `<SelectItem className="text-primary focus:bg-layer-2">`

Eso ocurre en 8 archivos identificados, con riesgo de inconsistencia visual (cualquier nuevo `Select` sin esas clases se ve mal).

`ThemedSelect` encapsula esas clases y expone una API declarativa basada en `options`.

## API resumida

```ts
interface ThemedSelectOption<TValue extends string = string> {
    value: TValue;
    label: string;
    icon?: React.ElementType;
    disabled?: boolean;
}

interface ThemedSelectProps<TValue extends string = string> {
    value: TValue;
    onValueChange: (value: TValue) => void;
    options: readonly ThemedSelectOption<TValue>[];
    placeholder?: string;
    disabled?: boolean;
    size?: 'sm' | 'md';                   // default 'md'
    triggerClassName?: string;
    contentClassName?: string;
    id?: string;
    ariaLabel?: string;
    align?: 'start' | 'center' | 'end';   // default 'start'
}
```

Genérico tipado: `<ThemedSelect<MiUnion> value={v} onValueChange={setV} ... />` elimina el `as MiUnion` que hoy se hace en cada `onValueChange`.

## Archivos pendientes de migrar

1. `frontend/src/modules/projects/presentation/components/settings/ProjectMembersTab.tsx`
2. `frontend/src/modules/projects/presentation/components/settings/ProjectStateGroupTab.tsx`
3. `frontend/src/modules/admin/presentation/pages/GodModeUsersPage.tsx`
4. `frontend/src/modules/admin/presentation/pages/GodModeWorkspacesPage.tsx`
5. `frontend/src/modules/admin/presentation/pages/GodModeStatesPage.tsx`
6. `frontend/src/modules/modules/presentation/components/CreateModuleDialog.tsx`
7. `frontend/src/modules/issues/presentation/components/CreateIssueDialog.tsx`
8. `frontend/src/modules/recurring/presentation/components/RecurringForm.tsx`

## Cómo migrar

### Patrón actual (antes)

```tsx
<Select value={value} onValueChange={onChange}>
    <SelectTrigger className="bg-layer-1 border-subtle text-primary">
        <SelectValue />
    </SelectTrigger>
    <SelectContent className="bg-layer-1 border-subtle">
        {options.map((o) => (
            <SelectItem key={o.id} value={o.id} className="text-primary focus:bg-layer-2">
                {o.label}
            </SelectItem>
        ))}
    </SelectContent>
</Select>
```

### Después

```tsx
<ThemedSelect
    value={value}
    onValueChange={onChange}
    options={options.map((o) => ({ value: o.id, label: o.label }))}
/>
```

### Variantes

- **Inline en tablas/filas:** agregar `size="sm"` y `triggerClassName="w-[140px]"` (o el ancho que corresponda).
- **Dentro de RHF `FormField`:** envolver el `ThemedSelect` con `<FormControl>` (igual que se hace con `Input`); no usar `FormControl` por dentro de `SelectTrigger` como pide shadcn original — el wrapper ya lo simplifica.
- **Form con `field` de RHF:** `value={field.value}` `onValueChange={field.onChange}`. Si el tipo del schema es un literal union (Zod `z.enum([...])`), pasar `<ThemedSelect<MiUnion> ...>` para evitar casts.
- **Aria:** para selects sin label visible, pasar `ariaLabel="..."`.
- **Icono por opción:** `options={[{ value: 'todo', label: 'Por hacer', icon: Circle }]}` — se renderiza a tamaño 14 a la izquierda del label.

## Excepciones (no migrar por ahora)

- **`SelectGroup` / `SelectLabel`:** el wrapper no expone agrupación. Si un caso lo necesita, extender `ThemedSelect` con prop `groups` antes de migrar, o dejar shadcn directo.
- **`SelectItem` con JSX complejo** (más que un label + icono): usar `icon` o extender el wrapper para aceptar `render: () => ReactNode`.

## Estrategia sugerida de roll-out

1. Migrar en bloques temáticos (admin → projects → modules → issues → recurring) para que cada PR sea revisable.
2. Después de cada bloque: `pnpm biome check` + smoke test visual en la pantalla afectada.
3. Cuando los 8 archivos estén migrados, considerar marcar como `@deprecated` o reescribir el `select.tsx` de shadcn para que `bg-popover`/`bg-background` ya apunten por defecto a los tokens del proyecto vía `tailwind.config` o `index.css`. Eso elimina toda repetición futura.

## Verificación por archivo

Después de migrar uno:

- Buscar referencias residuales: `grep -n "bg-layer-1 border-subtle\|focus:bg-layer-2" <archivo>` debería quedar vacío para los selects.
- Type-check: `npx tsc --noEmit -p tsconfig.app.json` no debe sumar errores nuevos.
- Lint: `pnpm biome check <archivo>` sin warnings nuevos.
- Visual: abrir el dropdown y verificar que el fondo es `bg-surface-2`, las opciones tienen contraste y la opción seleccionada queda con `text-accent-primary`.
