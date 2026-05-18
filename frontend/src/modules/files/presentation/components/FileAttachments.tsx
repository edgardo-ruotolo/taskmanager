import type React from 'react';
import { useRef, useState } from 'react';
import { File, FileText, Image, Paperclip, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDeleteFile, useFileAssets, useUploadFile } from '../../application/use-files';

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ contentType }: { contentType: string }): React.ReactElement {
    if (contentType.startsWith('image/'))
        return <Image size={14} className="shrink-0 text-blue-500" />;
    if (contentType.includes('pdf'))
        return <FileText size={14} className="shrink-0 text-red-500" />;
    return <File size={14} className="shrink-0 text-muted-foreground" />;
}

interface FileAttachmentsProps {
    workspaceSlug: string;
    entityType: string;
    entityId: string;
}

export function FileAttachments({
    workspaceSlug,
    entityType,
    entityId,
}: FileAttachmentsProps): React.ReactElement {
    const { data: files = [], isLoading } = useFileAssets(workspaceSlug, entityType, entityId);
    const uploadMutation = useUploadFile(workspaceSlug, entityType, entityId);
    const deleteMutation = useDeleteFile(workspaceSlug, entityType, entityId);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFiles = (fileList: FileList | null): void => {
        if (!fileList) return;
        for (const file of Array.from(fileList)) {
            uploadMutation.mutate(file);
        }
    };

    const handleDrop = (e: React.DragEvent): void => {
        e.preventDefault();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Paperclip size={13} className="text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Adjuntos {files.length > 0 && `(${files.length})`}
                </span>
            </div>

            {/* Drop zone */}
            <button
                type="button"
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                    'w-full rounded-lg border-2 border-dashed p-4 text-center transition-colors cursor-pointer',
                    isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                    uploadMutation.isPending && 'opacity-60 pointer-events-none',
                )}
                onClick={() => inputRef.current?.click()}
            >
                <Upload size={16} className="mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                    {uploadMutation.isPending
                        ? 'Subiendo…'
                        : 'Arrastrá archivos aquí o hacé clic para seleccionar'}
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </button>

            {/* File list */}
            {isLoading && <p className="text-xs text-muted-foreground">Cargando…</p>}
            {files.map((file) => (
                <div
                    key={file.id}
                    className="flex items-center gap-2 rounded-md border px-3 py-2"
                >
                    <FileIcon contentType={file.contentType} />
                    <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 flex-1 truncate text-xs text-foreground hover:underline"
                    >
                        {file.fileName}
                    </a>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                        {formatBytes(file.sizeBytes)}
                    </span>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0"
                        onClick={() => deleteMutation.mutate(file.id)}
                        disabled={deleteMutation.isPending}
                    >
                        <Trash2 size={12} />
                    </Button>
                </div>
            ))}
        </div>
    );
}
