import type React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { IssueRelation } from '../../domain/types';

interface IssueAiDependencyBannerProps {
    relations: IssueRelation[];
    workspaceSlug: string;
    projectId: string;
    projectIdentifier?: string;
    className?: string;
}

export const IssueAiDependencyBanner = ({
    relations,
    workspaceSlug,
    projectId,
    projectIdentifier,
    className,
}: IssueAiDependencyBannerProps): React.ReactElement | null => {
    const [dismissed, setDismissed] = useState(false);

    // Filter BlockedBy relations as the dependency signal
    const blockedByRelations = relations.filter(
        (r) => r.relationType === 'BlockedBy',
    );

    if (dismissed || blockedByRelations.length === 0) {
        return null;
    }

    const first = blockedByRelations[0];
    if (!first) return null;

    const identifier = `${projectIdentifier ?? 'ISS'}-${first.relatedIssueSequenceId}`;
    const detailUrl = `/${workspaceSlug}/projects/${projectId}/issues/${first.relatedIssueId}`;

    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/8 px-4 py-3',
                className,
            )}
            role="alert"
            aria-live="polite"
        >
            <Sparkles
                size={15}
                className="text-amber-400 shrink-0 mt-0.5"
                aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-amber-300">
                    IA detectó dependencia con{' '}
                    <Link
                        to={detailUrl}
                        className="underline underline-offset-2 hover:text-amber-200 transition-colors"
                        aria-label={`Ver issue relacionado ${identifier}`}
                    >
                        {identifier}
                    </Link>
                </span>
                {first.relatedIssueTitle && (
                    <p className="text-[11px] text-amber-300/70 mt-0.5 truncate">
                        {first.relatedIssueTitle}
                    </p>
                )}
            </div>
            <button
                type="button"
                onClick={() => setDismissed(true)}
                aria-label="Descartar banner de dependencia"
                className="text-amber-400/60 hover:text-amber-300 transition-colors shrink-0"
            >
                <X size={13} />
            </button>
        </div>
    );
};
