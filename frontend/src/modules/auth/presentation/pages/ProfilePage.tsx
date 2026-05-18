import { useState } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import {
    User,
    Shield,
    Trash2,
    Settings,
    Bell,
    Activity,
    Key,
    Sun,
    Moon,
    Monitor,
    AlignJustify,
    LayoutList,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
    updateProfileSchema,
    changePasswordSchema,
    type UpdateProfileFormData,
    type ChangePasswordFormData,
} from '../../application/schemas';
import { authRepository } from '../../infrastructure/auth-repository';
import { useAuthStore } from '../../application/auth-store';

const inputClass =
    'bg-layer-1 border-subtle text-primary placeholder:text-placeholder focus:border-strong transition-colors';

type ProfileTab = 'general' | 'preferences' | 'notifications' | 'security' | 'activity' | 'tokens';

interface NavItem {
    id: ProfileTab;
    label: string;
    icon: React.ElementType;
}

const YOUR_PROFILE_ITEMS: NavItem[] = [
    { id: 'general', label: 'Perfil', icon: User },
    { id: 'preferences', label: 'Preferencias', icon: Settings },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'activity', label: 'Actividad', icon: Activity },
];

const DEV_ITEMS: NavItem[] = [
    { id: 'tokens', label: 'Tokens de acceso', icon: Key },
];

function ProfileSidebar({
    activeTab,
    onTabChange,
    user,
}: {
    activeTab: ProfileTab;
    onTabChange: (tab: ProfileTab) => void;
    user: { displayName?: string | null; username: string; email: string; avatarUrl?: string | null; firstName?: string | null; lastName?: string | null } | null;
}): React.ReactElement {
    const initials = user
        ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() ||
          user.username[0].toUpperCase()
        : '?';

    const renderItem = (item: NavItem): React.ReactElement => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
            <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                    'flex items-center gap-2.5 w-full px-2 py-1.5 rounded-sm text-[13px] font-medium transition-colors text-left',
                    isActive
                        ? 'bg-accent-subtle text-accent-primary'
                        : 'text-secondary hover:bg-layer-transparent-hover hover:text-primary',
                )}
            >
                <Icon size={15} className="shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
            </button>
        );
    };

    return (
        <nav className="w-[220px] shrink-0 border-r border-subtle pr-4 space-y-5">
            {/* User info */}
            <div className="flex items-center gap-3 px-2 pb-3 border-b border-subtle">
                <div className="w-9 h-9 rounded-full bg-accent-subtle border border-accent-subtle flex items-center justify-center text-sm font-semibold text-accent-primary shrink-0 overflow-hidden">
                    {user?.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt={user.displayName ?? user.username}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        initials
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-primary truncate">
                        {user?.displayName ?? user?.username ?? 'Usuario'}
                    </p>
                    <p className="text-[11px] text-placeholder truncate">{user?.email}</p>
                </div>
            </div>

            {/* Your Profile section */}
            <div>
                <p className="text-[11px] font-semibold text-placeholder uppercase tracking-wider px-2 mb-1">
                    Tu perfil
                </p>
                <div className="space-y-0.5">
                    {YOUR_PROFILE_ITEMS.map(renderItem)}
                </div>
            </div>

            {/* Developer section */}
            <div>
                <p className="text-[11px] font-semibold text-placeholder uppercase tracking-wider px-2 mb-1">
                    Desarrollador
                </p>
                <div className="space-y-0.5">
                    {DEV_ITEMS.map(renderItem)}
                </div>
            </div>
        </nav>
    );
}

function SectionHeader({ title, description }: { title: string; description: string }): React.ReactElement {
    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-base font-semibold text-primary">{title}</h3>
                <p className="text-sm text-tertiary mt-0.5">{description}</p>
            </div>
            <Separator className="bg-subtle" />
        </div>
    );
}

function GeneralTab(): React.ReactElement {
    const { user, setUser } = useAuthStore();
    const [savingProfile, setSavingProfile] = useState(false);

    const profileForm = useForm<UpdateProfileFormData>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            displayName: user?.displayName ?? '',
        },
    });

    const onSaveProfile = async (data: UpdateProfileFormData): Promise<void> => {
        setSavingProfile(true);
        try {
            const updated = await authRepository.updateProfile(data);
            setUser(updated);
            toast.success('Perfil actualizado');
        } catch {
            toast.error('Error al actualizar el perfil');
        } finally {
            setSavingProfile(false);
        }
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Perfil"
                description="Actualiza tu nombre y cómo apareces en el sistema."
            />
            <Form {...profileForm}>
                <form
                    onSubmit={profileForm.handleSubmit(onSaveProfile)}
                    className="space-y-4 max-w-lg"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={profileForm.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-sm">Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Juan" className={inputClass} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={profileForm.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-sm">Apellido</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Pérez" className={inputClass} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={profileForm.control}
                        name="displayName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-secondary text-sm">
                                    Nombre de usuario
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="juanperez" className={inputClass} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                        disabled={savingProfile}
                    >
                        {savingProfile ? 'Guardando...' : 'Actualizar perfil'}
                    </Button>
                </form>
            </Form>
        </div>
    );
}

type ThemeOption = 'light' | 'dark' | 'system';
type DensityOption = 'comfortable' | 'compact';

const THEME_OPTIONS: { id: ThemeOption; label: string; icon: React.ElementType }[] = [
    { id: 'light', label: 'Claro', icon: Sun },
    { id: 'dark', label: 'Oscuro', icon: Moon },
    { id: 'system', label: 'Sistema', icon: Monitor },
];

const DENSITY_OPTIONS: { id: DensityOption; label: string; icon: React.ElementType }[] = [
    { id: 'comfortable', label: 'Cómodo', icon: AlignJustify },
    { id: 'compact', label: 'Compacto', icon: LayoutList },
];

function PreferencesTab(): React.ReactElement {
    const { theme, setTheme } = useTheme();
    const [density, setDensity] = useState<DensityOption>('comfortable');

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Preferencias"
                description="Personaliza la experiencia de la aplicación según tu forma de trabajar"
            />

            {/* Theme */}
            <div className="space-y-3">
                <div>
                    <p className="text-sm font-medium text-primary">Tema</p>
                    <p className="text-xs text-placeholder mt-0.5">
                        Selecciona o personaliza el esquema de colores de tu interfaz.
                    </p>
                </div>
                <div className="flex gap-3">
                    {THEME_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = theme === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setTheme(opt.id)}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium border transition-all',
                                    isActive
                                        ? 'border-accent-primary bg-accent-subtle text-accent-primary ring-2 ring-accent-primary/20'
                                        : 'border-subtle text-secondary hover:bg-layer-transparent-hover hover:text-primary',
                                )}
                            >
                                <Icon size={14} aria-hidden="true" />
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <Separator className="bg-subtle" />

            {/* Language & Time */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-primary">Idioma y zona horaria</h4>

                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="text-sm font-medium text-primary">Densidad de vista</p>
                        <p className="text-xs text-placeholder mt-0.5">
                            Controla el espaciado de los elementos en la interfaz.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {DENSITY_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            const isActive = density === opt.id;
                            return (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setDensity(opt.id)}
                                    className={cn(
                                        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium border transition-all',
                                        isActive
                                            ? 'border-accent-primary bg-accent-subtle text-accent-primary'
                                            : 'border-subtle text-secondary hover:bg-layer-transparent-hover hover:text-primary',
                                    )}
                                >
                                    <Icon size={13} aria-hidden="true" />
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SecurityTab(): React.ReactElement {
    const navigate = useNavigate();
    const { clearAuth } = useAuthStore();
    const [savingPassword, setSavingPassword] = useState(false);

    const passwordForm = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    });

    const onChangePassword = async (data: ChangePasswordFormData): Promise<void> => {
        setSavingPassword(true);
        try {
            await authRepository.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
            });
            toast.success('Contraseña actualizada');
            passwordForm.reset();
        } catch {
            toast.error('Contraseña actual incorrecta');
        } finally {
            setSavingPassword(false);
        }
    };

    const onDeactivate = async (): Promise<void> => {
        try {
            await authRepository.deactivateAccount();
            clearAuth();
            toast.success('Cuenta desactivada');
            void navigate('/login');
        } catch {
            toast.error('Error al desactivar la cuenta');
        }
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Seguridad"
                description="Gestiona tu contraseña y la seguridad de tu cuenta."
            />

            <div className="space-y-4 max-w-lg">
                <p className="text-sm font-medium text-secondary">Cambiar contraseña</p>
                <Form {...passwordForm}>
                    <form
                        onSubmit={passwordForm.handleSubmit(onChangePassword)}
                        className="space-y-4"
                    >
                        <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-sm">
                                        Contraseña actual
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className={inputClass}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-sm">
                                        Nueva contraseña
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
                                            className={inputClass}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-secondary text-sm">
                                        Confirmar contraseña
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="••••••••"
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
                            className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                            disabled={savingPassword}
                        >
                            {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                        </Button>
                    </form>
                </Form>
            </div>

            {/* Danger zone */}
            <div className="space-y-4 pt-4">
                <Separator className="bg-subtle" />
                <p className="text-sm font-medium text-red-400">Zona de peligro</p>
                <div className="flex items-center justify-between p-4 rounded-lg border border-red-900/40 bg-red-950/10">
                    <div>
                        <p className="text-sm font-medium text-primary">Desactivar cuenta</p>
                        <p className="text-xs text-placeholder mt-0.5">
                            Tu cuenta será desactivada y perderás acceso al sistema.
                        </p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-1.5"
                            >
                                <Trash2 size={13} aria-hidden="true" />
                                Desactivar
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-surface-2 border-subtle">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-primary">
                                    ¿Desactivar cuenta?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-placeholder">
                                    Esta acción es irreversible. Perderás acceso a todos tus
                                    workspaces y proyectos.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-layer-2 border-subtle text-secondary hover:bg-layer-3">
                                    Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => void onDeactivate()}
                                    className="bg-destructive hover:bg-destructive/90 text-on-color"
                                >
                                    Sí, desactivar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}

interface NotifSetting {
    id: string;
    label: string;
    description: string;
    inApp: boolean;
    email: boolean;
}

const DEFAULT_NOTIF_SETTINGS: NotifSetting[] = [
    { id: 'assigned', label: 'Tarea asignada a mí', description: 'Cuando se te asigna una tarea', inApp: true, email: true },
    { id: 'mentioned', label: 'Mencionado', description: 'Cuando te mencionan en un comentario', inApp: true, email: true },
    { id: 'state_changed', label: 'Estado actualizado', description: 'Cuando cambia el estado de una tarea tuya', inApp: true, email: false },
    { id: 'comment', label: 'Nuevo comentario', description: 'En tareas donde participas', inApp: true, email: false },
    { id: 'cycle_started', label: 'Ciclo iniciado', description: 'Cuando un ciclo que integras inicia', inApp: true, email: false },
    { id: 'weekly_summary', label: 'Resumen semanal', description: 'Resumen de actividad del espacio de trabajo', inApp: false, email: true },
];

function NotificationsTab(): React.ReactElement {
    const [settings, setSettings] = useState<NotifSetting[]>(DEFAULT_NOTIF_SETTINGS);

    const toggle = (id: string, field: 'inApp' | 'email'): void => {
        setSettings((prev) =>
            prev.map((s) => (s.id === id ? { ...s, [field]: !s[field] } : s)),
        );
    };

    const handleSave = (): void => {
        toast.success('Preferencias guardadas');
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Notificaciones"
                description="Configura cómo y cuándo recibes notificaciones."
            />
            <div className="max-w-2xl">
                <div className="border border-subtle rounded-lg overflow-hidden">
                    <div className="grid grid-cols-[1fr_80px_80px] px-4 py-2 bg-layer-1 border-b border-subtle text-[11px] font-semibold text-placeholder uppercase tracking-wider">
                        <span>Evento</span>
                        <span className="text-center">En app</span>
                        <span className="text-center">Correo</span>
                    </div>
                    {settings.map((s) => (
                        <div
                            key={s.id}
                            className="grid grid-cols-[1fr_80px_80px] items-center px-4 py-3 border-b border-subtle last:border-b-0 hover:bg-layer-transparent-hover transition-colors"
                        >
                            <div>
                                <p className="text-sm font-medium text-primary">{s.label}</p>
                                <p className="text-xs text-placeholder mt-0.5">{s.description}</p>
                            </div>
                            <div className="flex justify-center">
                                <input
                                    type="checkbox"
                                    checked={s.inApp}
                                    onChange={() => toggle(s.id, 'inApp')}
                                    aria-label={`${s.label} en app`}
                                    className="w-4 h-4 accent-accent-primary cursor-pointer"
                                />
                            </div>
                            <div className="flex justify-center">
                                <input
                                    type="checkbox"
                                    checked={s.email}
                                    onChange={() => toggle(s.id, 'email')}
                                    aria-label={`${s.label} por email`}
                                    className="w-4 h-4 accent-accent-primary cursor-pointer"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <Button
                    className="mt-4 bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                    onClick={handleSave}
                >
                    Guardar preferencias
                </Button>
            </div>
        </div>
    );
}

const HEATMAP_WEEKS = 52;
const HEATMAP_DAYS = 7;
const MONTH_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DAY_LABELS = [
    { key: 'mon', label: 'L' },
    { key: 'tue', label: '' },
    { key: 'wed', label: 'X' },
    { key: 'thu', label: '' },
    { key: 'fri', label: 'V' },
    { key: 'sat', label: '' },
    { key: 'sun', label: 'D' },
] as const;

function heatmapCellColor(level: number): string {
    if (level === 0) return 'bg-layer-1';
    if (level === 1) return 'bg-accent-primary/20';
    if (level === 2) return 'bg-accent-primary/40';
    if (level === 3) return 'bg-accent-primary/70';
    return 'bg-accent-primary';
}

function ActivityHeatmap(): React.ReactElement {
    const weeks = Array.from({ length: HEATMAP_WEEKS }, (_, w) => w);
    const days = Array.from({ length: HEATMAP_DAYS }, (_, d) => d);

    return (
        <div className="overflow-x-auto" role="img" aria-label="Mapa de actividad anual">
            <div className="flex gap-[2px] mb-1 pl-7" aria-hidden="true">
                {MONTH_LABELS.map((m) => (
                    <span
                        key={m}
                        className="text-[10px] text-placeholder"
                        style={{ width: `${Math.floor((HEATMAP_WEEKS / 12) * 12)}px` }}
                    >
                        {m}
                    </span>
                ))}
            </div>
            <div className="flex gap-1" aria-hidden="true">
                <div className="flex flex-col gap-[3px] mt-0.5">
                    {DAY_LABELS.map(({ key, label }) => (
                        <span
                            key={key}
                            className="text-[10px] text-placeholder w-5 h-[10px] flex items-center justify-end pr-1"
                        >
                            {label}
                        </span>
                    ))}
                </div>
                <div className="flex gap-[3px]">
                    {weeks.map((week) => (
                        <div key={`w${week}`} className="flex flex-col gap-[3px]">
                            {days.map((day) => (
                                <div
                                    key={`w${week}d${day}`}
                                    className={cn('w-[10px] h-[10px] rounded-[2px]', heatmapCellColor(0))}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3 justify-end" aria-hidden="true">
                <span className="text-[10px] text-placeholder">Menos</span>
                {[0, 1, 2, 3, 4].map((level) => (
                    <div
                        key={`legend-${level}`}
                        className={cn('w-[10px] h-[10px] rounded-[2px]', heatmapCellColor(level))}
                    />
                ))}
                <span className="text-[10px] text-placeholder">Más</span>
            </div>
        </div>
    );
}

function ActivityTab(): React.ReactElement {
    return (
        <div className="space-y-6">
            <SectionHeader
                title="Actividad"
                description="Tu historial de actividad en el espacio de trabajo durante el último año."
            />
            <div className="border border-subtle rounded-lg p-5 bg-layer-1/20">
                <p className="text-xs font-semibold text-placeholder uppercase tracking-wider mb-4">
                    Contribuciones
                </p>
                <ActivityHeatmap />
                <p className="text-xs text-placeholder mt-4 text-center italic">
                    El historial de actividad se actualizará conforme uses el sistema.
                </p>
            </div>
        </div>
    );
}

function TokensTab(): React.ReactElement {
    return (
        <div className="space-y-6">
            <SectionHeader
                title="Tokens de acceso personal"
                description="Gestiona tus tokens de acceso para la API."
            />
            <p className="text-sm text-placeholder">
                Los tokens te permiten autenticarte en la API sin usar tu contraseña.
            </p>
        </div>
    );
}

export const ProfilePage = (): React.ReactElement => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<ProfileTab>('general');

    const renderContent = (): React.ReactElement => {
        switch (activeTab) {
            case 'general':
                return <GeneralTab />;
            case 'preferences':
                return <PreferencesTab />;
            case 'security':
                return <SecurityTab />;
            case 'notifications':
                return <NotificationsTab />;
            case 'activity':
                return <ActivityTab />;
            case 'tokens':
                return <TokensTab />;
            default:
                return <GeneralTab />;
        }
    };

    return (
        <div className="p-6 md:p-8 min-h-screen">
            <div className="max-w-5xl mx-auto">
                <div className="flex gap-0">
                    <ProfileSidebar
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        user={user}
                    />

                    <div className="flex-1 pl-8">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};
