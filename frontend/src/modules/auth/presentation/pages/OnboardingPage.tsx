import { useState, useEffect } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authRepository } from '../../infrastructure/auth-repository';
import { workspaceRepository } from '@/modules/workspaces/infrastructure/workspace-repository';
import { useAuthStore } from '../../application/auth-store';

type Step = 'profile' | 'workspace' | 'done';

const profileSchema = z.object({
    displayName: z.string().min(1, 'Requerido'),
});

const workspaceSchema = z.object({
    name: z.string().min(1, 'Requerido'),
    slug: z
        .string()
        .min(1, 'Requerido')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo letras, números y guiones'),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type WorkspaceFormData = z.infer<typeof workspaceSchema>;

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

const StepDots = ({ current }: { current: Step }): React.ReactElement => {
    const steps: Step[] = ['profile', 'workspace', 'done'];
    return (
        <div className="flex items-center gap-2 justify-center mb-8">
            {steps.map((s) => (
                <span
                    key={s}
                    className={`w-2 h-2 rounded-full transition-colors ${
                        s === current ? 'bg-blue-500' : 'bg-layer-2'
                    }`}
                />
            ))}
        </div>
    );
};

export const OnboardingPage = (): React.ReactElement => {
    const navigate = useNavigate();
    const { setUser } = useAuthStore();
    const [step, setStep] = useState<Step>('profile');
    const [createdSlug, setCreatedSlug] = useState('');
    const [saving, setSaving] = useState(false);

    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: { displayName: '' },
    });

    const workspaceForm = useForm<WorkspaceFormData>({
        resolver: zodResolver(workspaceSchema),
        defaultValues: { name: '', slug: '' },
    });

    const watchedName = workspaceForm.watch('name');
    useEffect(() => {
        const slug = generateSlug(watchedName);
        workspaceForm.setValue('slug', slug, { shouldValidate: false });
    }, [watchedName, workspaceForm]);

    const onSubmitProfile = async (data: ProfileFormData): Promise<void> => {
        setSaving(true);
        try {
            const updated = await authRepository.updateProfile({ displayName: data.displayName });
            setUser(updated);
            setStep('workspace');
        } catch {
            toast.error('Error al actualizar el perfil');
        } finally {
            setSaving(false);
        }
    };

    const onSubmitWorkspace = async (data: WorkspaceFormData): Promise<void> => {
        setSaving(true);
        try {
            const workspace = await workspaceRepository.create({ name: data.name, slug: data.slug });
            setCreatedSlug(workspace.slug);
            localStorage.setItem('onboardingCompleted', 'true');
            setStep('done');
        } catch {
            toast.error('El slug ya está en uso. Prueba con otro nombre.');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (step !== 'done' || !createdSlug) return;
        const timer = setTimeout(() => {
            void navigate(`/${createdSlug}/companies`);
        }, 1500);
        return () => clearTimeout(timer);
    }, [step, createdSlug, navigate]);

    const inputClass =
        'bg-layer-1 border-subtle text-primary placeholder:text-placeholder focus:border-strong transition-colors';

    return (
        <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
            <div className="w-full max-w-[480px]">
                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="text-xl font-bold text-primary tracking-tight">TaskManager</span>
                </div>

                <div className="bg-surface-2 border border-subtle rounded-xl p-8">
                    <StepDots current={step} />

                    {step === 'profile' && (
                        <>
                            <div className="mb-6">
                                <p className="text-xs text-placeholder mb-1">Paso 1 de 2</p>
                                <h1 className="text-lg font-semibold text-primary">Personaliza tu perfil</h1>
                                <p className="text-sm text-placeholder mt-1">
                                    ¿Cómo quieres que te vean los demás?
                                </p>
                            </div>
                            <Form {...profileForm}>
                                <form
                                    onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={profileForm.control}
                                        name="displayName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-secondary text-sm">
                                                    Nombre para mostrar
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Juan Pérez"
                                                        className={inputClass}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                                        disabled={saving}
                                    >
                                        {saving ? 'Guardando...' : 'Continuar'}
                                    </Button>
                                </form>
                            </Form>
                        </>
                    )}

                    {step === 'workspace' && (
                        <>
                            <div className="mb-6">
                                <p className="text-xs text-placeholder mb-1">Paso 2 de 2</p>
                                <h1 className="text-lg font-semibold text-primary">Crea tu espacio de trabajo</h1>
                                <p className="text-sm text-placeholder mt-1">
                                    Un espacio de trabajo agrupa todas tus empresas y proyectos.
                                </p>
                            </div>
                            <Form {...workspaceForm}>
                                <form
                                    onSubmit={workspaceForm.handleSubmit(onSubmitWorkspace)}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={workspaceForm.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-secondary text-sm">
                                                    Nombre del espacio de trabajo
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Mi empresa"
                                                        className={inputClass}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={workspaceForm.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-secondary text-sm">
                                                    URL del espacio de trabajo
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="mi-empresa"
                                                        className={inputClass}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                                        disabled={saving}
                                    >
                                        {saving ? 'Creando...' : 'Crear espacio de trabajo'}
                                    </Button>
                                </form>
                            </Form>
                        </>
                    )}

                    {step === 'done' && (
                        <div className="flex flex-col items-center gap-4 py-4">
                            <CheckCircle2 size={48} className="text-green-500" />
                            <h1 className="text-lg font-semibold text-primary">¡Todo listo!</h1>
                            <p className="text-sm text-placeholder">Redirigiendo...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
