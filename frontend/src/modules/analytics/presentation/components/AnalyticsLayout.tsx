import type React from 'react';
import { useState } from 'react';
import { NavLink, Outlet, useParams } from 'react-router-dom';
import { Filter, RotateCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAnalyticsFiltersStore } from '../../application/filters-store';
import { FiltersPanel } from './FiltersPanel';

const TABS: { to: string; label: string; end?: boolean }[] = [
    { to: '', label: 'Overview', end: true },
    { to: 'gantt', label: 'Gantt' },
    { to: 'burndown', label: 'Burndown' },
    { to: 'drilldown', label: 'Tareas' },
    { to: 'users', label: 'Usuarios' },
    { to: 'clients', label: 'Clientes' },
    { to: 'reports', label: 'Reportes' },
];

export const AnalyticsLayout = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const filters = useAnalyticsFiltersStore(workspaceSlug);
    const [open, setOpen] = useState(false);

    const activeCount = filters.countActiveFilters();

    return (
        <div className="h-full flex flex-col">
            <div className="px-10 pt-8 pb-3 border-b border-[var(--neutral-400)] bg-white sticky top-0 z-10">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <Eyebrow>Analytics · panel administrativo</Eyebrow>
                        <h1 className="mt-1 text-[28px] font-medium tracking-[-0.03em] leading-tight text-[var(--neutral-1200)]">
                            Reportes y métricas
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {filters.hasActiveFilters() && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={filters.resetFilters}
                                className="h-8 gap-1.5"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Limpiar
                            </Button>
                        )}
                        <Sheet open={open} onOpenChange={setOpen}>
                            <SheetTrigger asChild>
                                <Button size="sm" variant="outline" className="h-8 gap-2">
                                    <Filter className="h-3.5 w-3.5" />
                                    Filtros
                                    {activeCount > 0 && (
                                        <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-4 text-[10px]">
                                            {activeCount}
                                        </Badge>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                                <SheetHeader>
                                    <SheetTitle>Filtros de Analytics</SheetTitle>
                                    <SheetDescription>
                                        Se aplican a todas las vistas y reportes.
                                    </SheetDescription>
                                </SheetHeader>
                                <FiltersPanel
                                    workspaceSlug={workspaceSlug}
                                    onClose={() => setOpen(false)}
                                />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="mt-5 flex gap-1 overflow-x-auto">
                    {TABS.map((tab) => (
                        <NavLink
                            key={tab.to || 'overview'}
                            to={tab.to}
                            end={tab.end}
                            className={({ isActive }) =>
                                cn(
                                    'px-3 py-2 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap',
                                    isActive
                                        ? 'bg-[var(--neutral-200)] text-[var(--neutral-1200)]'
                                        : 'text-[var(--neutral-600)] hover:text-[var(--neutral-1200)] hover:bg-[var(--neutral-100)]',
                                )
                            }
                        >
                            {tab.label}
                        </NavLink>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-[var(--neutral-50)]">
                <Outlet />
            </div>
        </div>
    );
};
