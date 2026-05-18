import type React from 'react';
import { useState, useEffect } from 'react';
import { Sparkles, Loader2, CheckSquare, Square } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGenerateSubIssues } from '../../application/use-ai';

interface AiSubIssueGeneratorProps {
    issueId: string;
    issueTitle: string;
    issueDescription: string;
    workspaceSlug: string;
}

export function AiSubIssueGenerator({
    issueTitle,
    issueDescription,
    workspaceSlug,
}: AiSubIssueGeneratorProps): React.ReactElement {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const { mutateAsync, isPending, data: suggestions, reset } = useGenerateSubIssues(workspaceSlug);

    useEffect(() => {
        if (open) {
            setSelected(new Set());
            reset();
            void mutateAsync({ title: issueTitle, description: issueDescription }).then((items) => {
                setSelected(new Set(items.map((_, i) => i)));
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, issueTitle, issueDescription, mutateAsync, reset]);

    const toggleItem = (idx: number): void => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(idx)) next.delete(idx);
            else next.add(idx);
            return next;
        });
    };

    const handleCreate = (): void => {
        const count = selected.size;
        if (count === 0) {
            toast.warning('Selecciona al menos una sub-tarea');
            return;
        }
        toast.success(`${count} sub-${count === 1 ? 'tarea creada' : 'tareas creadas'}`);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs border-subtle text-secondary hover:text-primary"
                >
                    <Sparkles size={13} />
                    Generar sub-tareas con IA
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md bg-surface-1 border-subtle">
                <DialogHeader>
                    <DialogTitle className="text-primary flex items-center gap-2">
                        <Sparkles size={16} className="text-accent-primary" />
                        Sub-tareas sugeridas por IA
                    </DialogTitle>
                </DialogHeader>

                <div className="py-2">
                    {isPending && (
                        <div className="flex items-center justify-center gap-2 py-8 text-secondary">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="text-sm">Generando sugerencias...</span>
                        </div>
                    )}

                    {!isPending && suggestions && suggestions.length === 0 && (
                        <p className="text-sm text-placeholder italic py-4 text-center">
                            No se pudieron generar sugerencias.
                        </p>
                    )}

                    {!isPending && suggestions && suggestions.length > 0 && (
                        <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                            {suggestions.map((item, idx) => {
                                const isSelected = selected.has(idx);
                                return (
                                    <li key={idx}>
                                        <button
                                            type="button"
                                            onClick={() => toggleItem(idx)}
                                            className="w-full flex items-start gap-2.5 px-3 py-2.5 rounded-md text-sm text-left border transition-colors hover:bg-surface-2"
                                            style={{
                                                borderColor: isSelected
                                                    ? 'hsl(var(--accent-primary) / 0.4)'
                                                    : 'hsl(var(--border-subtle))',
                                                backgroundColor: isSelected
                                                    ? 'hsl(var(--accent-subtle) / 0.3)'
                                                    : undefined,
                                            }}
                                        >
                                            {isSelected ? (
                                                <CheckSquare size={15} className="shrink-0 mt-px text-accent-primary" />
                                            ) : (
                                                <Square size={15} className="shrink-0 mt-px text-placeholder" />
                                            )}
                                            <span className="text-secondary leading-snug">{item}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setOpen(false)}
                        className="border-subtle text-secondary"
                    >
                        Cancelar
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleCreate}
                        disabled={isPending || selected.size === 0}
                        className="bg-accent-primary hover:bg-accent-primary-hover text-on-color gap-1.5"
                    >
                        <Sparkles size={13} />
                        Crear seleccionadas ({selected.size})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
