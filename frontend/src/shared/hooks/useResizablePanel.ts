import { useState, useRef, useCallback } from 'react';
import type React from 'react';

interface ResizablePanelOptions {
    defaultWidth: number;
    min: number;
    max: number;
    onWidthChange?: (width: number) => void;
}

interface ResizablePanelResult {
    width: number;
    isResizing: boolean;
    dragHandleProps: {
        onMouseDown: (e: React.MouseEvent) => void;
    };
}

export function useResizablePanel({
    defaultWidth,
    min,
    max,
    onWidthChange,
}: ResizablePanelOptions): ResizablePanelResult {
    const [width, setWidth] = useState(defaultWidth);
    const [isResizing, setIsResizing] = useState(false);
    const startX = useRef(0);
    const startWidth = useRef(defaultWidth);

    const onMouseDown = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            startX.current = e.clientX;
            startWidth.current = width;
            setIsResizing(true);

            const onMouseMove = (ev: MouseEvent): void => {
                const delta = ev.clientX - startX.current;
                const next = Math.min(max, Math.max(min, startWidth.current + delta));
                setWidth(next);
                onWidthChange?.(next);
            };

            const onMouseUp = (): void => {
                setIsResizing(false);
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            };

            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        },
        [width, min, max, onWidthChange],
    );

    return { width, isResizing, dragHandleProps: { onMouseDown } };
}
