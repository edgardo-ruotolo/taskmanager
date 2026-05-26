import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ThemedSwitch } from '@/shared/components/ThemedSwitch';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronRight, FileEdit, Lock, GitBranch } from 'lucide-react';
import { SearchableSelect } from '@/shared/components/ui/searchable-select';
import { useProjectStates } from '@/modules/states/application/use-states';
import { useLabels } from '@/modules/labels/application/use-labels';
import { useCycles } from '@/modules/cycles/application/use-cycles';
import { useModules } from '@/modules/modules/application/use-modules';
import { useWorkspaceMembers } from '@/modules/workspaces/application/use-workspaces';
import { useProject } from '@/modules/projects/application/use-projects';
import { getProjectFeatures } from '@/modules/projects/application/use-project-features';
import { useIssueTypes } from '../../application/use-issue-types';
import { RichTextEditor } from '@/shared/components/RichTextEditor';
import { PRIORITY_LABELS } from '../../domain/types';
import type { Issue } from '../../domain/types';
import { useCreateIssue, useUpdateIssue, useIssues } from '../../application/use-issues';
import { useSimilarIssues } from '../../application/use-similar-issues';

const issueDialogSchema = z.object({
    title: z.string().min(1, 'El título es requerido').max(500),
    description: z.string().optional(),
    descriptionHtml: z.string().optional(),
    descriptionJson: z.string().optional(),
    priority: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
    stateId: z.string().min(1, 'El estado es requerido'),
    assigneeId: z.string().optional(),
    assigneeIds: z.array(z.string()).optional(),
    labelIds: z.array(z.string()).optional(),
    moduleIds: z.array(z.string()).optional(),
    cycleId: z.string().optional(),
    parentId: z.string().optional(),
    issueTypeId: z.string().optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    isDraft: z.boolean().optional(),
    sortOrder: z.number().min(0).optional(),
    requiresAdminApproval: z.boolean(),
    approvalRequiredStateIds: z.array(z.string()),
}).refine(
    (data) => {
        if (data.startDate && data.dueDate) {
            return new Date(data.startDate) <= new Date(data.dueDate);
        }
        return true;
    },
    { message: 'La fecha de inicio no puede ser posterior a la fecha de vencimiento', path: ['startDate'] }
).refine(
    (data) => {
        if (data.requiresAdminApproval) {
            return data.approvalRequiredStateIds.length > 0;
        }
        return true;
    },
    { message: 'Selecciona al menos un estado que requiera aprobación', path: ['approvalRequiredStateIds'] }
);

type IssueDialogFormData = z.infer<typeof issueDialogSchema>;

/** Builds the reset values for an existing issue being edited. */
function buildEditResetValues(issue: Issue): IssueDialogFormData {
    return {
        title: issue.title,
        description: issue.description ?? '',
        descriptionHtml: issue.descriptionHtml ?? '',
        descriptionJson: issue.descriptionJson ?? '',
        priority: issue.priority,
        stateId: issue.stateId,
        assigneeIds: issue.assigneeIds ?? [],
        labelIds: issue.labelIds ?? [],
        moduleIds: issue.moduleIds ?? [],
        cycleId: issue.cycleId ?? '',
        parentId: issue.parentId ?? '',
        issueTypeId: issue.issueTypeId ?? '',
        startDate: issue.startDate ? issue.startDate.slice(0, 10) : '',
        dueDate: issue.dueDate ? issue.dueDate.slice(0, 10) : '',
        isDraft: issue.isDraft,
        requiresAdminApproval: issue.requiresAdminApproval,
        approvalRequiredStateIds: issue.approvalRequiredStateIds ?? [],
    };
}

/** Builds the reset values for a new issue creation. */
function buildCreateResetValues(defaultParentId?: string): IssueDialogFormData {
    return {
        title: '',
        description: '',
        descriptionHtml: '',
        descriptionJson: '',
        priority: 0,
        stateId: '',
        assigneeIds: [],
        labelIds: [],
        moduleIds: [],
        cycleId: '',
        parentId: defaultParentId ?? '',
        issueTypeId: '',
        startDate: '',
        dueDate: '',
        isDraft: false,
        requiresAdminApproval: false,
        approvalRequiredStateIds: [],
    };
}

interface CreateIssueDialogProps {
    workspaceSlug: string;
    projectId: string;
    trigger: React.ReactNode;
    issue?: Issue;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultParentId?: string;
}

export const CreateIssueDialog = ({
    workspaceSlug,
    projectId,
    trigger,
    issue,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    defaultParentId,
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: large dialog with many optional fields — complexity is inherent to the form structure
}: CreateIssueDialogProps): React.ReactElement => {
    const isEditMode = !!issue;
    const [internalOpen, setInternalOpen] = useState(false);
    const [keepOpen, setKeepOpen] = useState(false);
    const [dedupeDismissed, setDedupeDismissed] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(!!issue);

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = (val: boolean): void => {
        if (controlledOnOpenChange) controlledOnOpenChange(val);
        else setInternalOpen(val);
    };

    const form = useForm<IssueDialogFormData>({
        resolver: zodResolver(issueDialogSchema),
        defaultValues: {
            title: '',
            priority: 0,
            stateId: '',
            assigneeIds: [],
            labelIds: [],
            moduleIds: [],
            isDraft: false,
            requiresAdminApproval: false,
            approvalRequiredStateIds: [],
        },
    });

    // biome-ignore lint/correctness/useExhaustiveDependencies: form is a stable RHF ref — adding it to deps causes infinite resets
    useEffect(() => {
        if (!open) return;
        if (issue) {
            form.reset(buildEditResetValues(issue));
        } else {
            form.reset(buildCreateResetValues(defaultParentId));
        }
    }, [issue?.id, open, defaultParentId]);

    const watchedTitle = form.watch('title');
    const watchedRequiresApproval = form.watch('requiresAdminApproval');

    const { mutate: createMutate, isPending: isCreating } = useCreateIssue<IssueDialogFormData>(
        workspaceSlug,
        projectId,
        { setError: form.setError },
    );
    const { mutate: updateMutate, isPending: isUpdating } = useUpdateIssue<IssueDialogFormData>(
        workspaceSlug,
        projectId,
        { setError: form.setError },
    );
    const isPending = isEditMode ? isUpdating : isCreating;

    const { data: project } = useProject(workspaceSlug, projectId);
    const features = getProjectFeatures(project);

    const { data: states = [] } = useProjectStates(workspaceSlug, projectId);
    const { data: labels = [] } = useLabels(workspaceSlug);
    const { data: cycles = [] } = useCycles(workspaceSlug, projectId, { enabled: !!workspaceSlug && !!projectId && features.cyclesEnabled });
    const { data: modules = [] } = useModules(workspaceSlug, projectId, { enabled: !!workspaceSlug && !!projectId && features.modulesEnabled });
    const { data: members = [] } = useWorkspaceMembers(workspaceSlug);
    const { data: issueTypes = [] } = useIssueTypes(workspaceSlug);
    const { data: allIssuesData } = useIssues(workspaceSlug, projectId);
    const { data: similarIssues } = useSimilarIssues(workspaceSlug, projectId, watchedTitle, open && !dedupeDismissed && !isEditMode);

    // Build parent task picker items — exclude self (in edit mode) and any of its potential circular refs.
    // Backend will validate circular ancestry; client-side we only exclude self.
    const parentItems = useMemo(
        () =>
            (allIssuesData?.items ?? [])
                .filter((i) => i.id !== issue?.id)
                .map((i) => ({
                    id: i.id,
                    label: `#${i.sequenceId} ${i.title}`,
                })),
        [allIssuesData, issue?.id],
    );

    const onSubmit = (data: IssueDialogFormData): void => {
        const payload = {
            ...data,
            dueDate: data.dueDate === '' ? null : data.dueDate,
            startDate: data.startDate === '' ? null : data.startDate,
            cycleId: data.cycleId === '' ? null : data.cycleId,
            parentId: data.parentId || defaultParentId || null,
            issueTypeId: data.issueTypeId === '' ? null : data.issueTypeId,
        };

        if (isEditMode && issue) {
            updateMutate(
                { issueId: issue.id, data: payload },
                { onSuccess: () => { setOpen(false); } },
            );
        } else {
            createMutate(payload, {
                onSuccess: () => {
                    form.reset();
                    if (!keepOpen) setOpen(false);
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-primary">
                        {isEditMode ? 'Editar tarea' : 'Nueva Tarea'}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Formulario para {isEditMode ? 'editar' : 'crear'} una tarea con título, descripción, estado, prioridad y asignación.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Título</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Título de la tarea..."
                                            className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* DeDupe banner (only on create) */}
                        {!isEditMode && !dedupeDismissed && similarIssues.length > 0 && (
                            <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-600 dark:text-yellow-400">
                                <div className="flex items-center justify-between mb-1 font-medium">
                                    <span>Posibles duplicados ({similarIssues.length})</span>
                                    <button type="button" onClick={() => setDedupeDismissed(true)} className="text-yellow-500 hover:text-yellow-400">✕</button>
                                </div>
                                <ul className="space-y-0.5">
                                    {similarIssues.slice(0, 3).map((si) => (
                                        <li key={si.id} className="truncate text-secondary">
                                            #{si.sequenceId} — {si.title}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Description — TipTap */}
                        <FormField
                            control={form.control}
                            name="descriptionHtml"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Descripción</FormLabel>
                                    <FormControl>
                                        <div className="rounded-md border border-subtle bg-layer-1 px-3 py-2 min-h-[100px]">
                                            <RichTextEditor
                                                content={field.value ?? ''}
                                                placeholder="Describe la tarea..."
                                                onChange={field.onChange}
                                                onChangeJson={(json) => form.setValue('descriptionJson', json)}
                                            />
                                        </div>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* State + Priority */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="stateId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Estado</FormLabel>
                                        <FormControl>
                                            <SearchableSelect
                                                multi={false}
                                                value={field.value || null}
                                                onChange={(v) => field.onChange(v ?? '')}
                                                items={states.map((s) => ({
                                                    id: s.id,
                                                    label: s.name,
                                                    icon: (
                                                        <span
                                                            style={{
                                                                width: 10,
                                                                height: 10,
                                                                borderRadius: 99,
                                                                background: s.color,
                                                                display: 'inline-block',
                                                            }}
                                                        />
                                                    ),
                                                }))}
                                                placeholder="Seleccionar..."
                                                width="100%"
                                                clearable={false}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Prioridad</FormLabel>
                                        <FormControl>
                                            <SearchableSelect
                                                multi={false}
                                                value={String(field.value)}
                                                onChange={(v) => field.onChange(v !== null ? Number(v) : 0)}
                                                items={([0, 1, 2, 3, 4] as const).map((p) => ({
                                                    id: String(p),
                                                    label: PRIORITY_LABELS[p],
                                                }))}
                                                placeholder="Seleccionar..."
                                                width="100%"
                                                clearable={false}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Issue Type */}
                        {issueTypes.length > 0 && (
                            <FormField
                                control={form.control}
                                name="issueTypeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Tipo de tarea</FormLabel>
                                        <FormControl>
                                            <SearchableSelect
                                                multi={false}
                                                value={field.value ?? null}
                                                onChange={(v) => field.onChange(v ?? undefined)}
                                                items={issueTypes.map((t) => ({ id: t.id, label: t.name }))}
                                                placeholder="Sin tipo"
                                                width="100%"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Assignees multi-select */}
                        <FormField
                            control={form.control}
                            name="assigneeIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Asignados</FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            multi={true}
                                            value={field.value ?? []}
                                            onChange={field.onChange}
                                            items={members.map((m) => ({
                                                id: m.userId,
                                                label: m.displayName ?? m.email,
                                                sublabel: m.email !== (m.displayName ?? m.email) ? m.email : undefined,
                                            }))}
                                            placeholder="Seleccionar miembros..."
                                            width="100%"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Labels multi-select */}
                        <FormField
                            control={form.control}
                            name="labelIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Etiquetas</FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            multi={true}
                                            value={field.value ?? []}
                                            onChange={field.onChange}
                                            items={labels.map((l) => ({
                                                id: l.id,
                                                label: l.name,
                                                icon: (
                                                    <span
                                                        style={{
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: 99,
                                                            background: l.color,
                                                            display: 'inline-block',
                                                        }}
                                                    />
                                                ),
                                            }))}
                                            placeholder="Seleccionar etiquetas..."
                                            width="100%"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Parent task */}
                        {defaultParentId ? (
                            // Read-only chip when parentId is preset (opened from "Add sub-task")
                            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-layer-2 border border-subtle">
                                <GitBranch size={13} className="text-placeholder shrink-0" aria-hidden="true" />
                                <span className="text-xs text-secondary">
                                    Tarea padre:
                                </span>
                                <span className="text-xs font-medium text-primary truncate flex-1">
                                    {parentItems.find((i) => i.id === defaultParentId)?.label ?? defaultParentId}
                                </span>
                            </div>
                        ) : (
                            <FormField
                                control={form.control}
                                name="parentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Tarea padre</FormLabel>
                                        <FormControl>
                                            <SearchableSelect
                                                multi={false}
                                                value={field.value ?? null}
                                                onChange={(v) => field.onChange(v ?? undefined)}
                                                items={parentItems}
                                                placeholder="Sin tarea padre"
                                                width="100%"
                                                clearable
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Progressive disclosure: hide secondary fields by default to lower TTI */}
                        <button
                            type="button"
                            onClick={() => setShowAdvanced((v) => !v)}
                            className="flex items-center gap-1.5 text-xs text-tertiary hover:text-secondary transition-colors w-fit"
                            aria-expanded={showAdvanced}
                        >
                            {showAdvanced ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            {showAdvanced ? 'Ocultar opciones avanzadas' : 'Mostrar opciones avanzadas'}
                        </button>

                        {showAdvanced && (
                        <>
                        {/* Start + Due date */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Fecha de inicio</FormLabel>
                                        <FormControl>
                                            <Input type="date" className="bg-layer-1 border-subtle text-primary" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Fecha límite</FormLabel>
                                        <FormControl>
                                            <Input type="date" className="bg-layer-1 border-subtle text-primary" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Cycle select */}
                        {features.cyclesEnabled && (
                        <FormField
                            control={form.control}
                            name="cycleId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Ciclo</FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            multi={false}
                                            value={field.value ?? null}
                                            onChange={(v) => field.onChange(v ?? undefined)}
                                            items={cycles.map((c) => ({ id: c.id, label: c.name }))}
                                            placeholder="Sin ciclo"
                                            width="100%"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        )}

                        {/* Modules multi-select */}
                        {features.modulesEnabled && (
                        <FormField
                            control={form.control}
                            name="moduleIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Módulos</FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            multi={true}
                                            value={field.value ?? []}
                                            onChange={field.onChange}
                                            items={modules.map((m) => ({ id: m.id, label: m.name }))}
                                            placeholder="Seleccionar módulos..."
                                            width="100%"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        )}

                        <Separator className="bg-subtle" />

                        {/* Approval section */}
                        <div className="space-y-3">
                            <FormField
                                control={form.control}
                                name="requiresAdminApproval"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Lock size={13} className="text-amber-500" />
                                            <FormLabel className="text-secondary font-normal cursor-pointer">
                                                Requiere aprobación de Admin/Lead
                                            </FormLabel>
                                        </div>
                                        <FormControl>
                                            <ThemedSwitch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                ariaLabel="Requiere aprobación de Admin/Lead"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {watchedRequiresApproval && (
                                <FormField
                                    control={form.control}
                                    name="approvalRequiredStateIds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-secondary text-xs">Estados que requieren aprobación</FormLabel>
                                            <FormControl>
                                                <SearchableSelect
                                                    multi={true}
                                                    value={field.value ?? []}
                                                    onChange={field.onChange}
                                                    items={states.map((s) => ({
                                                        id: s.id,
                                                        label: s.name,
                                                        icon: (
                                                            <span
                                                                style={{
                                                                    width: 10,
                                                                    height: 10,
                                                                    borderRadius: 99,
                                                                    background: s.color,
                                                                    display: 'inline-block',
                                                                }}
                                                            />
                                                        ),
                                                    }))}
                                                    placeholder="Seleccionar estados..."
                                                    width="100%"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>
                        </>
                        )}

                        <Separator className="bg-subtle" />

                        {/* Draft toggle + keep open (only on create) */}
                        <div className="flex items-center justify-between">
                            <FormField
                                control={form.control}
                                name="isDraft"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="border-subtle data-[state=checked]:bg-accent-primary"
                                            />
                                        </FormControl>
                                        <FormLabel className="text-secondary font-normal cursor-pointer">
                                            <FileEdit size={13} className="inline mr-1" />
                                            Guardar como borrador
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                            {!isEditMode && (
                                <label htmlFor="create-issue-keep-open" className="flex items-center gap-2 text-sm text-secondary cursor-pointer select-none">
                                    <Checkbox
                                        id="create-issue-keep-open"
                                        checked={keepOpen}
                                        onCheckedChange={(v) => setKeepOpen(!!v)}
                                        className="border-subtle data-[state=checked]:bg-accent-primary"
                                    />
                                    Crear más
                                </label>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-1">
                            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-tertiary hover:text-primary">
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending} className="bg-accent-primary hover:bg-accent-primary-hover text-on-color">
                                {isPending
                                    ? (isEditMode ? 'Guardando...' : 'Creando...')
                                    : (isEditMode ? 'Guardar cambios' : (form.watch('isDraft') ? 'Guardar borrador' : 'Crear tarea'))
                                }
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

