import { useState } from 'react';
import type React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    UserX,
    Send,
    Shield,
    User,
    Trash2,
    Settings,
    Users,
    Webhook,
    Key,
    CreditCard,
    Download,
    Palette,
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
import { workspaceRepository } from '../../infrastructure/workspace-repository';
import { WORKSPACES_KEY, workspaceMembersKey, workspaceInvitationsKey, useWorkspaceTheme, useUpdateWorkspaceTheme } from '../../application/use-workspaces';
import type { WorkspaceMember } from '../../domain/types';
import type { UpdateWorkspaceThemeData } from '../../domain/theme-types';

const settingsSchema = z.object({
    name: z.string().min(1, 'Requerido').max(255),
    description: z.string().max(1000).optional(),
});
type SettingsForm = z.infer<typeof settingsSchema>;

const inviteSchema = z.object({
    email: z.string().email('Email inválido'),
});
type InviteForm = z.infer<typeof inviteSchema>;

const inputClass =
    'bg-layer-1 border-subtle text-primary placeholder:text-placeholder focus:border-strong transition-colors';

interface SettingsNavItem {
    to: string;
    label: string;
    icon: React.ElementType;
    disabled?: boolean;
}

const ADMIN_ITEMS: SettingsNavItem[] = [
    { to: 'general', label: 'General', icon: Settings },
    { to: 'members', label: 'Miembros', icon: Users },
    { to: 'theme', label: 'Tema', icon: Palette },
    { to: 'billing', label: 'Facturación', icon: CreditCard },
    { to: 'exports', label: 'Exportaciones', icon: Download },
];

const DEV_ITEMS: SettingsNavItem[] = [
    { to: 'webhooks', label: 'Webhooks', icon: Webhook },
    { to: 'tokens', label: 'Tokens de API', icon: Key },
];

function SettingsSidebar({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }): React.ReactElement {
    const renderItem = (item: SettingsNavItem): React.ReactElement => {
        const Icon = item.icon;
        const isActive = activeTab === item.to;
        return (
            <button
                key={item.to}
                type="button"
                disabled={item.disabled}
                onClick={() => !item.disabled && onTabChange(item.to)}
                className={cn(
                    'flex items-center gap-2.5 w-full px-2 py-1.5 rounded-sm text-[13px] font-medium transition-colors text-left',
                    isActive
                        ? 'bg-accent-subtle text-accent-primary'
                        : 'text-secondary hover:bg-layer-transparent-hover hover:text-primary',
                    item.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-secondary',
                )}
            >
                <Icon size={15} className="shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
            </button>
        );
    };

    return (
        <nav className="w-[220px] shrink-0 border-r border-subtle pr-4 space-y-4">
            <div>
                <p className="text-[11px] font-semibold text-placeholder uppercase tracking-wider px-2 mb-1">
                    Administración
                </p>
                <div className="space-y-0.5">
                    {ADMIN_ITEMS.map(renderItem)}
                </div>
            </div>
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

const RoleBadge = ({ role }: { role: WorkspaceMember['role'] }): React.ReactElement => {
    const colors: Record<string, string> = {
        Admin: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
        Member: 'bg-surface-1/50 text-secondary border border-subtle',
        Guest: 'bg-surface-1/30 text-placeholder border border-subtle',
    };
    return (
        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${colors[role] ?? ''}`}>
            {role}
        </span>
    );
};

function GeneralTab({ workspaceSlug }: { workspaceSlug: string }): React.ReactElement {
    const qc = useQueryClient();

    const settingsForm = useForm<SettingsForm>({ resolver: zodResolver(settingsSchema) });

    const updateMutation = useMutation({
        mutationFn: (data: SettingsForm) => workspaceRepository.update(workspaceSlug, data),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: WORKSPACES_KEY });
            toast.success('Espacio de trabajo actualizado');
        },
        onError: () => toast.error('Error al actualizar'),
    });

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Información general"
                description="Nombre y descripción del workspace."
            />
            <Form {...settingsForm}>
                <form
                    onSubmit={settingsForm.handleSubmit((d) => updateMutation.mutate(d))}
                    className="space-y-4 max-w-lg"
                >
                    <FormField
                        control={settingsForm.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-secondary text-sm">Nombre del workspace</FormLabel>
                                <FormControl>
                                    <Input className={inputClass} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={settingsForm.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-secondary text-sm">Descripción</FormLabel>
                                <FormControl>
                                    <Input className={inputClass} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? 'Actualizando...' : 'Actualizar workspace'}
                    </Button>
                </form>
            </Form>

            {/* Danger zone */}
            <div className="space-y-4 pt-4">
                <SectionHeader
                    title="Zona de peligro"
                    description="Las acciones aquí son permanentes e irreversibles."
                />
                <div className="flex items-center justify-between p-4 rounded-lg border border-red-900/40 bg-red-950/10">
                    <div>
                        <p className="text-sm font-medium text-primary">Eliminar este workspace</p>
                        <p className="text-xs text-placeholder mt-0.5">
                            Al eliminar un workspace, todos los datos se eliminarán permanentemente.
                        </p>
                    </div>
                    <Button variant="destructive" size="sm">
                        Eliminar
                    </Button>
                </div>
            </div>
        </div>
    );
}

function MembersTab({ workspaceSlug }: { workspaceSlug: string }): React.ReactElement {
    const qc = useQueryClient();

    const inviteForm = useForm<InviteForm>({ resolver: zodResolver(inviteSchema) });

    const { data: members = [], isLoading: loadingMembers } = useQuery({
        queryKey: workspaceMembersKey(workspaceSlug),
        queryFn: () => workspaceRepository.getMembers(workspaceSlug),
        enabled: !!workspaceSlug,
    });

    const { data: invitations = [] } = useQuery({
        queryKey: workspaceInvitationsKey(workspaceSlug),
        queryFn: () => workspaceRepository.getInvitations(workspaceSlug),
        enabled: !!workspaceSlug,
    });

    const removeMutation = useMutation({
        mutationFn: (userId: string) => workspaceRepository.removeMember(workspaceSlug, userId),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: workspaceMembersKey(workspaceSlug) });
            toast.success('Miembro eliminado');
        },
        onError: () => toast.error('Error al eliminar miembro'),
    });

    const revokeInviteMutation = useMutation({
        mutationFn: (id: string) => workspaceRepository.revokeInvitation(workspaceSlug, id),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: workspaceInvitationsKey(workspaceSlug) });
            toast.success('Invitación revocada');
        },
    });

    const inviteMutation = useMutation({
        mutationFn: (data: InviteForm) =>
            workspaceRepository.invite(workspaceSlug, { email: data.email, role: 'Member' }),
        onSuccess: () => {
            void qc.invalidateQueries({ queryKey: workspaceInvitationsKey(workspaceSlug) });
            void qc.invalidateQueries({ queryKey: workspaceMembersKey(workspaceSlug) });
            inviteForm.reset();
            toast.success('Invitación enviada');
        },
        onError: () => toast.error('Error al enviar la invitación'),
    });

    const onInvite = (data: InviteForm): void => {
        inviteMutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Miembros"
                description="Gestiona los miembros del workspace y sus roles."
            />

            {/* Invite */}
            <div className="space-y-2">
                <p className="text-sm font-medium text-secondary">Invitar miembro</p>
                <Form {...inviteForm}>
                    <form onSubmit={inviteForm.handleSubmit(onInvite)} className="flex gap-2 max-w-lg">
                        <FormField
                            control={inviteForm.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="email@ejemplo.com"
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
                            className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-1.5 shrink-0"
                            disabled={inviteMutation.isPending}
                        >
                            <Send size={13} aria-hidden="true" />
                            {inviteMutation.isPending ? 'Enviando...' : 'Invitar'}
                        </Button>
                    </form>
                </Form>
            </div>

            {/* Members list */}
            <div>
                <p className="text-sm font-medium text-secondary mb-3">
                    Miembros activos
                    <span className="ml-2 text-xs font-normal text-placeholder">({members.length})</span>
                </p>
                <div className="border border-subtle rounded-lg overflow-hidden">
                    {loadingMembers ? (
                        <div className="p-4 space-y-3">
                            {(['sk0', 'sk1', 'sk2'] as const).map((k) => (
                                <div key={k} className="h-10 rounded animate-shimmer bg-layer-1" />
                            ))}
                        </div>
                    ) : (
                        <ul className="divide-y divide-subtle">
                            {members.map((m) => (
                                <li key={m.userId} className="flex items-center justify-between px-4 py-3 hover:bg-layer-transparent-hover transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-full bg-layer-2 flex items-center justify-center text-xs font-medium text-secondary overflow-hidden">
                                            {m.avatarUrl ? (
                                                <img
                                                    src={m.avatarUrl}
                                                    alt={m.displayName ?? m.email}
                                                    className="w-full h-full rounded-full object-cover"
                                                />
                                            ) : (
                                                <User size={12} aria-hidden="true" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-primary">{m.displayName ?? m.email}</p>
                                            {m.displayName && (
                                                <p className="text-xs text-placeholder">{m.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RoleBadge role={m.role} />
                                        {m.role !== 'Admin' && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="p-1 text-placeholder hover:text-red-400 transition-colors rounded"
                                                        aria-label="Eliminar miembro"
                                                    >
                                                        <UserX size={14} aria-hidden="true" />
                                                    </button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-surface-2 border-subtle">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="text-primary">
                                                            ¿Eliminar miembro?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription className="text-placeholder">
                                                            {m.email} perderá acceso al workspace.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="bg-layer-2 border-subtle text-secondary">
                                                            Cancelar
                                                        </AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => removeMutation.mutate(m.userId)}
                                                            className="bg-destructive hover:bg-destructive/90 text-on-color"
                                                        >
                                                            Eliminar
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                        {m.role === 'Admin' && (
                                            <Shield size={14} className="text-blue-400" aria-label="Administrador" />
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Pending invitations */}
            {invitations.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-secondary mb-3">
                        Invitaciones pendientes
                        <span className="ml-2 text-xs font-normal text-placeholder">({invitations.length})</span>
                    </p>
                    <div className="border border-subtle rounded-lg overflow-hidden">
                        <ul className="divide-y divide-subtle">
                            {invitations.map((inv) => (
                                <li key={inv.id} className="flex items-center justify-between px-4 py-3 hover:bg-layer-transparent-hover transition-colors">
                                    <div>
                                        <p className="text-sm text-primary">{inv.email}</p>
                                        <p className="text-xs text-placeholder">
                                            Expira: {new Date(inv.expiresAt).toLocaleDateString('es-AR')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <RoleBadge role={inv.role} />
                                        <button
                                            type="button"
                                            onClick={() => revokeInviteMutation.mutate(inv.id)}
                                            className="p-1 text-placeholder hover:text-red-400 transition-colors rounded"
                                            aria-label="Revocar invitación"
                                        >
                                            <Trash2 size={14} aria-hidden="true" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

function WebhooksTab(): React.ReactElement {
    return (
        <div className="space-y-6">
            <SectionHeader
                title="Webhooks"
                description="Configura webhooks para recibir eventos del espacio de trabajo en tu servidor."
            />
            <p className="text-sm text-placeholder">
                Gestiona los webhooks desde{' '}
                <NavLink to="../settings/webhooks" className="text-accent-primary hover:underline">
                    la página de webhooks
                </NavLink>
                .
            </p>
        </div>
    );
}

function TokensTab(): React.ReactElement {
    return (
        <div className="space-y-6">
            <SectionHeader
                title="Tokens de API"
                description="Gestiona tus tokens de acceso personal para la API."
            />
            <p className="text-sm text-placeholder">
                Gestiona los tokens desde{' '}
                <NavLink to="../settings/tokens" className="text-accent-primary hover:underline">
                    la página de Tokens de API
                </NavLink>
                .
            </p>
        </div>
    );
}

const THEME_MODES = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Oscuro' },
    { value: 'system', label: 'Sistema' },
] as const;

interface ColorState {
    primaryColor: string;
    textColor: string;
    backgroundColor: string;
    sidebarColor: string;
    accentColor: string;
}

const COLOR_FIELDS: { key: keyof ColorState; label: string }[] = [
    { key: 'primaryColor', label: 'Color primario' },
    { key: 'textColor', label: 'Color de texto' },
    { key: 'backgroundColor', label: 'Fondo' },
    { key: 'sidebarColor', label: 'Sidebar' },
    { key: 'accentColor', label: 'Acento' },
];

function ThemeTab({ workspaceSlug }: { workspaceSlug: string }): React.ReactElement {
    const { data: theme } = useWorkspaceTheme(workspaceSlug);
    const updateTheme = useUpdateWorkspaceTheme(workspaceSlug);

    const [mode, setMode] = useState<'light' | 'dark' | 'system'>(theme?.theme ?? 'system');

    const [colors, setColors] = useState<ColorState>({
        primaryColor: theme?.primaryColor ?? '#6366f1',
        textColor: theme?.textColor ?? '#ffffff',
        backgroundColor: theme?.backgroundColor ?? '#0d0d12',
        sidebarColor: theme?.sidebarColor ?? '#1a1a23',
        accentColor: theme?.accentColor ?? '#6366f1',
    });

    const handleSave = (): void => {
        const data: UpdateWorkspaceThemeData = {
            theme: mode,
            primaryColor: colors.primaryColor,
            textColor: colors.textColor,
            backgroundColor: colors.backgroundColor,
            sidebarColor: colors.sidebarColor,
            accentColor: colors.accentColor,
        };
        updateTheme.mutate(data);
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Tema del workspace"
                description="Personaliza los colores y el modo de apariencia del workspace."
            />

            <div className="space-y-4 max-w-lg">
                <div>
                    <p className="text-sm font-medium text-secondary mb-2">Modo</p>
                    <div className="flex gap-2">
                        {THEME_MODES.map((m) => (
                            <button
                                key={m.value}
                                type="button"
                                onClick={() => setMode(m.value)}
                                className={cn(
                                    'flex-1 py-2 rounded-md text-sm font-medium border transition-colors',
                                    mode === m.value
                                        ? 'bg-accent-primary text-on-color border-accent-primary'
                                        : 'bg-layer-1 text-secondary border-subtle hover:bg-layer-2',
                                )}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-sm font-medium text-secondary mb-3">Colores</p>
                    <div className="space-y-3">
                        {COLOR_FIELDS.map(({ key, label }) => (
                            <div key={key} className="flex items-center gap-3">
                                <label htmlFor={`color-${key}`} className="text-sm text-secondary w-36 shrink-0">
                                    {label}
                                </label>
                                <div className="flex items-center gap-2 flex-1">
                                    <input
                                        id={`color-${key}`}
                                        type="color"
                                        value={colors[key] ?? '#000000'}
                                        onChange={(e) => setColors((prev) => ({ ...prev, [key]: e.target.value }))}
                                        className="w-8 h-8 rounded cursor-pointer border border-subtle bg-transparent"
                                    />
                                    <Input
                                        value={colors[key] ?? ''}
                                        onChange={(e) => setColors((prev) => ({ ...prev, [key]: e.target.value }))}
                                        className="bg-layer-1 border-subtle text-primary font-mono text-xs h-8"
                                        maxLength={7}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Button
                    onClick={handleSave}
                    className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                    disabled={updateTheme.isPending}
                >
                    {updateTheme.isPending ? 'Guardando...' : 'Guardar tema'}
                </Button>
            </div>
        </div>
    );
}

function DisabledTab({ title, description }: { title: string; description: string }): React.ReactElement {
    return (
        <div className="space-y-6">
            <SectionHeader title={title} description={description} />
            <div className="flex flex-col items-center justify-center py-16 text-center border border-subtle rounded-lg bg-layer-1/30">
                <p className="text-sm text-placeholder">
                    Esta función no está disponible en la edición Community.
                </p>
            </div>
        </div>
    );
}

export const WorkspaceSettingsPage = (): React.ReactElement => {
    const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
    const slug = workspaceSlug ?? '';
    const [activeTab, setActiveTab] = useState('general');

    const renderContent = (): React.ReactElement => {
        switch (activeTab) {
            case 'general':
                return <GeneralTab workspaceSlug={slug} />;
            case 'members':
                return <MembersTab workspaceSlug={slug} />;
            case 'theme':
                return <ThemeTab workspaceSlug={slug} />;
            case 'billing':
                return (
                    <DisabledTab
                        title="Facturación y planes"
                        description="Gestiona tu plan y métodos de pago."
                    />
                );
            case 'exports':
                return (
                    <DisabledTab
                        title="Exportaciones"
                        description="Exporta los datos de tu workspace."
                    />
                );
            case 'webhooks':
                return <WebhooksTab />;
            case 'tokens':
                return <TokensTab />;
            default:
                return <GeneralTab workspaceSlug={slug} />;
        }
    };

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-lg font-semibold text-primary">Configuración del workspace</h1>
                </div>

                <div className="flex gap-0">
                    <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

                    <div className="flex-1 pl-8">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};
