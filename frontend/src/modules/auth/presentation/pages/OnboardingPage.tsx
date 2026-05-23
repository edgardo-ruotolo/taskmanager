import { useState, useEffect } from 'react';
import type React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CheckCircle2, Mail } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { authRepository } from '../../infrastructure/auth-repository';
import { workspaceRepository } from '@/modules/workspaces/infrastructure/workspace-repository';
import { setAuthSession } from '../../application/use-auth-me';
import { getOnboardingState, saveOnboardingState } from '../../application/onboarding-state';

export { getOnboardingState } from '../../application/onboarding-state';

type Step = 'welcome' | 'profile' | 'workspace' | 'invite' | 'done';

const STEPS: Step[] = ['welcome', 'profile', 'workspace', 'invite', 'done'];
const STEP_LABELS: Record<Step, string> = {
    welcome: 'Bienvenida',
    profile: 'Tu perfil',
    workspace: 'Espacio de trabajo',
    invite: 'Invita a tu equipo',
    done: 'Completado',
};

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

const inviteSchema = z.object({
    email: z.string().email('Email inválido').or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type WorkspaceFormData = z.infer<typeof workspaceSchema>;
type InviteFormData = z.infer<typeof inviteSchema>;

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

const inputClass =
    'bg-layer-1 border-subtle text-primary placeholder:text-placeholder focus:border-strong transition-colors';

interface StepHeaderProps {
    step: Step;
}

const StepHeader = ({ step }: StepHeaderProps): React.ReactElement => {
    const index = STEPS.indexOf(step);
    const progressPercent = (index / (STEPS.length - 1)) * 100;

    return (
        <div className="mb-6">
            {step !== 'done' && (
                <>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-placeholder">
                            Paso {index + 1} de {STEPS.length}
                        </p>
                        <p className="text-xs text-placeholder">{STEP_LABELS[step]}</p>
                    </div>
                    <Progress value={progressPercent} className="h-1 mb-4" />
                </>
            )}
        </div>
    );
};

// Step 1: Welcome
const WelcomeStep = ({ onNext }: { onNext: () => void }): React.ReactElement => (
    <div className="flex flex-col gap-4">
        <StepHeader step="welcome" />
        <div className="mb-4">
            <h1 className="text-lg font-semibold text-primary">Bienvenido a TaskManager</h1>
            <p className="text-sm text-placeholder mt-1">
                Vamos a configurar tu cuenta en unos pocos pasos. Tardarás menos de 2 minutos.
            </p>
        </div>
        <div className="bg-layer-1 border border-subtle rounded-lg p-4 text-sm text-secondary space-y-2">
            <p>✓ Personaliza tu perfil</p>
            <p>✓ Crea tu espacio de trabajo</p>
            <p>✓ Invita a tu equipo</p>
        </div>
        <Button
            className="w-full bg-accent-primary hover:bg-accent-primary-hover text-on-color mt-2"
            onClick={onNext}
        >
            Comenzar
        </Button>
    </div>
);

// Step 2: Profile
interface ProfileStepProps {
    onNext: () => void;
    onBack: () => void;
    saving: boolean;
    setSaving: (v: boolean) => void;
}

const ProfileStep = ({ onNext, onBack, saving, setSaving }: ProfileStepProps): React.ReactElement => {
    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: { displayName: '' },
    });

    const onSubmit = async (data: ProfileFormData): Promise<void> => {
        setSaving(true);
        try {
            const updated = await authRepository.updateProfile({ displayName: data.displayName });
            setAuthSession(updated);
            onNext();
        } catch {
            toast.error('Error al actualizar el perfil');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <StepHeader step="profile" />
            <div className="mb-6">
                <h1 className="text-lg font-semibold text-primary">Personaliza tu perfil</h1>
                <p className="text-sm text-placeholder mt-1">¿Cómo quieres que te vean los demás?</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-secondary text-sm">Nombre para mostrar</FormLabel>
                                <FormControl>
                                    <Input placeholder="Juan Pérez" className={inputClass} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onBack}
                            disabled={saving}
                        >
                            Anterior
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : 'Siguiente'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

// Step 3: Workspace
interface WorkspaceStepProps {
    onNext: (slug: string) => void;
    onBack: () => void;
    saving: boolean;
    setSaving: (v: boolean) => void;
}

const WorkspaceStep = ({ onNext, onBack, saving, setSaving }: WorkspaceStepProps): React.ReactElement => {
    const form = useForm<WorkspaceFormData>({
        resolver: zodResolver(workspaceSchema),
        defaultValues: { name: '', slug: '' },
    });

    const watchedName = form.watch('name');
    useEffect(() => {
        const slug = generateSlug(watchedName);
        form.setValue('slug', slug, { shouldValidate: false });
    }, [watchedName, form]);

    const onSubmit = async (data: WorkspaceFormData): Promise<void> => {
        setSaving(true);
        try {
            const workspace = await workspaceRepository.create({ name: data.name, slug: data.slug });
            onNext(workspace.slug);
        } catch {
            toast.error('El slug ya está en uso. Prueba con otro nombre.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <StepHeader step="workspace" />
            <div className="mb-6">
                <h1 className="text-lg font-semibold text-primary">Crea tu espacio de trabajo</h1>
                <p className="text-sm text-placeholder mt-1">
                    Un espacio de trabajo agrupa todas tus proyectos y proyectos.
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-secondary text-sm">Nombre del espacio</FormLabel>
                                <FormControl>
                                    <Input placeholder="Mi proyecto" className={inputClass} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-secondary text-sm">URL del espacio</FormLabel>
                                <FormControl>
                                    <Input placeholder="mi-proyecto" className={inputClass} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onBack}
                            disabled={saving}
                        >
                            Anterior
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                            disabled={saving}
                        >
                            {saving ? 'Creando...' : 'Crear espacio'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

// Step 4: Invite
interface InviteStepProps {
    onNext: () => void;
    onBack: () => void;
}

const InviteStep = ({ onNext, onBack }: InviteStepProps): React.ReactElement => {
    const [sent, setSent] = useState(false);
    const form = useForm<InviteFormData>({
        resolver: zodResolver(inviteSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = (data: InviteFormData): void => {
        if (data.email) {
            setSent(true);
            toast.success('Invitación enviada');
            form.reset();
        }
    };

    return (
        <div>
            <StepHeader step="invite" />
            <div className="mb-6">
                <h1 className="text-lg font-semibold text-primary">Invita a tu equipo</h1>
                <p className="text-sm text-placeholder mt-1">
                    Puedes saltarte este paso y hacerlo más tarde desde la configuración.
                </p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-secondary text-sm">Email del compañero</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail
                                            size={16}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-placeholder"
                                        />
                                        <Input
                                            type="email"
                                            placeholder="compañero@proyecto.com"
                                            className={`${inputClass} pl-9`}
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {sent && (
                        <p className="text-xs text-green-500">
                            Invitación enviada. Puedes invitar a más personas desde la configuración.
                        </p>
                    )}
                    <Button
                        type="submit"
                        variant="outline"
                        className="w-full"
                        disabled={!form.watch('email')}
                    >
                        Enviar invitación
                    </Button>
                </form>
            </Form>
            <div className="flex gap-2 mt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
                    Anterior
                </Button>
                <Button
                    type="button"
                    className="flex-1 bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                    onClick={onNext}
                >
                    {sent ? 'Continuar' : 'Saltar por ahora'}
                </Button>
            </div>
        </div>
    );
};

// Step 5: Done
const DoneStep = ({ workspaceSlug }: { workspaceSlug: string }): React.ReactElement => {
    const navigate = useNavigate();

    const handleGoToWorkspace = (): void => {
        const dest = workspaceSlug ? `/${workspaceSlug}/projects` : '/workspaces';
        void navigate(dest);
    };

    return (
        <div className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle2 size={56} className="text-green-500" />
            <h1 className="text-lg font-semibold text-primary">¡Todo listo!</h1>
            <p className="text-sm text-placeholder">
                Tu espacio de trabajo está configurado y listo para usar.
            </p>
            <Button
                className="w-full bg-accent-primary hover:bg-accent-primary-hover text-on-color mt-2"
                onClick={handleGoToWorkspace}
            >
                Ir al espacio de trabajo
            </Button>
        </div>
    );
};

export const OnboardingPage = (): React.ReactElement => {
    const navigate = useNavigate();
    const location = useLocation();
    const [step, setStep] = useState<Step>('welcome');
    const [workspaceSlug, setWorkspaceSlug] = useState('');
    const [saving, setSaving] = useState(false);

    // If already completed, redirect away
    useEffect(() => {
        const state = getOnboardingState();
        if (state.hasCompletedOnboarding && location.pathname === '/onboarding') {
            void navigate(workspaceSlug ? `/${workspaceSlug}/projects` : '/workspaces', { replace: true });
        }
    }, [navigate, location.pathname, workspaceSlug]);

    const goTo = (target: Step): void => {
        const currentIndex = STEPS.indexOf(step);
        const completedSteps = STEPS.slice(0, currentIndex + 1).filter((s) => s !== 'done');
        const prevState = getOnboardingState();
        saveOnboardingState({
            ...prevState,
            completedSteps: Array.from(new Set([...prevState.completedSteps, ...completedSteps])),
            currentStep: target,
        });
        setStep(target);
    };

    const next = (): void => {
        const idx = STEPS.indexOf(step);
        if (idx < STEPS.length - 1) goTo(STEPS[idx + 1]);
    };

    const back = (): void => {
        const idx = STEPS.indexOf(step);
        if (idx > 0) goTo(STEPS[idx - 1]);
    };

    const completeOnboarding = (slug: string): void => {
        setWorkspaceSlug(slug);
        saveOnboardingState({
            hasCompletedOnboarding: false,
            completedSteps: ['welcome', 'profile', 'workspace'],
            currentStep: 'invite',
        });
        goTo('invite');
    };

    const finishOnboarding = (): void => {
        saveOnboardingState({
            hasCompletedOnboarding: true,
            completedSteps: ['welcome', 'profile', 'workspace', 'invite'],
            currentStep: 'done',
        });
        setStep('done');
    };

    return (
        <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
            <div className="w-full max-w-[480px]">
                <div className="text-center mb-8">
                    <span className="text-xl font-bold text-primary tracking-tight">TaskManager</span>
                </div>
                <div className="bg-surface-2 border border-subtle rounded-xl p-8">
                    {step === 'welcome' && <WelcomeStep onNext={next} />}
                    {step === 'profile' && (
                        <ProfileStep onNext={next} onBack={back} saving={saving} setSaving={setSaving} />
                    )}
                    {step === 'workspace' && (
                        <WorkspaceStep
                            onNext={completeOnboarding}
                            onBack={back}
                            saving={saving}
                            setSaving={setSaving}
                        />
                    )}
                    {step === 'invite' && (
                        <InviteStep onNext={finishOnboarding} onBack={back} />
                    )}
                    {step === 'done' && <DoneStep workspaceSlug={workspaceSlug} />}
                </div>
            </div>
        </div>
    );
};
