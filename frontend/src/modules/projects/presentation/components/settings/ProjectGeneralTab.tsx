import type React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProject, useUpdateProject } from '../../../application/use-projects';
import { SectionHeader } from './SectionHeader';

const updateSchema = z.object({
    name: z.string().min(1, 'Requerido').max(255),
    description: z.string().max(1000).optional(),
});
type UpdateForm = z.infer<typeof updateSchema>;

const inputClass =
    'bg-layer-1 border-subtle text-primary placeholder:text-placeholder focus:border-strong transition-colors';

interface ProjectGeneralTabProps {
    workspaceSlug: string;
    projectId: string;
}

export function ProjectGeneralTab({
    workspaceSlug,
    projectId,
}: ProjectGeneralTabProps): React.ReactElement {
    const { data: project, isLoading } = useProject(workspaceSlug, projectId);

    const form = useForm<UpdateForm>({
        resolver: zodResolver(updateSchema),
        values: {
            name: project?.name ?? '',
            description: project?.description ?? '',
        },
    });

    const { mutate, isPending } = useUpdateProject<UpdateForm>(workspaceSlug, projectId, {
        setError: form.setError,
    });

    const onSubmit = (data: UpdateForm): void => {
        mutate(data);
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Información general"
                description="Nombre, descripción e identificador del proyecto."
            />
            {isLoading ? (
                <div className="space-y-4 max-w-lg">
                    <Skeleton className="h-9 w-full bg-layer-1" />
                    <Skeleton className="h-9 w-full bg-layer-1" />
                    <Skeleton className="h-9 w-32 bg-layer-1" />
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-sm">Nombre</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Nombre del proyecto"
                                            className={inputClass}
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
                                    <FormLabel className="text-secondary text-sm">
                                        Descripción (opcional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Descripción del proyecto"
                                            className={inputClass}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-1.5">
                            <p className="text-sm text-secondary font-medium">Identificador</p>
                            <div className="flex items-center gap-2 px-3 h-9 rounded-md border border-subtle bg-layer-1/50 w-full">
                                <Lock
                                    size={13}
                                    className="text-placeholder shrink-0"
                                    aria-hidden="true"
                                />
                                <span className="text-sm font-mono text-placeholder">
                                    {project?.identifier ?? '—'}
                                </span>
                            </div>
                            <p className="text-[11px] text-placeholder">
                                El identificador no se puede cambiar después de crear el proyecto.
                            </p>
                        </div>
                        <Button
                            type="submit"
                            className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                            disabled={isPending}
                        >
                            {isPending ? 'Guardando...' : 'Actualizar proyecto'}
                        </Button>
                    </form>
                </Form>
            )}
        </div>
    );
}
