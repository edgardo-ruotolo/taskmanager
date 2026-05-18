import { useState } from 'react';
import type React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, GitBranch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
    useGitHubStatus,
    useGitHubRepos,
    useConnectGitHub,
    useDisconnectGitHub,
    useAddGitHubRepo,
    useRemoveGitHubRepo,
} from '../../application/use-integrations';

interface GitHubIntegrationPanelProps {
    workspaceSlug: string;
}

const addRepoSchema = z.object({
    repoOwner: z.string().min(1, 'Requerido'),
    repoName: z.string().min(1, 'Requerido'),
    syncIssues: z.boolean(),
    syncPRs: z.boolean(),
});

type AddRepoForm = z.infer<typeof addRepoSchema>;

const inputClass =
    'bg-layer-1 border-subtle text-primary placeholder:text-placeholder focus:border-strong transition-colors';

// GitHub SVG icon — not available in lucide-react
function GitHubIcon({ size = 18 }: { size?: number }): React.ReactElement {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
    );
}

function StatusBadge({ isConnected, accountName }: { isConnected: boolean; accountName?: string }): React.ReactElement {
    if (isConnected) {
        return (
            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-medium">
                Conectado{accountName ? ` como @${accountName}` : ''}
            </Badge>
        );
    }
    return (
        <Badge className="bg-surface-1/50 text-secondary border border-subtle font-medium">
            No conectado
        </Badge>
    );
}

export const GitHubIntegrationPanel = ({ workspaceSlug }: GitHubIntegrationPanelProps): React.ReactElement => {
    const [addRepoOpen, setAddRepoOpen] = useState(false);

    const { data: status, isLoading: loadingStatus } = useGitHubStatus(workspaceSlug);
    const { data: repos = [], isLoading: loadingRepos } = useGitHubRepos(workspaceSlug);

    const connectMutation = useConnectGitHub(workspaceSlug);
    const disconnectMutation = useDisconnectGitHub(workspaceSlug);
    const addRepoMutation = useAddGitHubRepo(workspaceSlug);
    const removeRepoMutation = useRemoveGitHubRepo(workspaceSlug);

    const form = useForm<AddRepoForm>({
        resolver: zodResolver(addRepoSchema),
        defaultValues: { repoOwner: '', repoName: '', syncIssues: true, syncPRs: false },
    });

    const isConnected = status?.isConnected ?? false;

    const handleConnect = (): void => {
        connectMutation.mutate('');
    };

    const handleAddRepo = (data: AddRepoForm): void => {
        addRepoMutation.mutate(data, {
            onSuccess: () => {
                form.reset();
                setAddRepoOpen(false);
            },
        });
    };

    return (
        <div className="space-y-5">
            {/* Header row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-layer-2 border border-subtle">
                        <GitHubIcon size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-primary">GitHub</p>
                        <p className="text-xs text-placeholder">
                            Sincroniza issues y pull requests con tus repositorios
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {loadingStatus ? (
                        <Skeleton className="h-6 w-24" />
                    ) : (
                        <StatusBadge isConnected={isConnected} accountName={status?.accountName} />
                    )}
                    {isConnected ? (
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-red-900/50 text-red-400 hover:bg-red-950/20 hover:border-red-800"
                            onClick={() => disconnectMutation.mutate()}
                            disabled={disconnectMutation.isPending}
                        >
                            {disconnectMutation.isPending ? 'Desconectando...' : 'Desconectar'}
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 gap-1.5"
                            onClick={handleConnect}
                            disabled={connectMutation.isPending}
                        >
                            <GitHubIcon size={14} />
                            {connectMutation.isPending ? 'Conectando...' : 'Conectar con GitHub'}
                        </Button>
                    )}
                </div>
            </div>

            <Separator className="bg-subtle" />

            {/* Repos section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-secondary">
                        Repositorios conectados
                        {repos.length > 0 && (
                            <span className="ml-2 text-xs font-normal text-placeholder">({repos.length})</span>
                        )}
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-subtle text-secondary hover:text-primary gap-1.5"
                        onClick={() => setAddRepoOpen(true)}
                        disabled={!isConnected}
                    >
                        <Plus size={13} aria-hidden="true" />
                        Añadir repositorio
                    </Button>
                </div>

                {loadingRepos ? (
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : repos.length === 0 ? (
                    <div className={cn(
                        'flex flex-col items-center justify-center py-8 rounded-lg border border-dashed border-subtle',
                        'text-center text-placeholder',
                    )}>
                        <GitBranch size={20} className="mb-2 opacity-50" aria-hidden="true" />
                        <p className="text-xs">
                            {isConnected
                                ? 'No hay repositorios conectados. Añade uno para empezar.'
                                : 'Conecta GitHub primero para añadir repositorios.'}
                        </p>
                    </div>
                ) : (
                    <ul className="border border-subtle rounded-lg divide-y divide-subtle overflow-hidden">
                        {repos.map((repo) => (
                            <li key={repo.id} className="flex items-center justify-between px-4 py-3 hover:bg-layer-transparent-hover transition-colors">
                                <div className="flex items-center gap-2">
                                    <GitBranch size={14} className="text-placeholder shrink-0" aria-hidden="true" />
                                    <div>
                                        <p className="text-sm text-primary font-medium">{repo.fullName}</p>
                                        <div className="flex gap-2 mt-0.5">
                                            {repo.syncIssues && (
                                                <span className="text-[10px] text-placeholder bg-surface-1 px-1.5 py-0.5 rounded">Issues</span>
                                            )}
                                            {repo.syncPRs && (
                                                <span className="text-[10px] text-placeholder bg-surface-1 px-1.5 py-0.5 rounded">PRs</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeRepoMutation.mutate(repo.id)}
                                    disabled={removeRepoMutation.isPending}
                                    className="p-1 text-placeholder hover:text-red-400 transition-colors rounded"
                                    aria-label={`Eliminar repositorio ${repo.fullName}`}
                                >
                                    <Trash2 size={14} aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Add repo dialog */}
            <Dialog open={addRepoOpen} onOpenChange={setAddRepoOpen}>
                <DialogContent className="bg-surface-2 border-subtle">
                    <DialogHeader>
                        <DialogTitle className="text-primary">Añadir repositorio</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddRepo)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="repoOwner"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary text-sm">
                                            Propietario del repositorio
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="ej: mi-organizacion"
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
                                name="repoName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-secondary text-sm">
                                            Nombre del repositorio
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="ej: mi-proyecto"
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
                                name="syncIssues"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2.5">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                id="syncIssues"
                                            />
                                        </FormControl>
                                        <FormLabel htmlFor="syncIssues" className="text-secondary text-sm cursor-pointer">
                                            Sincronizar issues
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="syncPRs"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2.5">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                id="syncPRs"
                                            />
                                        </FormControl>
                                        <FormLabel htmlFor="syncPRs" className="text-secondary text-sm cursor-pointer">
                                            Sincronizar pull requests
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="border-subtle text-secondary"
                                    onClick={() => setAddRepoOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                                    disabled={addRepoMutation.isPending}
                                >
                                    {addRepoMutation.isPending ? 'Añadiendo...' : 'Añadir repositorio'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
