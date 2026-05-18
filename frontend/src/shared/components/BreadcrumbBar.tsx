import { Fragment } from 'react';
import type React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useBreadcrumbs } from '@/shared/hooks/useBreadcrumbs';

export const BreadcrumbBar = (): React.ReactElement | null => {
    const crumbs = useBreadcrumbs();

    if (crumbs.length === 0) return null;

    return (
        <div className="h-9 shrink-0 flex items-center px-6 border-b border-subtle bg-surface-1 gap-1.5">
            {crumbs.map((crumb, index) => (
                <Fragment key={`${crumb.label}-${crumb.href ?? 'active'}`}>
                    {index > 0 && (
                        <ChevronRight size={12} className="text-tertiary shrink-0" aria-hidden="true" />
                    )}
                    {crumb.href ? (
                        <Link
                            to={crumb.href}
                            className="text-xs text-secondary hover:text-primary transition-colors duration-150"
                        >
                            {crumb.label}
                        </Link>
                    ) : (
                        <span className="text-xs text-primary font-medium">{crumb.label}</span>
                    )}
                </Fragment>
            ))}
        </div>
    );
};
