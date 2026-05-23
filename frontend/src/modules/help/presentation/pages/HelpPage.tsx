import { useMemo } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { ChevronRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Eyebrow } from '@/components/ui/eyebrow';
import { ALL_SECTIONS, HELP_CATEGORIES, findSection } from '../../data/help-content';

export function HelpPage(): React.ReactElement {
    const { workspaceSlug = '', helpSlug } = useParams<{ workspaceSlug: string; helpSlug?: string }>();

    const currentSlug = helpSlug ?? ALL_SECTIONS[0]?.slug ?? 'bienvenida';
    const section = useMemo(() => findSection(currentSlug), [currentSlug]);

    const totalSections = ALL_SECTIONS.length;

    return (
        <div className="h-full grid grid-cols-[280px_1fr] overflow-hidden">
            {/* Sidebar TOC */}
            <aside
                className="border-r overflow-y-auto"
                style={{
                    background: 'var(--neutral-100)',
                    borderColor: 'var(--neutral-400)',
                }}
            >
                <div className="px-5 py-5 border-b border-[var(--neutral-400)]">
                    <div className="flex items-center gap-2 mb-1">
                        <HelpCircle className="h-4 w-4 text-[var(--brand-700)]" />
                        <Eyebrow>Ayuda</Eyebrow>
                    </div>
                    <h2 className="text-[18px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)] leading-tight">
                        Manual de usuario
                    </h2>
                    <p className="mt-1 text-[11px] font-mono text-[var(--neutral-600)] tracking-[0.05em]">
                        {totalSections} secciones documentadas
                    </p>
                </div>

                <nav className="px-3 py-4 space-y-5">
                    {HELP_CATEGORIES.map((category) => (
                        <div key={category.id}>
                            <div className="px-2 mb-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--neutral-600)]">
                                {category.label}
                            </div>
                            <ul className="space-y-0.5">
                                {category.sections.map((sec) => (
                                    <li key={sec.slug}>
                                        <NavLink
                                            to={`/${workspaceSlug}/ayuda/${sec.slug}`}
                                            className={({ isActive }) =>
                                                cn(
                                                    'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors',
                                                    isActive
                                                        ? 'bg-[var(--neutral-1200)] text-white'
                                                        : 'text-[var(--neutral-1000)] hover:bg-[var(--neutral-200)]',
                                                )
                                            }
                                        >
                                            <span className="truncate">{sec.title}</span>
                                            <ChevronRight className="h-3 w-3 opacity-40 shrink-0" aria-hidden="true" />
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Content */}
            <main className="overflow-y-auto">
                <div className="mx-auto max-w-3xl px-10 py-10">
                    {section ? (
                        <article>
                            <Eyebrow>Ayuda</Eyebrow>
                            <h1 className="mt-2 text-[40px] font-medium tracking-[-0.045em] leading-[1.05] text-[var(--neutral-1200)]">
                                {section.title}
                            </h1>
                            {section.summary && (
                                <p className="mt-3 text-[15px] text-[var(--neutral-600)] max-w-[640px] leading-[1.55]">
                                    {section.summary}
                                </p>
                            )}
                            <div className="mt-6">{section.content}</div>

                            {/* Footer: navegación prev/next */}
                            <SectionFooter currentSlug={section.slug} workspaceSlug={workspaceSlug} />
                        </article>
                    ) : (
                        <NotFoundSection workspaceSlug={workspaceSlug} />
                    )}
                </div>
            </main>
        </div>
    );
}

interface SectionFooterProps {
    currentSlug: string;
    workspaceSlug: string;
}

function SectionFooter({ currentSlug, workspaceSlug }: SectionFooterProps): React.ReactElement {
    const index = ALL_SECTIONS.findIndex((s) => s.slug === currentSlug);
    const prev = index > 0 ? ALL_SECTIONS[index - 1] : null;
    const next = index >= 0 && index < ALL_SECTIONS.length - 1 ? ALL_SECTIONS[index + 1] : null;

    if (!prev && !next) return <div />;

    return (
        <div className="mt-12 pt-6 border-t border-[var(--neutral-400)] flex items-center justify-between gap-3">
            {prev ? (
                <Link
                    to={`/${workspaceSlug}/ayuda/${prev.slug}`}
                    className="flex flex-col items-start gap-0.5 rounded-md border border-[var(--neutral-400)] px-4 py-3 text-left transition-colors hover:bg-[var(--neutral-100)] max-w-[45%]"
                >
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--neutral-600)]">
                        ← Anterior
                    </span>
                    <span className="text-[13px] font-medium text-[var(--neutral-1200)] truncate w-full">
                        {prev.title}
                    </span>
                </Link>
            ) : (
                <div />
            )}
            {next ? (
                <Link
                    to={`/${workspaceSlug}/ayuda/${next.slug}`}
                    className="flex flex-col items-end gap-0.5 rounded-md border border-[var(--neutral-400)] px-4 py-3 text-right transition-colors hover:bg-[var(--neutral-100)] max-w-[45%]"
                >
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--neutral-600)]">
                        Siguiente →
                    </span>
                    <span className="text-[13px] font-medium text-[var(--neutral-1200)] truncate w-full">
                        {next.title}
                    </span>
                </Link>
            ) : (
                <div />
            )}
        </div>
    );
}

interface NotFoundSectionProps {
    workspaceSlug: string;
}

function NotFoundSection({ workspaceSlug }: NotFoundSectionProps): React.ReactElement {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-lg bg-[var(--neutral-200)] flex items-center justify-center mb-4">
                <HelpCircle className="h-6 w-6 text-[var(--neutral-600)]" />
            </div>
            <h2 className="text-[18px] font-medium text-[var(--neutral-1200)] mb-2">
                Sección no encontrada
            </h2>
            <p className="text-[13px] text-[var(--neutral-600)] mb-6">
                Elegí una sección del índice lateral o volvé al inicio de la ayuda.
            </p>
            <Link
                to={`/${workspaceSlug}/ayuda`}
                className="inline-flex items-center gap-2 rounded-md bg-[var(--neutral-1200)] px-4 py-2 text-[13px] font-medium text-white hover:bg-[var(--neutral-1000)] transition-colors"
            >
                Volver al inicio
            </Link>
        </div>
    );
}
