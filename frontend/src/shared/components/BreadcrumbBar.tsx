import { Fragment } from 'react';
import type React from 'react';
import { Link } from 'react-router-dom';
import { useBreadcrumbs } from '@/shared/hooks/useBreadcrumbs';

export const BreadcrumbBar = (): React.ReactElement | null => {
    const crumbs = useBreadcrumbs();

    if (crumbs.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            {crumbs.map((crumb, index) => (
                <Fragment key={`${crumb.label}-${crumb.href ?? 'active'}`}>
                    {index > 0 && (
                        <span className="text-[var(--neutral-600)] text-[10px] shrink-0 opacity-40">/</span>
                    )}
                    {crumb.href ? (
                        <Link
                            to={crumb.href}
                            className="text-[13px] text-[var(--neutral-1100)] hover:text-[var(--neutral-1200)] transition-colors duration-150 tracking-[-0.01em]"
                        >
                            {crumb.label}
                        </Link>
                    ) : (
                        <span className="text-[14px] text-[var(--neutral-1200)] font-medium tracking-[-0.01em]">{crumb.label}</span>
                    )}
                </Fragment>
            ))}
        </div>
    );
};
