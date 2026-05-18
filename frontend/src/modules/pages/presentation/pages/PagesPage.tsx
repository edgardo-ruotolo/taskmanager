import type React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, FileText, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePagesStore } from '../../application/pages-store';

export function PagesPage(): React.ReactElement {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const navigate = useNavigate();
    const { pages, addPage, deletePage } = usePagesStore();
    const [search, setSearch] = useState('');

    const workspacePages = pages.filter(
        (p) =>
            p.workspaceSlug === workspaceSlug &&
            (search === '' || p.title.toLowerCase().includes(search.toLowerCase())),
    );

    const createPage = (): void => {
        const id = crypto.randomUUID();
        addPage({ id, title: 'Nueva página', workspaceSlug });
        void navigate(`/${workspaceSlug}/pages/${id}`);
    };

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6 gap-4">
                    <h1 className="text-xl font-semibold text-primary shrink-0">Páginas</h1>
                    <div className="relative flex-1 max-w-xs">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder"
                            aria-hidden="true"
                        />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar páginas..."
                            className="pl-8 h-8 text-[13px] bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                        />
                    </div>
                    <Button
                        onClick={createPage}
                        className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2"
                    >
                        <Plus size={15} />
                        Nueva página
                    </Button>
                </div>

                {workspacePages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-subtle flex items-center justify-center mb-4">
                            <FileText size={24} className="text-placeholder" />
                        </div>
                        <h3 className="text-base font-semibold text-secondary mb-1">
                            {search ? 'Sin resultados' : 'Sin páginas aún'}
                        </h3>
                        <p className="text-sm text-placeholder max-w-xs mb-6">
                            {search
                                ? 'No se encontraron páginas con ese término.'
                                : 'Crea tu primera página para documentar tu equipo.'}
                        </p>
                        {!search && (
                            <Button
                                onClick={createPage}
                                className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2"
                            >
                                <Plus size={15} />
                                Crear primera página
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {workspacePages.map((page) => (
                            <div
                                key={page.id}
                                className="group flex items-center gap-3 rounded-lg border border-subtle bg-surface-2 hover:bg-layer-1 transition-colors"
                            >
                                <button
                                    type="button"
                                    className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0 text-left"
                                    onClick={() => void navigate(`/${workspaceSlug}/pages/${page.id}`)}
                                >
                                    <FileText size={16} className="text-tertiary shrink-0" aria-hidden="true" />
                                    <div className="min-w-0">
                                        <p className="text-[13px] font-medium text-primary truncate">{page.title}</p>
                                        <p className="text-[11px] text-placeholder">
                                            {new Date(page.updatedAt).toLocaleDateString('es-ES', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deletePage(page.id)}
                                    aria-label="Eliminar página"
                                    className="opacity-0 group-hover:opacity-100 p-1 mr-3 rounded text-placeholder hover:text-primary transition-all shrink-0"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
