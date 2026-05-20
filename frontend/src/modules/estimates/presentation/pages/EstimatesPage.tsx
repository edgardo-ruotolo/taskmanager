import type React from 'react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, BarChart2, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {
    useEstimates,
    useCreateEstimate,
    useDeleteEstimate,
    useAddEstimatePoint,
    useDeleteEstimatePoint,
} from '../../application/use-estimates';
import type { Estimate, EstimatePoint, EstimateType } from '../../domain/types';

const TYPE_LABELS: Record<EstimateType, string> = {
    Points: 'Puntos',
    Categories: 'Categorías',
    Time: 'Tiempo',
};

const TYPE_CLASSES: Record<EstimateType, string> = {
    Points: 'bg-blue-900 text-blue-300',
    Categories: 'bg-purple-900 text-purple-300',
    Time: 'bg-amber-900 text-amber-300',
};

interface EstimatePointsPanelProps {
    workspaceSlug: string;
    companyId: string;
    estimate: Estimate;
    onClose: () => void;
}

const EstimatePointsPanel = ({
    workspaceSlug,
    companyId,
    estimate,
    onClose,
}: EstimatePointsPanelProps): React.ReactElement => {
    const [keyInput, setKeyInput] = useState('');
    const [valueInput, setValueInput] = useState('');
    const { mutate: addPoint, isPending: isAdding } = useAddEstimatePoint(workspaceSlug, companyId, estimate.id);
    const { mutate: deletePoint, isPending: isDeleting } = useDeleteEstimatePoint(workspaceSlug, companyId, estimate.id);

    const points = estimate.points ?? [];

    const handleAdd = (): void => {
        const key = keyInput.trim();
        const value = valueInput.trim();
        if (!key || !value) return;
        addPoint(
            { key, value, sortOrder: points.length },
            {
                onSuccess: () => {
                    setKeyInput('');
                    setValueInput('');
                },
            },
        );
    };

    return (
        <div className="flex flex-col h-full">
            <SheetHeader className="mb-4">
                <SheetTitle className="text-primary">{estimate.name} — Puntos</SheetTitle>
                <Badge className={`text-xs border-0 w-fit ${TYPE_CLASSES[estimate.type]}`}>
                    {TYPE_LABELS[estimate.type]}
                </Badge>
            </SheetHeader>

            <div className="flex gap-2 mb-4">
                <Input
                    value={keyInput}
                    onChange={(e) => setKeyInput(e.target.value)}
                    placeholder="Clave"
                    className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder text-sm"
                />
                <Input
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="Valor"
                    className="bg-layer-1 border-subtle text-primary placeholder:text-placeholder text-sm"
                />
                <Button
                    size="sm"
                    onClick={handleAdd}
                    disabled={isAdding || !keyInput.trim() || !valueInput.trim()}
                    className="bg-accent-primary hover:bg-accent-primary-hover text-on-color shrink-0"
                >
                    <Plus size={14} />
                </Button>
            </div>

            {points.length === 0 && (
                <p className="text-sm text-placeholder italic py-4 text-center">
                    No hay puntos en esta estimación
                </p>
            )}

            {points.length > 0 && (
                <div className="space-y-2 flex-1 overflow-y-auto">
                    {[...points]
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((point: EstimatePoint) => (
                            <div
                                key={point.id}
                                className="flex items-center gap-3 p-3 bg-surface-1/50 border border-subtle rounded-lg"
                            >
                                <div className="flex-1 min-w-0 flex items-center gap-3">
                                    <span className="text-xs font-mono text-tertiary bg-layer-1 px-2 py-0.5 rounded">
                                        {point.key}
                                    </span>
                                    <span className="text-sm text-primary">{point.value}</span>
                                </div>
                                <button
                                    type="button"
                                    disabled={isDeleting}
                                    onClick={() => deletePoint(point.id)}
                                    className="text-placeholder hover:text-red-400 transition-colors shrink-0"
                                    aria-label="Eliminar punto"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-subtle">
                <Button
                    variant="outline"
                    className="w-full border-subtle text-secondary hover:bg-layer-1-hover"
                    onClick={onClose}
                >
                    Cerrar
                </Button>
            </div>
        </div>
    );
};

interface CreateEstimateDialogProps {
    workspaceSlug: string;
    companyId: string;
}

const CreateEstimateDialog = ({ workspaceSlug, companyId }: CreateEstimateDialogProps): React.ReactElement => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<EstimateType>('Points');
    const { mutate: createEstimate, isPending } = useCreateEstimate(workspaceSlug, companyId);

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        if (!name.trim()) return;
        createEstimate(
            { name: name.trim(), description: description.trim() || undefined, type },
            {
                onSuccess: () => {
                    setOpen(false);
                    setName('');
                    setDescription('');
                    setType('Points');
                },
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-2">
                    <Plus size={16} />
                    Nueva Estimación
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-surface-1 border-subtle text-primary">
                <DialogHeader>
                    <DialogTitle>Nueva Estimación</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-1">
                        <label htmlFor="est-name" className="text-xs text-tertiary">Nombre *</label>
                        <Input
                            id="est-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nombre de la estimación"
                            className="bg-layer-1 border-subtle text-primary"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="est-desc" className="text-xs text-tertiary">Descripción</label>
                        <Input
                            id="est-desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descripción opcional"
                            className="bg-layer-1 border-subtle text-primary"
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="est-type" className="text-xs text-tertiary">Tipo</label>
                        <select
                            id="est-type"
                            value={type}
                            onChange={(e) => setType(e.target.value as EstimateType)}
                            className="w-full rounded-md border border-subtle bg-layer-1 px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                            <option value="Points">Puntos</option>
                            <option value="Categories">Categorías</option>
                            <option value="Time">Tiempo</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="border-subtle text-secondary hover:bg-layer-1-hover"
                            onClick={() => setOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending || !name.trim()}
                            className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                        >
                            {isPending ? 'Creando...' : 'Crear'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export const EstimatesPage = (): React.ReactElement => {
    const { workspaceSlug = '', companyId = '' } = useParams<{
        workspaceSlug: string;
        companyId: string;
    }>();

    const { data: estimates, isLoading } = useEstimates(workspaceSlug, companyId);
    const { mutate: deleteEstimate, isPending: isDeleting } = useDeleteEstimate(workspaceSlug, companyId);
    const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);

    const items = estimates ?? [];

    return (
        <div className="p-8">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-xs text-placeholder uppercase tracking-wider mb-1">
                            {workspaceSlug}
                        </p>
                        <h1 className="text-2xl font-bold text-primary">Estimaciones</h1>
                    </div>
                    <CreateEstimateDialog workspaceSlug={workspaceSlug} companyId={companyId} />
                </div>

                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(['sk-0', 'sk-1', 'sk-2'] as const).map((k) => (
                            <div
                                key={k}
                                className="bg-surface-1/50 border border-subtle rounded-lg p-5 space-y-3"
                            >
                                <Skeleton className="h-5 w-2/3 bg-layer-1" />
                                <Skeleton className="h-4 w-full bg-layer-1" />
                                <Skeleton className="h-6 w-24 bg-layer-1 rounded-full" />
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <BarChart2 size={48} className="text-placeholder mb-4" />
                        <h2 className="text-lg font-medium text-secondary mb-2">No hay estimaciones aún</h2>
                        <p className="text-sm text-placeholder mb-6">
                            Crea la primera estimación para esta empresa
                        </p>
                        <CreateEstimateDialog workspaceSlug={workspaceSlug} companyId={companyId} />
                    </div>
                )}

                {!isLoading && items.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((estimate) => (
                            <div
                                key={estimate.id}
                                className="relative bg-surface-1/50 border border-subtle rounded-lg p-5 hover:border-strong transition-colors flex flex-col gap-3"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedEstimate(estimate)}
                                        className="font-semibold text-primary text-sm truncate flex-1 text-left after:absolute after:inset-0 after:rounded-lg focus-visible:ring-0 after:focus-visible:ring-2 after:focus-visible:ring-blue-600"
                                        aria-label={`Abrir estimación ${estimate.name}`}
                                    >
                                        {estimate.name}
                                    </button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                type="button"
                                                disabled={isDeleting}
                                                className="relative z-10 text-placeholder hover:text-red-400 transition-colors shrink-0"
                                                aria-label="Eliminar estimación"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-surface-1 border-subtle text-primary">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Eliminar estimación</AlertDialogTitle>
                                                <AlertDialogDescription className="text-secondary">
                                                    ¿Estás seguro de que querés eliminar &ldquo;{estimate.name}&rdquo;? Esta acción no se puede deshacer y perderás todos los puntos configurados.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="border-subtle text-secondary hover:bg-layer-1-hover">
                                                    Cancelar
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => deleteEstimate(estimate.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                    Eliminar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>

                                {estimate.description && (
                                    <p className="text-xs text-tertiary line-clamp-2">
                                        {estimate.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={`text-xs border-0 ${TYPE_CLASSES[estimate.type]}`}>
                                        {TYPE_LABELS[estimate.type]}
                                    </Badge>
                                    <span className="text-xs text-placeholder">
                                        {estimate.points?.length ?? 0} punto{(estimate.points?.length ?? 0) !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Sheet open={!!selectedEstimate} onOpenChange={(open) => !open && setSelectedEstimate(null)}>
                <SheetContent
                    side="right"
                    className="w-96 bg-canvas border-subtle text-primary"
                >
                    {selectedEstimate && (
                        <EstimatePointsPanel
                            workspaceSlug={workspaceSlug}
                            companyId={companyId}
                            estimate={selectedEstimate}
                            onClose={() => setSelectedEstimate(null)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};
