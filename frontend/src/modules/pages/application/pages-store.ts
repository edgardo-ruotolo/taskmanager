import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Page, CreatePageData } from '../domain/types';

interface PagesState {
    pages: Page[];
    addPage: (data: CreatePageData & { workspaceSlug: string }) => void;
    updatePage: (id: string, data: Partial<Pick<Page, 'title' | 'content' | 'contentHtml'>>) => void;
    deletePage: (id: string) => void;
}

export const usePagesStore = create<PagesState>()(
    persist(
        (set) => ({
            pages: [],
            addPage: (data) =>
                set((s) => ({
                    pages: [
                        ...s.pages,
                        {
                            id: data.id ?? crypto.randomUUID(),
                            title: data.title,
                            content: data.content ?? '',
                            contentHtml: '',
                            workspaceSlug: data.workspaceSlug,
                            companyId: data.companyId,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                    ],
                })),
            updatePage: (id, data) =>
                set((s) => ({
                    pages: s.pages.map((p) =>
                        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p,
                    ),
                })),
            deletePage: (id) => set((s) => ({ pages: s.pages.filter((p) => p.id !== id) })),
        }),
        { name: 'tm-pages' },
    ),
);
