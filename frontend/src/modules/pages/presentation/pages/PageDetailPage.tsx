import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, History, Lock, LockOpen, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { RichTextEditor } from '@/shared/components/RichTextEditor';
import {
    usePage,
    useUpdatePage,
    useDeletePage,
    useLockPage,
    useUnlockPage,
    usePageVersions,
    useRestorePageVersion,
} from '../../application/use-pages';

function VersionsPanel({
    workspaceSlug,
    pageId,
    onClose,
}: {
    workspaceSlug: string;
    pageId: string;
    onClose: () => void;
}): React.ReactElement {
    const { data: versions = [], isLoading } = usePageVersions(workspaceSlug, pageId);
    const restoreMutation = useRestorePageVersion(workspaceSlug, pageId);

    return (
        <Sheet open onOpenChange={(open) => { if (!open) onClose(); }}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Historial de versiones</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col gap-2">
                    {isLoading && (
                        <div className="flex flex-col gap-2">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-12 w-full rounded" />
                            ))}
                        </div>
                    )}
                    {!isLoading && versions.length === 0 && (
                        <p className="text-sm text-muted-foreground">Sin versiones previas</p>
                    )}
                    {versions.map((v) => (
                        <div key={v.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <p className="text-sm font-medium">Versión {v.versionNumber}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(v.createdAt).toLocaleString('es-AR')}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    restoreMutation.mutate(v.id);
                                    onClose();
                                }}
                            >
                                Restaurar
                            </Button>
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}

export function PageDetailPage(): React.ReactElement {
    const { workspaceSlug = '', pageId = '' } = useParams<{
        workspaceSlug: string;
        pageId: string;
    }>();
    const navigate = useNavigate();

    const { data: page, isLoading } = usePage(workspaceSlug, pageId);
    const updateMutation = useUpdatePage(workspaceSlug, pageId);
    const deleteMutation = useDeletePage(workspaceSlug);
    const lockMutation = useLockPage(workspaceSlug);
    const unlockMutation = useUnlockPage(workspaceSlug);

    const [title, setTitle] = useState('');
    const [showVersions, setShowVersions] = useState(false);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (page) setTitle(page.title);
    }, [page]);

    const handleContentChange = useCallback(
        (html: string): void => {
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => {
                updateMutation.mutate({ description: html });
            }, 800);
        },
        [updateMutation],
    );

    const handleTitleBlur = (): void => {
        if (page && title !== page.title) {
            updateMutation.mutate({ title });
        }
    };

    const handleDelete = (): void => {
        deleteMutation.mutate(pageId);
        void navigate(`/${workspaceSlug}/pages`);
    };

    if (isLoading) {
        return (
            <div className="flex h-full flex-col gap-4 p-8">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!page) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Página no encontrada.</p>
            </div>
        );
    }

    return (
        <>
            {showVersions && (
                <VersionsPanel
                    workspaceSlug={workspaceSlug}
                    pageId={pageId}
                    onClose={() => setShowVersions(false)}
                />
            )}
            <div className="flex h-full flex-col">
                {/* Toolbar */}
                <div className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-6">
                    <button
                        type="button"
                        onClick={() => void navigate(`/${workspaceSlug}/pages`)}
                        className="flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft size={14} />
                        <span>Páginas</span>
                    </button>
                    <div className="flex-1" />
                    {updateMutation.isPending && (
                        <span className="text-[11px] text-muted-foreground">Guardando...</span>
                    )}
                    {page.isLocked && (
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            Bloqueada
                        </span>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal size={14} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setShowVersions(true)}>
                                <History className="mr-2 h-4 w-4" />
                                Historial de versiones
                            </DropdownMenuItem>
                            {page.isLocked ? (
                                <DropdownMenuItem onClick={() => unlockMutation.mutate(page.id)}>
                                    <LockOpen className="mr-2 h-4 w-4" />
                                    Desbloquear
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={() => lockMutation.mutate(page.id)}>
                                    <Lock className="mr-2 h-4 w-4" />
                                    Bloquear
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Editor */}
                <div className="vertical-scrollbar scrollbar-xs flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-3xl px-6 py-8">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleBlur}
                            placeholder="Sin título"
                            disabled={page.isLocked}
                            className="mb-6 w-full bg-transparent text-[28px] font-bold outline-none placeholder:text-muted-foreground disabled:opacity-60"
                        />
                        <RichTextEditor
                            content={page.description}
                            onChange={page.isLocked ? undefined : handleContentChange}
                            placeholder="Empieza a escribir..."
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
