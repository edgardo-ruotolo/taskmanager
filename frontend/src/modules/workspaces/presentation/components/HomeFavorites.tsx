import type React from 'react';
import { FileText, LayoutGrid, CheckSquare, Building2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FavoriteKind = 'page' | 'module' | 'view' | 'company';

interface FavoriteItem {
	id: string;
	kind: FavoriteKind;
	name: string;
	meta: string;
}

// ---------------------------------------------------------------------------
// Placeholder data
// TODO(backend): favorites endpoint — replace with real data from API
// ---------------------------------------------------------------------------

const PLACEHOLDER_FAVORITES: FavoriteItem[] = [
	{ id: 'f1', kind: 'page', name: 'Manual cierre fiscal · 2026', meta: '14 secciones' },
	{ id: 'f2', kind: 'module', name: 'Módulo · Reportes ejecutivos', meta: '23 / 56 issues' },
	{ id: 'f3', kind: 'view', name: 'Vista · Mis bloqueos', meta: '7 issues' },
	{ id: 'f4', kind: 'company', name: 'Grupo Cervantes', meta: 'company' },
	{ id: 'f5', kind: 'page', name: 'Checklist auditoría interna', meta: '8 secciones' },
	{ id: 'f6', kind: 'module', name: 'Módulo · Pagos y cobros', meta: '11 / 34 issues' },
];

// ---------------------------------------------------------------------------
// Icon per kind
// ---------------------------------------------------------------------------

function KindIcon({ kind }: { kind: FavoriteKind }): React.ReactElement {
	const cls = 'shrink-0 text-[var(--neutral-500)]';
	switch (kind) {
		case 'page':
			return <FileText size={14} className={cls} aria-hidden="true" />;
		case 'module':
			return <LayoutGrid size={14} className={cls} aria-hidden="true" />;
		case 'view':
			return <CheckSquare size={14} className={cls} aria-hidden="true" />;
		case 'company':
			return <Building2 size={14} className={cls} aria-hidden="true" />;
	}
}

// ---------------------------------------------------------------------------
// FavoriteRow
// ---------------------------------------------------------------------------

interface FavoriteRowProps {
	item: FavoriteItem;
}

function FavoriteRow({ item }: FavoriteRowProps): React.ReactElement {
	return (
		<div className="flex items-center gap-2.5 py-2 border-b border-[var(--neutral-300)] last:border-b-0 hover:bg-[var(--neutral-50)] -mx-1 px-1 rounded transition-colors group cursor-default">
			<KindIcon kind={item.kind} />
			<span className="flex-1 min-w-0 text-[13px] text-[var(--neutral-1000)] truncate tracking-[-0.01em]">
				{item.name}
			</span>
			<span className="shrink-0 font-mono text-[10.5px] text-[var(--neutral-500)] whitespace-nowrap">
				{item.meta}
			</span>
		</div>
	);
}

// ---------------------------------------------------------------------------
// HomeFavorites
// ---------------------------------------------------------------------------

export function HomeFavorites(): React.ReactElement {
	// TODO(backend): favorites endpoint — currently using placeholder data
	const items = PLACEHOLDER_FAVORITES;

	return (
		<div className="flex flex-col">
			{items.map((item) => (
				<FavoriteRow key={item.id} item={item} />
			))}
		</div>
	);
}
