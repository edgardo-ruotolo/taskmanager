import type React from 'react';
import { useState, useEffect } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, ChevronDown, ChevronsUpDown, ChevronRight, FileEdit, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompanyStates } from '@/modules/states/application/use-states';
import { useLabels } from '@/modules/labels/application/use-labels';
import { useCycles } from '@/modules/cycles/application/use-cycles';
import { useModules } from '@/modules/project-modules/application/use-modules';
import { useWorkspaceMembers } from '@/modules/workspaces/application/use-workspaces';
import { RichTextEditor } from '@/shared/components/RichTextEditor';
import { PRIORITY_LABELS } from '../../domain/types';
import type { Issue } from '../../domain/types';
import { useCreateIssue, useUpdateIssue } from '../../application/use-issues';
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
    estimatePointId: z.string().optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    isDraft: z.boolean().optional(),
    sortOrder: z.number().min(0).optional(),
    requiresAdminApproval: z.boolean().default(false),
    approvalRequiredStateIds: z.array(z.string()).default([]),
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

interface CreateIssueDialogProps {
    workspaceSlug: string;
    companyId: string;
    trigger: React.ReactNode;
    issue?: Issue;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    defaultParentId?: string;
}

export const CreateIssueDialog = ({
    workspaceSlug,
    companyId,
    trigger,
    issue,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    defaultParentId,
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

    useEffect(() => {
        if (issue && open) {
            form.reset({
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
                estimatePointId: issue.estimatePointId ?? '',
                startDate: issue.startDate ? issue.startDate.slice(0, 10) : '',
                dueDate: issue.dueDate ? issue.dueDate.slice(0, 10) : '',
                isDraft: issue.isDraft,
                requiresAdminApproval: issue.requiresAdminApproval,
                approvalRequiredStateIds: issue.approvalRequiredStateIds ?? [],
            });
        } else if (!issue && open) {
            form.reset({
                title: '',
                priority: 0,
                stateId: '',
                assigneeIds: [],
                labelIds: [],
                moduleIds: [],
                isDraft: false,
                requiresAdminApproval: false,
                approvalRequiredStateIds: [],
                parentId: defaultParentId ?? '',
            });
        }
    }, [issue, open, form, defaultParentId]);

    const watchedTitle = form.watch('title');
    const watchedRequiresApproval = form.watch('requiresAdminApproval');

    const { mutate: createMutate, isPending: isCreating } = useCreateIssue<IssueDialogFormData>(
        workspaceSlug,
        companyId,
        { setError: form.setError },
    );
    const { mutate: updateMutate, isPending: isUpdating } = useUpdateIssue<IssueDialogFormData>(
        workspaceSlug,
        companyId,
        { setError: form.setError },
    );
    const isPending = isEditMode ? isUpdating : isCreating;

    const { data: states = [] } = useCompanyStates(workspaceSlug, companyId);
    const { data: labels = [] } = useLabels(workspaceSlug);
    const { data: cycles = [] } = useCycles(workspaceSlug, companyId);
    const { data: modules = [] } = useModules(workspaceSlug, companyId);
    const { data: members = [] } = useWorkspaceMembers(workspaceSlug);
    const { data: similarIssues } = useSimilarIssues(workspaceSlug, companyId, watchedTitle, open && !dedupeDismissed && !isEditMode);

    const onSubmit = (data: IssueDialogFormData): void => {
        const payload = {
            ...data,
            dueDate: data.dueDate || undefined,
            startDate: data.startDate || undefined,
            cycleId: data.cycleId || undefined,
            parentId: data.parentId || defaultParentId || undefined,
            issueTypeId: data.issueTypeId || undefined,
            estimatePointId: data.estimatePointId || undefined,
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
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-layer-1 border-subtle text-primary">
                                                    <SelectValue placeholder="Seleccionar..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-layer-1 border-subtle">
                                                {states.map((state) => (
                                                    <SelectItem key={state.id} value={state.id} className="text-primary focus:bg-layer-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: state.color }} />
                                                            {state.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                                            <FormControl>
                                                <SelectTrigger className="bg-layer-1 border-subtle text-primary">
                                                    <SelectValue placeholder="Seleccionar..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="bg-layer-1 border-subtle">
                                                {([0, 1, 2, 3, 4] as const).map((p) => (
                                                    <SelectItem key={p} value={String(p)} className="text-primary focus:bg-layer-2">
                                                        {PRIORITY_LABELS[p]}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Assignees multi-select */}
                        <FormField
                            control={form.control}
                            name="assigneeIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Asignados</FormLabel>
                                    <MultiSelectPopover
                                        placeholder="Seleccionar miembros..."
                                        options={members.map((m) => ({ value: m.userId, label: m.displayName ?? m.email }))}
                                        selected={field.value ?? []}
                                        onChange={field.onChange}
                                    />
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
                                    <MultiSelectPopover
                                        placeholder="Seleccionar etiquetas..."
                                        options={labels.map((l) => ({ value: l.id, label: l.name, color: l.color }))}
                                        selected={field.value ?? []}
                                        onChange={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                        <FormField
                            control={form.control}
                            name="cycleId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Ciclo</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                                        <FormControl>
                                            <SelectTrigger className="bg-layer-1 border-subtle text-primary">
                                                <SelectValue placeholder="Sin ciclo" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-layer-1 border-subtle">
                                            {cycles.map((c) => (
                                                <SelectItem key={c.id} value={c.id} className="text-primary focus:bg-layer-2">
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Modules multi-select */}
                        <FormField
                            control={form.control}
                            name="moduleIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary">Módulos</FormLabel>
                                    <MultiSelectPopover
                                        placeholder="Seleccionar módulos..."
                                        options={modules.map((m) => ({ value: m.id, label: m.name }))}
                                        selected={field.value ?? []}
                                        onChange={field.onChange}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
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
                                            <MultiSelectPopover
                                                placeholder="Seleccionar estados..."
                                                options={states.map((s) => ({ value: s.id, label: s.name, color: s.color }))}
                                                selected={field.value ?? []}
                                                onChange={field.onChange}
                                            />
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

// — internal multi-select popover —

interface MultiSelectOption {
    value: string;
    label: string;
    color?: string;
}

interface MultiSelectPopoverProps {
    options: MultiSelectOption[];
    selected: string[];
    onChange: (value: string[]) => void;
    placeholder: string;
}

function MultiSelectPopover({ options, selected, onChange, placeholder }: MultiSelectPopoverProps): React.ReactElement {
    const [popoverOpen, setPopoverOpen] = useState(false);

    const toggle = (value: string): void => {
        onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
    };

    return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between bg-layer-1 border-subtle text-primary hover:bg-layer-2 font-normal min-h-9"
                >
                    {selected.length === 0 ? (
                        <span className="text-placeholder">{placeholder}</span>
                    ) : (
                        <div className="flex flex-wrap gap-1">
                            {selected.slice(0, 3).map((v) => {
                                const opt = options.find((o) => o.value === v);
                                return (
                                    <Badge key={v} variant="secondary" className="text-xs bg-layer-2 text-secondary border-subtle px-1.5 py-0">
                                        {opt?.color && (
                                            <span className="w-2 h-2 rounded-full mr-1 shrink-0 inline-block" style={{ backgroundColor: opt.color }} />
                                        )}
                                        {opt?.label ?? v}
                                    </Badge>
                                );
                            })}
                            {selected.length > 3 && (
                                <Badge variant="secondary" className="text-xs bg-layer-2 text-secondary border-subtle px-1.5 py-0">
                                    +{selected.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}
                    <ChevronsUpDown size={14} className="ml-2 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 bg-layer-1 border-subtle" align="start">
                <Command className="bg-transparent">
                    <CommandInput placeholder="Buscar..." className="text-primary placeholder:text-placeholder border-b border-subtle" />
                    <CommandList>
                        <CommandEmpty className="py-3 text-center text-sm text-secondary">Sin resultados</CommandEmpty>
                        <CommandGroup>
                            {options.map((opt) => (
                                <CommandItem
                                    key={opt.value}
                                    value={opt.label}
                                    onSelect={() => toggle(opt.value)}
                                    className="text-primary data-[selected=true]:bg-layer-2 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        {opt.color && (
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                                        )}
                                        <span className="truncate">{opt.label}</span>
                                    </div>
                                    <Check
                                        size={13}
                                        className={cn('ml-auto', selected.includes(opt.value) ? 'opacity-100' : 'opacity-0')}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
