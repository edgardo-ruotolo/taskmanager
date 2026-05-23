import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HelpSectionTitleProps {
    children: ReactNode;
    className?: string;
}

export function HelpH2({ children, className }: HelpSectionTitleProps): React.ReactElement {
    return (
        <h2
            className={cn(
                'mt-8 mb-3 text-[20px] font-semibold tracking-[-0.02em] text-[var(--neutral-1200)]',
                className,
            )}
        >
            {children}
        </h2>
    );
}

export function HelpH3({ children, className }: HelpSectionTitleProps): React.ReactElement {
    return (
        <h3
            className={cn(
                'mt-6 mb-2 text-[15px] font-semibold tracking-[-0.01em] text-[var(--neutral-1200)]',
                className,
            )}
        >
            {children}
        </h3>
    );
}

interface HelpParagraphProps {
    children: ReactNode;
}

export function HelpP({ children }: HelpParagraphProps): React.ReactElement {
    return (
        <p className="my-3 text-[14px] leading-[1.65] text-[var(--neutral-1000)]">
            {children}
        </p>
    );
}

interface HelpListProps {
    children: ReactNode;
    ordered?: boolean;
}

export function HelpList({ children, ordered = false }: HelpListProps): React.ReactElement {
    const Tag = ordered ? 'ol' : 'ul';
    return (
        <Tag
            className={cn(
                'my-3 space-y-1.5 pl-5 text-[14px] leading-[1.65] text-[var(--neutral-1000)]',
                ordered ? 'list-decimal' : 'list-disc',
            )}
        >
            {children}
        </Tag>
    );
}

interface HelpFieldRowProps {
    name: string;
    type?: string;
    children: ReactNode;
}

/** Documenta un campo de formulario: nombre + tipo + descripción. */
export function HelpFieldRow({ name, type, children }: HelpFieldRowProps): React.ReactElement {
    return (
        <div className="flex flex-col gap-1 py-3 border-b border-[var(--neutral-300)] last:border-b-0">
            <div className="flex items-baseline gap-2">
                <code className="font-mono text-[12px] font-semibold text-[var(--neutral-1200)] bg-[var(--neutral-200)] px-1.5 py-0.5 rounded">
                    {name}
                </code>
                {type && (
                    <span className="font-mono text-[10.5px] text-[var(--neutral-600)] uppercase tracking-[0.08em]">
                        {type}
                    </span>
                )}
            </div>
            <div className="text-[13px] leading-[1.6] text-[var(--neutral-1000)]">{children}</div>
        </div>
    );
}

interface HelpCalloutProps {
    tone?: 'info' | 'warn' | 'success';
    children: ReactNode;
}

export function HelpCallout({ tone = 'info', children }: HelpCalloutProps): React.ReactElement {
    const palette: Record<string, { bg: string; border: string; text: string; label: string }> = {
        info: {
            bg: 'bg-[color-mix(in_oklch,var(--brand-700)_8%,white)]',
            border: 'border-[color-mix(in_oklch,var(--brand-700)_30%,white)]',
            text: 'text-[var(--brand-700)]',
            label: 'Nota',
        },
        warn: {
            bg: 'bg-[color-mix(in_oklch,var(--amber-700)_8%,white)]',
            border: 'border-[color-mix(in_oklch,var(--amber-700)_30%,white)]',
            text: 'text-[var(--amber-700)]',
            label: 'Atención',
        },
        success: {
            bg: 'bg-[color-mix(in_oklch,var(--green-700)_8%,white)]',
            border: 'border-[color-mix(in_oklch,var(--green-700)_30%,white)]',
            text: 'text-[var(--green-700)]',
            label: 'Tip',
        },
    };
    const p = palette[tone];
    return (
        <div className={cn('my-4 rounded-md border px-4 py-3', p.bg, p.border)}>
            <div className={cn('font-mono text-[10px] uppercase tracking-[0.12em] mb-1', p.text)}>
                {p.label}
            </div>
            <div className="text-[13px] leading-[1.6] text-[var(--neutral-1200)]">{children}</div>
        </div>
    );
}

interface HelpScreenshotProps {
    src: string;
    alt: string;
    caption?: string;
}

/**
 * Renderiza una captura desde /public/help-screenshots/. Si la imagen no existe
 * todavía, muestra un placeholder con el alt text para no romper el layout.
 */
export function HelpScreenshot({ src, alt, caption }: HelpScreenshotProps): React.ReactElement {
    return (
        <figure className="my-5">
            <div className="rounded-md border border-[var(--neutral-400)] overflow-hidden bg-[var(--neutral-100)]">
                <img
                    src={src}
                    alt={alt}
                    className="w-full block"
                    onError={(e) => {
                        // Fallback: muestra placeholder si la captura aún no se generó.
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement | null;
                        if (fallback) fallback.style.display = 'flex';
                    }}
                />
                <div
                    className="hidden items-center justify-center h-48 text-[12px] font-mono text-[var(--neutral-600)] bg-[var(--neutral-200)] p-4 text-center"
                    aria-hidden="true"
                >
                    📷 Captura pendiente: {alt}
                </div>
            </div>
            {caption && (
                <figcaption className="mt-2 text-[12px] text-[var(--neutral-600)] text-center italic">
                    {caption}
                </figcaption>
            )}
        </figure>
    );
}

interface HelpStepsProps {
    steps: ReactNode[];
}

export function HelpSteps({ steps }: HelpStepsProps): React.ReactElement {
    return (
        <ol className="my-4 space-y-3">
            {steps.map((step, idx) => (
                <li
                    // biome-ignore lint/suspicious/noArrayIndexKey: contenido estático ordenado por posición
                    key={idx}
                    className="flex gap-3 text-[14px] leading-[1.6] text-[var(--neutral-1000)]"
                >
                    <span className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--neutral-1200)] text-white font-mono text-[11px] font-medium">
                        {idx + 1}
                    </span>
                    <div className="pt-0.5">{step}</div>
                </li>
            ))}
        </ol>
    );
}
