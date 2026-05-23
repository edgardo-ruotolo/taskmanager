import type React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
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
    FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    CheckCircle2,
    CircleDot,
    RefreshCw,
    Layers,
    LayoutGrid,
    FileText,
    Inbox,
} from 'lucide-react';
import type { Project } from '../../domain/types';
import { createProjectSchema, type CreateProjectFormData } from '../../application/schemas';
import { useCreateProject } from '../../application/use-projects';

interface CreateProjectDialogProps {
    workspaceSlug: string;
    trigger: React.ReactNode;
}

const COMPANY_FEATURES = [
    { label: 'Tareas', Icon: CircleDot },
    { label: 'Ciclos', Icon: RefreshCw },
    { label: 'Módulos', Icon: Layers },
    { label: 'Vistas', Icon: LayoutGrid },
    { label: 'Páginas', Icon: FileText },
    { label: 'Solicitudes', Icon: Inbox },
] as const;

interface FeaturesModalProps {
    open: boolean;
    project: Project | null;
    workspaceSlug: string;
    onClose: () => void;
}

function ProjectFeaturesModal({ open, project, workspaceSlug, onClose }: FeaturesModalProps): React.ReactElement {
    const navigate = useNavigate();

    const handleGo = (): void => {
        if (project) {
            void navigate(`/${workspaceSlug}/projects/${project.id}/issues`);
        }
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
            <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-sm">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-400 shrink-0" aria-hidden="true" />
                        <DialogTitle className="text-primary">Proyecto creada</DialogTitle>
                    </div>
                </DialogHeader>
                <p className="text-sm text-secondary -mt-1">
                    Características habilitadas en{' '}
                    <span className="font-medium text-primary">{project?.name ?? ''}</span>:
                </p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                    {COMPANY_FEATURES.map(({ label, Icon }) => (
                        <div
                            key={label}
                            className="flex items-center gap-2 px-3 py-2.5 bg-surface-2 rounded-md border border-subtle"
                        >
                            <Icon size={13} className="text-placeholder shrink-0" aria-hidden="true" />
                            <span className="text-xs text-secondary">{label}</span>
                        </div>
                    ))}
                </div>
                <Button
                    className="w-full mt-2 bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                    onClick={handleGo}
                >
                    Ir a la proyecto
                </Button>
            </DialogContent>
        </Dialog>
    );
}

export const CreateProjectDialog = ({
    workspaceSlug,
    trigger,
}: CreateProjectDialogProps): React.ReactElement => {
    const [open, setOpen] = useState(false);
    const [identifierTouched, setIdentifierTouched] = useState(false);
    const [featuresOpen, setFeaturesOpen] = useState(false);
    const [newProject, setNewProject] = useState<Project | null>(null);

    const form = useForm<CreateProjectFormData>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: { name: '', identifier: '', description: '' },
    });

    const { mutate, isPending } = useCreateProject<CreateProjectFormData>(workspaceSlug, {
        setError: form.setError,
    });

    const nameValue = form.watch('name');

    useEffect(() => {
        if (identifierTouched) return;
        const identifier = nameValue
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, 5);
        form.setValue('identifier', identifier, { shouldValidate: false });
    }, [nameValue, form, identifierTouched]);

    const onSubmit = (data: CreateProjectFormData): void => {
        mutate(data, {
            onSuccess: (created) => {
                form.reset();
                setIdentifierTouched(false);
                setOpen(false);
                setNewProject(created);
                setFeaturesOpen(true);
            },
        });
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="bg-surface-1 border-subtle text-primary sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-primary">Nueva Proyecto</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Nombre</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Mi Proyecto S.A."
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
                                name="identifier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Identificador</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="EMPRESA"
                                                className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder uppercase"
                                                maxLength={10}
                                                {...field}
                                                onChange={(e) => {
                                                    setIdentifierTouched(true);
                                                    field.onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription className="text-placeholder text-xs">
                                            Solo mayúsculas y números. Máximo 10 caracteres.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary">Descripción (opcional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Descripción de la proyecto..."
                                                className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder resize-none"
                                                rows={3}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setOpen(false)}
                                    className="text-tertiary hover:text-primary"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isPending}
                                    className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                                >
                                    {isPending ? 'Creando...' : 'Crear proyecto'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <ProjectFeaturesModal
                open={featuresOpen}
                project={newProject}
                workspaceSlug={workspaceSlug}
                onClose={() => setFeaturesOpen(false)}
            />
        </>
    );
};
