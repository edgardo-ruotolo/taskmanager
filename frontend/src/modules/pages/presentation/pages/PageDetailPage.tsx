import type React from 'react';
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { usePagesStore } from '../../application/pages-store';
import { RichTextEditor } from '@/shared/components/RichTextEditor';

export function PageDetailPage(): React.ReactElement {
    const { workspaceSlug = '', pageId = '' } = useParams<{
        workspaceSlug: string;
        pageId: string;
    }>();
    const navigate = useNavigate();
    const { pages, updatePage, deletePage } = usePagesStore();
    const page = pages.find((p) => p.id === pageId);

    const [title, setTitle] = useState(page?.title ?? '');
    const [saved, setSaved] = useState(false);

    const handleContentChange = useCallback(
        (html: string): void => {
            updatePage(pageId, { contentHtml: html });
        },
        [pageId, updatePage],
    );

    const handleTitleBlur = (): void => {
        updatePage(pageId, { title });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleDelete = (): void => {
        deletePage(pageId);
        void navigate(`/${workspaceSlug}/pages`);
    };

    if (!page) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-secondary">Página no encontrada.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-6 h-12 border-b border-subtle shrink-0 bg-surface-1">
                <button
                    type="button"
                    onClick={() => void navigate(`/${workspaceSlug}/pages`)}
                    className="flex items-center gap-1.5 text-[13px] text-secondary hover:text-primary transition-colors"
                >
                    <ArrowLeft size={14} />
                    <span>Páginas</span>
                </button>
                <div className="flex-1" />
                {saved && <span className="text-[11px] text-placeholder">Guardado</span>}
                <button
                    type="button"
                    onClick={handleDelete}
                    className="p-1.5 rounded-sm text-placeholder hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    aria-label="Eliminar página"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto vertical-scrollbar scrollbar-xs">
                <div className="max-w-3xl mx-auto px-6 py-8">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        placeholder="Sin título"
                        className="w-full text-[28px] font-bold text-primary bg-transparent outline-none placeholder:text-placeholder mb-6"
                    />
                    <RichTextEditor
                        content={page.contentHtml || page.content}
                        onChange={handleContentChange}
                        placeholder="Empieza a escribir..."
                    />
                </div>
            </div>
        </div>
    );
}
