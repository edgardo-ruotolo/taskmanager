import type { Announcements, ScreenReaderInstructions, UniqueIdentifier } from '@dnd-kit/core';

export const dndScreenReaderInstructions: ScreenReaderInstructions = {
    draggable: `
        Para tomar un elemento, presiona Espacio o Enter.
        Mientras lo sostienes, usa las flechas para moverlo.
        Presiona Espacio o Enter nuevamente para soltarlo en la posición actual,
        o Escape para cancelar.
    `,
};

export interface DndLabelResolver {
    /** Texto descriptivo del elemento que se está arrastrando (ej: título de la tarea). */
    item: (id: UniqueIdentifier) => string;
    /** Texto descriptivo del contenedor sobre el que se está colocando (ej: nombre de la columna). */
    container?: (id: UniqueIdentifier | null) => string;
}

export const createDndAnnouncements = (resolver: DndLabelResolver): Announcements => ({
    onDragStart({ active }) {
        return `Has tomado el elemento ${resolver.item(active.id)}.`;
    },
    onDragOver({ active, over }) {
        if (!over) return `El elemento ${resolver.item(active.id)} ya no se encuentra sobre una zona soltable.`;
        const target = resolver.container?.(over.id) ?? resolver.item(over.id);
        return `El elemento ${resolver.item(active.id)} se desplazó a ${target}.`;
    },
    onDragEnd({ active, over }) {
        if (!over) return `El elemento ${resolver.item(active.id)} se devolvió a su posición original.`;
        const target = resolver.container?.(over.id) ?? resolver.item(over.id);
        return `El elemento ${resolver.item(active.id)} se soltó sobre ${target}.`;
    },
    onDragCancel({ active }) {
        return `Se canceló el movimiento del elemento ${resolver.item(active.id)}. Volvió a su posición original.`;
    },
});
