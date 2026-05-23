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

    return (
        <div className="p-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-placeholder mb-1 text-xs uppercase tracking-wider">
                            {workspaceSlug}
                        </p>
                        <h1 className="text-primary text-2xl font-bold">Tableros públicos</h1>
                        <p className="text-secondary mt-1 text-sm">
                            Publica tableros de issues para compartir con el público sin necesidad
                            de autenticación
                        </p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                <Plus size={16} aria-hidden="true" />
                                Publicar nuevo tablero
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

                {isLoading && (
                    <div className="space-y-3">
                        {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                            <div
                                key={k}
                                className="border-subtle bg-surface-1/50 rounded-lg border p-4"
                            >
                                <div className="space-y-2">
                                    <Skeleton className="bg-layer-1 h-4 w-48" />
                                    <Skeleton className="bg-layer-1 h-3 w-72" />
                                    <Skeleton className="bg-layer-1 h-8 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <Globe2 size={48} className="text-placeholder mb-4" aria-hidden="true" />
                        <h2 className="text-secondary mb-2 text-lg font-medium">
                            No hay tableros públicos aún
                        </h2>
                        <p className="text-placeholder mb-6 text-sm">
                            Publica un tablero para compartir tus issues con el mundo sin
                            necesidad de autenticación
                        </p>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                                    <Plus size={16} aria-hidden="true" />
                                    Publicar primer tablero
                                </Button>
                            </DialogTrigger>
                        </Dialog>
                    </div>
                )}

                {!isLoading && items.length > 0 && (
                    <div className="space-y-3">
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
