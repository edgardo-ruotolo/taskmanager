import type React from 'react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, MoreHorizontal, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePages, useCreatePage, useDeletePage, useArchivePage, useDuplicatePage } from '../../application/use-pages';

export function PagesPage(): React.ReactElement {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const { data: pages = [], isLoading } = usePages(workspaceSlug);
    const createMutation = useCreatePage(workspaceSlug);
    const deleteMutation = useDeletePage(workspaceSlug);
    const archiveMutation = useArchivePage(workspaceSlug);
    const duplicateMutation = useDuplicatePage(workspaceSlug);

    const filteredPages = pages.filter(
        (p) => search === '' || p.title.toLowerCase().includes(search.toLowerCase()),
    );

    const createPage = async (): Promise<void> => {
        const page = await createMutation.mutateAsync({ title: 'Nueva página' });
        void navigate(`/${workspaceSlug}/pages/${page.id}`);
    };

    return (
        <div className="p-6 md:p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <h1 className="shrink-0 text-xl font-semibold">Páginas</h1>
                    <div className="relative max-w-xs flex-1">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar páginas..."
                            className="h-8 pl-8 text-[13px]"
                        />
                    </div>
                    <Button onClick={() => void createPage()} disabled={createMutation.isPending}>
                        <Plus size={15} className="mr-1" />
                        Nueva página
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-2">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-lg" />
                        ))}
                    </div>
                ) : filteredPages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border bg-muted">
                            <FileText size={24} className="text-muted-foreground" />
                        </div>
                        <h3 className="mb-1 text-base font-semibold">
                            {search ? 'Sin resultados' : 'Sin páginas aún'}
                        </h3>
                        <p className="mb-6 max-w-xs text-sm text-muted-foreground">
                            {search
                                ? 'No se encontraron páginas con ese término.'
                                : 'Creá tu primera página para documentar tu equipo.'}
                        </p>
                        {!search && (
                            <Button onClick={() => void createPage()}>
                                <Plus size={15} className="mr-1" />
                                Crear primera página
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredPages.map((page) => (
                            <div
                                key={page.id}
                                className="group flex items-center gap-3 rounded-lg border bg-card transition-colors hover:bg-muted/40"
                            >
                                <button
                                    type="button"
                                    className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left"
                                    onClick={() => void navigate(`/${workspaceSlug}/pages/${page.id}`)}
                                >
                                    <FileText size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                                    <div className="min-w-0">
                                        <p className="truncate text-[13px] font-medium">{page.title}</p>
                                        <p className="text-[11px] text-muted-foreground">
                                            {new Date(page.updatedAt).toLocaleDateString('es-AR', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                            {page.isLocked && ' · Bloqueada'}
                                        </p>
                                    </div>
                                </button>
                                <div className="mr-2 opacity-0 transition-opacity group-hover:opacity-100">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <MoreHorizontal size={13} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    duplicateMutation.mutate({
                                                        id: page.id,
                                                        title: `${page.title} (copia)`,
                                                    })
                                                }
                                            >
                                                Duplicar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => archiveMutation.mutate(page.id)}
                                            >
                                                Archivar
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="text-destructive"
                                                onClick={() => deleteMutation.mutate(page.id)}
                                            >
                                                Eliminar
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
