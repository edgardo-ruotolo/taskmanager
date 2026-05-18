import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Settings, Bell, BarChart2, User, AlertCircle, GitBranch, BoxSelect, Tag, Loader2 } from 'lucide-react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { useWorkspaceStore } from '@/modules/workspaces/application/workspace-store';
import { useSearch } from '@/modules/search/application/use-search';

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
    const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
    const activeCompanyId = useWorkspaceStore((s) => s.activeCompanyId);
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
                placeholder="Buscar tareas, ciclos, módulos..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList>
                {isSearching ? (
                    <>
                        {isFetching && (
                            <div className="flex items-center justify-center py-4 text-xs text-placeholder gap-2">
                                <Loader2 size={14} className="animate-spin" />
                                Buscando...
                            </div>
                        )}
                        {!isFetching && !hasResults && (
                            <CommandEmpty>Sin resultados para "{debouncedQuery}"</CommandEmpty>
                        )}
                        {searchResults && searchResults.issues.length > 0 && (
                            <CommandGroup heading="Tareas">
                                {searchResults.issues.map((issue) => (
                                    <CommandItem
                                        key={issue.id}
                                        onSelect={() => handleSelect(`/${slug}/companies/${issue.companyId}/issues/${issue.id}`)}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <AlertCircle size={14} className="text-placeholder shrink-0" />
                                        <span className="text-xs font-mono text-placeholder shrink-0">ISS-{issue.sequenceId}</span>
                                        <span className="truncate">{issue.title}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {searchResults && searchResults.cycles.length > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup heading="Ciclos">
                                    {searchResults.cycles.map((cycle) => (
                                        <CommandItem
                                            key={cycle.id}
                                            onSelect={() => handleSelect(`/${slug}/companies/${cycle.companyId}/cycles`)}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <GitBranch size={14} className="text-placeholder shrink-0" />
                                            <span className="truncate">{cycle.name}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                        {searchResults && searchResults.modules.length > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup heading="Módulos">
                                    {searchResults.modules.map((mod) => (
                                        <CommandItem
                                            key={mod.id}
                                            onSelect={() => handleSelect(`/${slug}/companies/${mod.companyId}/modules`)}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <BoxSelect size={14} className="text-placeholder shrink-0" />
                                            <span className="truncate">{mod.name}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                        {searchResults && searchResults.labels.length > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup heading="Etiquetas">
                                    {searchResults.labels.map((label) => (
                                        <CommandItem
                                            key={label.id}
                                            onSelect={() => handleSelect(`/${slug}/settings/labels`)}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: label.color }}
                                                aria-hidden="true"
                                            />
                                            <Tag size={14} className="text-placeholder shrink-0" />
                                            <span className="truncate">{label.name}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <CommandEmpty>Sin resultados.</CommandEmpty>
                        <CommandGroup heading="Navegación">
                            {navItems.map((item) => (
                                <CommandItem
                                    key={item.path}
                                    onSelect={() => handleSelect(item.path)}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <span className="text-placeholder">{item.icon}</span>
                                    {item.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {activeCompanyId && (
                            <>
                                <CommandSeparator />
                                <CommandGroup heading="Empresa actual">
                                    <CommandItem
                                        onSelect={() => handleSelect(`/${slug}/companies/${activeCompanyId}/issues`)}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <AlertCircle size={16} className="text-placeholder" />
                                        Tareas
                                    </CommandItem>
                                    <CommandItem
                                        onSelect={() => handleSelect(`/${slug}/companies/${activeCompanyId}/cycles`)}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <GitBranch size={16} className="text-placeholder" />
                                        Ciclos
                                    </CommandItem>
                                    <CommandItem
                                        onSelect={() => handleSelect(`/${slug}/companies/${activeCompanyId}/modules`)}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <BoxSelect size={16} className="text-placeholder" />
                                        Módulos
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </>
                )}
            </CommandList>
        </CommandDialog>
    );
};
