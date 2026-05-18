import type React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useImproveText } from '../../application/use-ai';

interface AiTextHelperProps {
    workspaceSlug: string;
    text: string;
    onImproved: (improved: string) => void;
}

export function AiTextHelper({ workspaceSlug, text, onImproved }: AiTextHelperProps): React.ReactElement {
    const { mutateAsync, isPending } = useImproveText(workspaceSlug);

    const handleClick = async (): Promise<void> => {
        if (!text.trim()) {
            toast.warning('No hay texto para mejorar');
            return;
        }
        try {
            const improved = await mutateAsync(text);
            onImproved(improved);
            toast.success('Texto mejorado con IA');
        } catch {
            toast.error('Error al mejorar el texto');
        }
    };

    return (
        <button
            type="button"
            onClick={() => void handleClick()}
            disabled={isPending}
            title="Mejorar texto con IA"
            aria-label="Mejorar texto con IA"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-placeholder border border-subtle hover:text-secondary hover:bg-surface-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isPending ? (
                <Loader2 size={13} className="animate-spin" />
            ) : (
                <Sparkles size={13} />
            )}
            {isPending ? 'Mejorando...' : 'Mejorar con IA'}
        </button>
    );
}
