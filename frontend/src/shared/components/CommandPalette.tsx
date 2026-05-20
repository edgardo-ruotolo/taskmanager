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
    Sparkles 
} from 'lucide-react';
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

    useEffect(() => {
        const handler = (e: KeyboardEvent): void => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    useEffect(() => {
        if (!open) setQuery('');
    }, [open]);

    const navItems: NavItem[] = [
        { label: 'Ir a Empresas', icon: <Building2 size={16} />, path: `/${slug}/companies` },
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

    const isSearching = debouncedQuery.length >= 2;

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput
                placeholder="Escribe un comando o busca…"
                value={query}
                onValueChange={setQuery}
            />
            <CommandList className="max-h-[460px] p-2">
                {isSearching ? (
                    <>
                        {isFetching && (
                            <div className="flex items-center justify-center py-6 text-xs text-[var(--neutral-600)] gap-2 font-mono uppercase tracking-[0.1em]">
                                <Loader2 size={14} className="animate-spin" />
                                Buscando…
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
                                        onSelect={() => handleSelect(`/${slug}/companies/${issue.companyId}/issues/${issue.id}`)}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className="w-5 flex justify-center">
                                            <StatePip state="backlog" size={14} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[13.5px] font-medium tracking-[-0.01em]">{issue.title}</div>
                                            <div className="font-mono text-[11px] text-[var(--neutral-600)] mt-0.5">
                                                #{issue.sequenceId}
                                            </div>
                                        </div>
                                        <span className="font-mono text-[10px] text-[var(--brand-700)] opacity-0 group-aria-selected:opacity-100 transition-opacity">↵ ir</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {searchResults && searchResults.cycles.length > 0 && (
                            <CommandGroup heading={`Ciclos · ${searchResults.cycles.length}`}>
                                {searchResults.cycles.map((cycle) => (
                                    <CommandItem
                                        key={cycle.id}
                                        onSelect={() => handleSelect(`/${slug}/companies/${cycle.companyId}/cycles`)}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className="w-5 flex justify-center text-[var(--brand-700)]">
                                            <GitBranch size={14} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[13.5px] font-medium tracking-[-0.01em]">{cycle.name}</div>
                                            <div className="font-mono text-[11px] text-[var(--neutral-600)] mt-0.5 uppercase tracking-wider">
                                                Ciclo activo
                                            </div>
                                        </div>
                                        <span className="font-mono text-[10px] text-[var(--brand-700)] opacity-0 group-aria-selected:opacity-100 transition-opacity">↵ ir</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {searchResults && searchResults.modules.length > 0 && (
                            <CommandGroup heading={`Módulos · ${searchResults.modules.length}`}>
                                {searchResults.modules.map((mod) => (
                                    <CommandItem
                                        key={mod.id}
                                        onSelect={() => handleSelect(`/${slug}/companies/${mod.companyId}/modules`)}
                                        className="flex items-center gap-3 group"
                                    >
                                        <div className="w-5 flex justify-center text-[var(--neutral-600)]">
                                            <BoxSelect size={14} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-[13.5px] font-medium tracking-[-0.01em]">{mod.name}</div>
                                            <div className="font-mono text-[11px] text-[var(--neutral-600)] mt-0.5 uppercase tracking-wider">
                                                Módulo
                                            </div>
                                        </div>
                                        <span className="font-mono text-[10px] text-[var(--brand-700)] opacity-0 group-aria-selected:opacity-100 transition-opacity">↵ ir</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </>
                ) : (
                    <>
                        <CommandGroup heading="Navegación">
                            {navItems.map((item) => (
                                <CommandItem
                                    key={item.path}
                                    onSelect={() => handleSelect(item.path)}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-5 flex justify-center text-[var(--neutral-600)]">{item.icon}</div>
                                    <span className="text-[13.5px] tracking-[-0.01em]">{item.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator className="my-1" />
                        <CommandGroup heading="Acciones">
                            <CommandItem onSelect={() => handleSelect(`/${slug}/companies`)} className="flex items-center gap-3">
                                <div className="w-5 flex justify-center text-[var(--neutral-600)]"><Plus size={14} /></div>
                                <span className="text-[13.5px] tracking-[-0.01em]">Crear nuevo issue</span>
                                <kbd className="ml-auto font-mono text-[10px] text-[var(--neutral-600)] opacity-40">C</kbd>
                            </CommandItem>
                            <CommandItem onSelect={() => { /* AI summary — stub */ }} className="flex items-center gap-3">
                                <div className="w-5 flex justify-center text-[var(--brand-700)]"><Sparkles size={14} /></div>
                                <span className="text-[13.5px] tracking-[-0.01em]">Resumir este ciclo con IA</span>
                                <kbd className="ml-auto font-mono text-[10px] text-[var(--neutral-600)] opacity-40">⌘ I</kbd>
                            </CommandItem>
                        </CommandGroup>
                    </>
                )}
            </CommandList>
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[var(--neutral-300)] bg-[var(--neutral-100)] rounded-b-xl shrink-0">
                <span className="text-[11px] text-[var(--neutral-600)] flex items-center gap-1.5 font-medium">
                    <kbd className="bg-[var(--neutral-200)] px-1 rounded border border-[var(--neutral-400)] text-[9px]">↑</kbd>
                    <kbd className="bg-[var(--neutral-200)] px-1 rounded border border-[var(--neutral-400)] text-[9px]">↓</kbd>
                    navegar
                </span>
                <span className="text-[11px] text-[var(--neutral-600)] flex items-center gap-1.5 font-medium">
                    <kbd className="bg-[var(--neutral-200)] px-1 rounded border border-[var(--neutral-400)] text-[9px]">↵</kbd>
                    abrir
                </span>
                <span className="ml-auto text-[11px] text-[var(--neutral-600)] flex items-center gap-1.5 italic">
                    <Sparkles size={11} className="text-[var(--brand-700)]" />
                    IA puede ayudar — escribe "?"
                </span>
            </div>
        </CommandDialog>
    );
};
