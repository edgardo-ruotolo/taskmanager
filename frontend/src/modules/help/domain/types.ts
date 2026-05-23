import type { ReactNode } from 'react';

export interface HelpSection {
    /** Slug usado en la URL: /:workspaceSlug/ayuda/:slug */
    slug: string;
    /** Título visible en el TOC y en el header de la sección */
    title: string;
    /** Subtítulo opcional para mostrar bajo el título */
    summary?: string;
    /** Contenido renderizable */
    content: ReactNode;
}

export interface HelpCategory {
    id: string;
    label: string;
    sections: HelpSection[];
}
