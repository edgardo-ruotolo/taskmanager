import type React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { SearchableSelect } from '@/shared/components/ui/searchable-select';
import { useStateGroups } from '@/modules/states/application/use-states';
import { useProject, useUpdateProject } from '../../../application/use-projects';
import { SectionHeader } from './SectionHeader';

const schema = z.object({
    stateGroupId: z.string().min(1, 'Seleccioná un grupo'),
});
type FormData = z.infer<typeof schema>;

interface ProjectStateGroupTabProps {
    workspaceSlug: string;
    projectId: string;
}

export function ProjectStateGroupTab({
    workspaceSlug,
    projectId,
}: ProjectStateGroupTabProps): React.ReactElement {
    const { data: project, isLoading: loadingProject } = useProject(workspaceSlug, projectId);
    const { data: groups, isLoading: loadingGroups } = useStateGroups();
    const { mutate, isPending } = useUpdateProject<FormData>(workspaceSlug, projectId);

    const form = useForm<FormData>({
        resolver: zodResolver(schema),
        values: { stateGroupId: project?.stateGroupId ?? '' },
    });

    const onSubmit = (data: FormData): void => {
        if (data.stateGroupId === project?.stateGroupId) return;
        mutate({ stateGroupId: data.stateGroupId });
    };

    const isLoading = loadingProject || loadingGroups;
    const groupList = groups ?? [];
    const currentValue = form.watch('stateGroupId');
    const isUnchanged = currentValue === project?.stateGroupId;

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Grupo de estados"
                description="El grupo define los estados disponibles para las tareas del proyecto."
            />
            {isLoading ? (
                <div className="space-y-4 max-w-lg">
                    <Skeleton className="h-9 w-full bg-layer-1" />
                    <Skeleton className="h-9 w-32 bg-layer-1" />
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
                        <div className="flex items-start gap-2 rounded-lg border border-warning-subtle bg-warning-subtle px-3 py-2.5">
                            <AlertTriangle
                                size={14}
                                className="text-warning-primary shrink-0 mt-0.5"
                                aria-hidden="true"
                            />
                            <p className="text-xs text-warning-primary leading-relaxed">
                                Al cambiar el grupo, todas las tareas activas se reasignarán al
                                estado por defecto del grupo nuevo.
                            </p>
                        </div>

                        <FormField
                            control={form.control}
                            name="stateGroupId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-sm">
                                        Grupo de estados
                                    </FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            multi={false}
                                            value={field.value || null}
                                            onChange={(v) => field.onChange(v ?? '')}
                                            items={groupList.map((g) => ({
                                                id: g.id,
                                                label: g.name + (g.isDefault ? ' (Por defecto)' : ''),
                                            }))}
                                            placeholder="Seleccionar grupo..."
                                            width="100%"
                                            clearable={false}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                            disabled={isPending || isUnchanged}
                        >
                            {isPending ? 'Guardando...' : 'Cambiar grupo'}
                        </Button>
                    </form>
                </Form>
            )}
        </div>
    );
}
