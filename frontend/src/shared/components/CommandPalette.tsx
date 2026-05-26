import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    Settings,
    Bell,
    BarChart2,
    User,
    GitBranch,
    BoxSelect,
    Loader2,
    Plus,
    Sparkles,
    UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { useActiveWorkspace } from '@/modules/workspaces/application/use-active-workspace';
import { useSearch } from '@/modules/search/application/use-search';
import { StatePip } from '@/components/ui/state-pip';

interface NavItem {
    label: string;
    icon: React.ReactNode;
    path: string;
}

function useDebounce(value: string, delay: number): string {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}

export const CommandPalette = (): React.ReactElement => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const activeWorkspace = useActiveWorkspace();
    const slug = activeWorkspace?.slug ?? '';

    const debouncedQuery = useDebounce(query, 300);
    const { data: searchResults, isFetching } = useSearch(slug, debouncedQuery);

    // ⌘K / Ctrl+K toggle
    useEffect(() => {
        const handler = (e: KeyboardEvent): void => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
            // ⌘I shortcut for AI summary (stub)
            if ((e.metaKey || e.ctrlKey) && e.key === 'i' && open) {
                e.preventDefault();
                toast.info('IA: próximamente');
            }
            // C shortcut for new issue when palette is open
            if (e.key === 'c' && open && !query) {
                setOpen(false);
                void navigate(`/${slug}/projects`);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, query, slug, navigate]);

    useEffect(() => {
        if (!open) setQuery('');
    }, [open]);

    const navItems: NavItem[] = [
        { label: 'Ir a Proyectos', icon: <Building2 size={16} />, path: `/${slug}/projects` },
        { label: 'Analíticas', icon: <BarChart2 size={16} />, path: `/${slug}/analytics` },
        { label: 'Notificaciones', icon: <Bell size={16} />, path: `/${slug}/notifications` },
        { label: 'Configuración', icon: <Settings size={16} />, path: `/${slug}/settings` },
        { label: 'Mi Perfil', icon: <User size={16} />, path: `/${slug}/profile` },
    ];

    const handleSelect = (path: string): void => {
        setOpen(false);
        void navigate(path);
    };

    const hasResults = searchResults && (
        searchResults.issues.length > 0 ||
        searchResults.cycles.length > 0 ||
        searchResults.modules.length > 0 ||
        searchResults.views.length > 0 ||
        searchResults.labels.length > 0
    );

    const isSearchMode = debouncedQuery.length >= 2;
    // AI mode: input starts with "?"
    const isAiMode = query.startsWith('?');

    const totalMatches =
        (searchResults?.issues.length ?? 0) +
        (searchResults?.cycles.length ?? 0) +
        (searchResults?.modules.length ?? 0);

    const workspaceInitials = activeWorkspace?.name
        ? activeWorkspace.name.slice(0, 2).toUpperCase()
        : '—';

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            {/* Workspace avatar zone */}
            <div className="flex items-center gap-2.5 px-3 py-2 border-b border-[var(--neutral-300)]">
                <span
                    className="w-6 h-6 rounded-md bg-[var(--neutral-1200)] flex items-center justify-center text-[10px] font-bold text-[var(--text-on-dark)] shrink-0"
                    role="img"
                    aria-label={`Workspace: ${activeWorkspace?.name ?? ''}`}
                >
                    {workspaceInitials}
                </span>
                <span className="text-[12px] font-medium text-[var(--neutral-800)] truncate">
                    {activeWorkspace?.name ?? 'Workspace'}
                </span>
                <span className="ml-auto font-mono text-[10px] text-[var(--neutral-500)] tracking-[0.08em] uppercase">
                    /{slug}
                </span>
            </div>
            <CommandInput
                placeholder="Escribe un comando o busca…"
                value={query}
                onValueChange={setQuery}
            />
            <CommandList className="max-h-[460px] p-2">
                {/* AI mode */}
                {isAiMode && (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
                        <Sparkles size={22} className="text-[var(--brand-700)]" aria-hidden="true" />
                        <p className="text-[13.5px] font-medium text-[var(--neutral-1200)] tracking-[-0.01em]">
                            IA puede ayudar
                        </p>
                        <p className="text-[12px] text-[var(--neutral-600)] max-w-xs leading-relaxed">
                            Escribe tu pregunta después del "?" y la IA te ayudará a encontrar issues, resumir ciclos o sugerir acciones.
                        </p>
                        <button
                            type="button"
                            onClick={() => toast.info('IA: próximamente')}
                            className="mt-1 text-[11px] font-mono text-[var(--brand-700)] underline underline-offset-2 hover:text-[var(--brand-900)] transition-colors"
                        >
                            próximamente
                        </button>
                    </div>
                )}

                {/* Search results mode */}
                {!isAiMode && isSearchMode && (
                    <>
                        {isFetching && (
                            <div className="flex items-center justify-center py-6 text-xs text-[var(--neutral-600)] gap-2 font-mono uppercase tracking-[0.1em]">
                                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                                Buscando…
                            </div>
                        )}
                        {!isFetching && totalMatches > 0 && (
                            <div className="px-2 pb-1.5 pt-0.5">
                                <span className="font-mono text-[10.5px] text-[var(--neutral-500)] uppercase tracking-[0.1em]">
                                    Coincidencias · {totalMatches}
                                </span>
                            </div>
                        )}
                        {!isFetching && !hasResults && (
                            <CommandEmpty>Sin resultados para "{debouncedQuery}"</CommandEmpty>
                        )}
                        {searchResults && searchResults.issues.length > 0 && (
                            <CommandGroup heading={`Tareas · ${searchResults.issues.length}`}>
                                {searchResults.issues.map((issue) => (
                                    <CommandItem
                                        key={issue.id}
                                        onSelect={() => handleSelect(`/${slug}/projects/${issue.projectId}/issues/${issue.id}`)}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className="w-5 flex justify-center">
                                            <StatePip state="backlog" size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13.5px] font-medium tracking-[-0.01em] truncate">{issue.title}</div>
                                            <div className="font-mono text-[11px] text-[var(--neutral-600)] mt-0.5">
                                                #{issue.sequenceId}
                                            </div>
                                        </div>
                                        <span className="font-mono text-[10px] text-[var(--brand-700)] opacity-0 group-aria-selected:opacity-100 transition-opacity shrink-0">
                                            ↵ ir
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {searchResults && searchResults.cycles.length > 0 && (
                            <CommandGroup heading={`Ciclos · ${searchResults.cycles.length}`}>
                                {searchResults.cycles.map((cycle) => (
                                    <CommandItem
                                        key={cycle.id}
                                        onSelect={() => handleSelect(`/${slug}/projects/${cycle.projectId}/cycles`)}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className="w-5 flex justify-center text-[var(--brand-700)]">
                                            <GitBranch size={14} aria-hidden="true" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13.5px] font-medium tracking-[-0.01em] truncate">{cycle.name}</div>
                                            <div className="font-mono text-[11px] text-[var(--neutral-600)] mt-0.5 uppercase tracking-wider">
                                                Ciclo
                                            </div>
                                        </div>
                                        <span className="font-mono text-[10px] text-[var(--brand-700)] opacity-0 group-aria-selected:opacity-100 transition-opacity shrink-0">
                                            ↵ ir
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {searchResults && searchResults.modules.length > 0 && (
                            <CommandGroup heading={`Módulos · ${searchResults.modules.length}`}>
                                {searchResults.modules.map((mod) => (
                                    <CommandItem
                                        key={mod.id}
                                        onSelect={() => handleSelect(`/${slug}/projects/${mod.projectId}/modules`)}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className="w-5 flex justify-center text-[var(--neutral-600)]">
                                            <BoxSelect size={14} aria-hidden="true" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13.5px] font-medium tracking-[-0.01em] truncate">{mod.name}</div>
                                            <div className="font-mono text-[11px] text-[var(--neutral-600)] mt-0.5 uppercase tracking-wider">
                                                Módulo
                                            </div>
                                        </div>
                                        <span className="font-mono text-[10px] text-[var(--brand-700)] opacity-0 group-aria-selected:opacity-100 transition-opacity shrink-0">
                                            ↵ ir
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </>
                )}

                {/* Default mode — nav + actions */}
                {!isAiMode && !isSearchMode && (
                    <>
                        <CommandGroup heading="Navegación">
                            {navItems.map((item) => (
                                <CommandItem
                                    key={item.path}
                                    onSelect={() => handleSelect(item.path)}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-5 flex justify-center text-[var(--neutral-600)]" aria-hidden="true">{item.icon}</div>
                                    <span className="text-[13.5px] tracking-[-0.01em]">{item.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator className="my-1" />
                        <CommandGroup heading="Acciones">
                            {/* Crear nuevo issue — shortcut C */}
                            <CommandItem
                                onSelect={() => handleSelect(`/${slug}/projects`)}
                                className="flex items-center gap-3"
                            >
                                <div className="w-5 flex justify-center text-[var(--neutral-600)]">
                                    <Plus size={14} aria-hidden="true" />
                                </div>
                                <span className="text-[13.5px] tracking-[-0.01em]">Crear nuevo issue</span>
                                <kbd className="ml-auto font-mono text-[10px] bg-[var(--neutral-200)] text-[var(--neutral-600)] border border-[var(--neutral-400)] px-1 rounded">
                                    C
                                </kbd>
                            </CommandItem>
                            {/* Crear nuevo ciclo */}
                            <CommandItem
                                onSelect={() => handleSelect(`/${slug}/projects`)}
                                className="flex items-center gap-3"
                            >
                                <div className="w-5 flex justify-center text-[var(--neutral-600)]">
                                    <GitBranch size={14} aria-hidden="true" />
                                </div>
                                <span className="text-[13.5px] tracking-[-0.01em]">Crear nuevo ciclo</span>
                            </CommandItem>
                            {/* Resumir con IA — shortcut ⌘I */}
                            <CommandItem
                                onSelect={() => { toast.info('IA: próximamente'); }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-5 flex justify-center text-[var(--brand-700)]">
                                    <Sparkles size={14} aria-hidden="true" />
                                </div>
                                <span className="text-[13.5px] tracking-[-0.01em]">Resumir este ciclo con IA</span>
                                <kbd className="ml-auto font-mono text-[10px] bg-[var(--neutral-200)] text-[var(--neutral-600)] border border-[var(--neutral-400)] px-1 rounded">
                                    ⌘ I
                                </kbd>
                            </CommandItem>
                            {/* Asignar issues a mí */}
                            <CommandItem
                                onSelect={() => {
                                    setOpen(false);
                                    void navigate(`/${slug}/issues?assignee=me`);
                                    toast.success('Filtro aplicado: issues asignados a mí');
                                }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-5 flex justify-center text-[var(--neutral-600)]">
                                    <UserCheck size={14} aria-hidden="true" />
                                </div>
                                <span className="text-[13.5px] tracking-[-0.01em]">Asignar issues a mí</span>
                            </CommandItem>
                        </CommandGroup>
                    </>
                )}
            </CommandList>

            {/* Footer shortcuts bar */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[var(--neutral-300)] bg-[var(--neutral-100)] rounded-b-xl shrink-0">
                <span className="text-[11px] text-[var(--neutral-600)] flex items-center gap-1.5 font-medium">
                    <kbd className="bg-[var(--neutral-200)] px-1 rounded border border-[var(--neutral-400)] text-[9px]" aria-label="flecha arriba">↑</kbd>
                    <kbd className="bg-[var(--neutral-200)] px-1 rounded border border-[var(--neutral-400)] text-[9px]" aria-label="flecha abajo">↓</kbd>
                    navegar
                </span>
                <span className="text-[11px] text-[var(--neutral-600)] flex items-center gap-1.5 font-medium">
                    <kbd className="bg-[var(--neutral-200)] px-1 rounded border border-[var(--neutral-400)] text-[9px]" aria-label="enter">↵</kbd>
                    abrir
                </span>
                <span className="text-[11px] text-[var(--neutral-600)] flex items-center gap-1.5 font-medium">
                    <kbd className="bg-[var(--neutral-200)] px-1 rounded border border-[var(--neutral-400)] text-[9px]">⌘K</kbd>
                    cerrar
                </span>
                <span className="ml-auto text-[11px] text-[var(--neutral-600)] flex items-center gap-1.5 italic">
                    <Sparkles size={11} className="text-[var(--brand-700)]" aria-hidden="true" />
                    IA puede ayudar — escribe "?"
                </span>
            </div>
        </CommandDialog>
    );
};
