import { useState } from 'react';
import type React from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useDeployBoards, useCreateDeployBoard, useDeleteDeployBoard } from '../../application/use-space';
import { DeployBoardCard } from '../components/DeployBoardCard';

const createBoardSchema = z.object({
    title: z.string().min(1, 'El título es requerido').max(100, 'Máximo 100 caracteres'),
    description: z.string().max(500, 'Máximo 500 caracteres').optional(),
    showVoting: z.boolean().optional(),
    showComments: z.boolean().optional(),
    showPriority: z.boolean().optional(),
    showState: z.boolean().optional(),
    showAssignees: z.boolean().optional(),
});

type CreateBoardFormData = z.infer<typeof createBoardSchema>;

export const DeployBoardsPage = (): React.ReactElement => {
    const { workspaceSlug = '', projectId = '' } = useParams<{
        workspaceSlug: string;
        projectId: string;
    }>();
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: boards, isLoading } = useDeployBoards(workspaceSlug, projectId);
    const { mutate: createBoard, isPending: isCreating } = useCreateDeployBoard(
        workspaceSlug,
        projectId,
    );
    const { mutate: deleteBoard } = useDeleteDeployBoard(workspaceSlug, projectId);

    const form = useForm<CreateBoardFormData>({
        resolver: zodResolver(createBoardSchema),
        defaultValues: {
            title: '',
            description: '',
            showVoting: false,
            showComments: true,
            showPriority: true,
            showState: true,
            showAssignees: true,
        },
    });

    const onSubmit = (data: CreateBoardFormData): void => {
        createBoard(data, {
            onSuccess: () => {
                form.reset();
                setDialogOpen(false);
            },
        });
    };

    const items = boards ?? [];
    const activeCount = items.filter((b) => b.isPublic).length;

    return (
        <div className="h-full overflow-y-auto">
            <div className="w-full px-10 py-10">

                {/* Sub-header */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    {/* Left: icon + title + count */}
                    <div className="flex items-center gap-2">
                        <Globe2 size={16} className="text-[var(--neutral-600)] shrink-0" aria-hidden="true" />
                        <span className="text-[13px] font-medium text-[var(--neutral-1200)]">Deploy boards</span>
                        {!isLoading && (
                            <span className="font-mono text-[11px] text-[var(--neutral-600)] ml-1">
                                · {activeCount} activas
                            </span>
                        )}
                    </div>

                    {/* Right: create button */}
                    <div className="shrink-0">
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                    <Plus size={16} aria-hidden="true" />
                                    Crear deploy
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle className="text-primary">
                                        Nuevo tablero público
                                    </DialogTitle>
                                </DialogHeader>
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-4"
                                    >
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-secondary">
                                                        Título
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Tablero de feedback público"
                                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-secondary">
                                                        Descripción{' '}
                                                        <span className="text-placeholder font-normal">
                                                            (opcional)
                                                        </span>
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Descripción breve del tablero..."
                                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder resize-none"
                                                            rows={3}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="space-y-3">
                                            <p className="text-secondary text-sm font-medium">
                                                Columnas visibles
                                            </p>
                                            {(
                                                [
                                                    {
                                                        name: 'showPriority' as const,
                                                        label: 'Prioridad',
                                                    },
                                                    { name: 'showState' as const, label: 'Estado' },
                                                    {
                                                        name: 'showAssignees' as const,
                                                        label: 'Responsables',
                                                    },
                                                    {
                                                        name: 'showComments' as const,
                                                        label: 'Comentarios',
                                                    },
                                                    { name: 'showVoting' as const, label: 'Votación' },
                                                ] as const
                                            ).map(({ name, label }) => (
                                                <FormField
                                                    key={name}
                                                    control={form.control}
                                                    name={name}
                                                    render={({ field }) => (
                                                        <FormItem className="flex items-center justify-between rounded-md border border-subtle bg-layer-1 px-3 py-2">
                                                            <FormLabel className="text-secondary cursor-pointer font-normal">
                                                                {label}
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Switch
                                                                    checked={field.value ?? false}
                                                                    onCheckedChange={field.onChange}
                                                                    aria-label={`Mostrar ${label.toLowerCase()}`}
                                                                />
                                                            </FormControl>
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex justify-end gap-3 pt-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setDialogOpen(false)}
                                                className="text-tertiary hover:text-primary"
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={isCreating}
                                                className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                                            >
                                                {isCreating ? 'Publicando...' : 'Publicar tablero'}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Editorial header */}
                <div className="mb-10">
                    <p className="font-mono text-[10.5px] text-[var(--neutral-700)] uppercase tracking-[0.14em] mb-3">
                        Panel admin · Deploy boards
                    </p>
                    <h1 className="text-[42px] font-medium tightest text-[var(--neutral-1200)] mb-4">
                        Boards públicos.
                    </h1>
                    <p className="text-[14px] text-[var(--neutral-700)] leading-relaxed max-w-xl">
                        Publica vistas como URLs públicas para compartir con clientes, auditores externos o stakeholders sin cuenta. Permisos granulares por vista.
                    </p>
                </div>

                {/* Loading skeletons */}
                {isLoading && (
                    <div className="space-y-4">
                        {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                            <div
                                key={k}
                                className="border border-[var(--neutral-400)] bg-[var(--neutral-200)] rounded-xl p-5"
                            >
                                <div className="space-y-3">
                                    <Skeleton className="bg-[var(--neutral-300)] h-4 w-48" />
                                    <Skeleton className="bg-[var(--neutral-300)] h-3 w-72" />
                                    <div className="flex gap-2 mt-4">
                                        <Skeleton className="bg-[var(--neutral-300)] h-7 w-20" />
                                        <Skeleton className="bg-[var(--neutral-300)] h-7 w-20" />
                                    </div>
                                    <Skeleton className="bg-[var(--neutral-300)] h-12 w-full mt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!isLoading && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Globe2 size={48} className="text-[var(--neutral-600)] mb-4" aria-hidden="true" />
                        <h2 className="text-[var(--neutral-1200)] mb-2 text-lg font-medium">
                            No hay boards públicos aún
                        </h2>
                        <p className="text-[var(--neutral-700)] mb-6 text-sm max-w-xs">
                            Publica un board para compartir issues con clientes o auditores sin necesidad de autenticación.
                        </p>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                    <Plus size={16} aria-hidden="true" />
                                    Publicar primer board
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>
                )}

                {/* Board cards */}
                {!isLoading && items.length > 0 && (
                    <div className="space-y-4">
                        {items.map((board) => (
                            <DeployBoardCard
                                key={board.id}
                                board={board}
                                onDelete={deleteBoard}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
