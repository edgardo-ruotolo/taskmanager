import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Sticky, CreateStickyData, UpdateStickyData } from '../domain/types';

interface StickiesState {
    stickies: Sticky[];
    addSticky: (data: CreateStickyData) => void;
    updateSticky: (id: string, data: UpdateStickyData) => void;
    deleteSticky: (id: string) => void;
    reorderStickies: (newOrder: Sticky[]) => void;
}

export const useStickiesStore = create<StickiesState>()(
    persist(
        (set) => ({
            stickies: [],
            addSticky: (data) =>
                set((state) => ({
                    stickies: [
                        ...state.stickies,
                        {
                            id: crypto.randomUUID(),
                            title: data.title,
                            content: data.content ?? '',
                            color: data.color,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        },
                    ],
                })),
            updateSticky: (id, data) =>
                set((state) => ({
                    stickies: state.stickies.map((s) =>
                        s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s,
                    ),
                })),
            deleteSticky: (id) =>
                set((state) => ({ stickies: state.stickies.filter((s) => s.id !== id) })),
            reorderStickies: (newOrder) => set(() => ({ stickies: newOrder })),
        }),
        { name: 'taskmanager-stickies' },
    ),
);
