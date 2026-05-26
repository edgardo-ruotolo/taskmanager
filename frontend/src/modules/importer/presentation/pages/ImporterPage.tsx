import type React from 'react';
import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, FileText, AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useImporterHistory, useUploadCsv } from '../../application/use-importer';
import type { ImporterHistory } from '../../domain/types';

const STATUS_CONFIG: Record<
    ImporterHistory['status'],
    { label: string; icon: React.ReactNode; className: string }
> = {
    pending: {
        label: 'Pendiente',
        icon: <Clock size={12} />,
        className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },
    processing: {
        label: 'Procesando',
        icon: <Loader2 size={12} className="animate-spin" />,
        className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    completed: {
        label: 'Completado',
        icon: <CheckCircle2 size={12} />,
        className: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
    failed: {
        label: 'Fallido',
        icon: <AlertCircle size={12} />,
        className: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
};

function StatusBadge({ status }: { status: ImporterHistory['status'] }): React.ReactElement {
    const config = STATUS_CONFIG[status];
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
                config.className,
            )}
        >
            {config.icon}
            {config.label}
        </span>
    );
}

export const ImporterPage = (): React.ReactElement => {
    const { workspaceSlug = '', projectId = '' } = useParams<{
        workspaceSlug: string;
        projectId: string;
    }>();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const { data: history = [], isLoading } = useImporterHistory(workspaceSlug, projectId);
    const { mutate: uploadCsv, isPending: isUploading } = useUploadCsv(workspaceSlug, projectId);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0] ?? null;
        setSelectedFile(file);
    };

    const handleUpload = (): void => {
        if (!selectedFile) return;
        uploadCsv(selectedFile, {
            onSuccess: () => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
        });
    };

    return (
        <div className="p-6 md:p-8 w-full">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-primary mb-1">
                    Importar Issues desde CSV
                </h1>
                <p className="text-sm text-tertiary">
                    Carga un archivo CSV para importar issues masivamente al proyecto.
                </p>
            </div>

            {/* Instructions card */}
            <div className="rounded-lg border border-subtle bg-surface-1 p-5 mb-6">
                <div className="flex items-start gap-3">
                    <FileText size={18} className="text-accent-primary shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-primary mb-1">
                            Formato requerido
                        </p>
                        <p className="text-sm text-secondary">
                            El archivo CSV debe tener las siguientes columnas:
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {(['title', 'description', 'priority', 'state'] as const).map((col) => (
                                <code
                                    key={col}
                                    className="px-2 py-0.5 rounded bg-layer-2 text-xs font-mono text-secondary border border-subtle"
                                >
                                    {col}
                                    {col === 'title' && (
                                        <span className="ml-1 text-red-400 text-[10px]">*</span>
                                    )}
                                </code>
                            ))}
                        </div>
                        <p className="text-xs text-placeholder mt-2">
                            * El campo <code className="font-mono">title</code> es requerido. Los demás son opcionales.
                        </p>
                    </div>
                </div>
            </div>

            {/* Upload section */}
            <div className="rounded-lg border border-dashed border-subtle bg-surface-1 p-6 mb-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent-primary/10 flex items-center justify-center">
                        <Upload size={20} className="text-accent-primary" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-primary mb-1">
                            Selecciona un archivo CSV
                        </p>
                        <p className="text-xs text-placeholder">Solo se aceptan archivos .csv</p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csv-file-input"
                    />
                    <label
                        htmlFor="csv-file-input"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-md border border-subtle bg-layer-1 text-sm text-secondary hover:bg-layer-2 hover:text-primary transition-colors"
                    >
                        <FileText size={14} />
                        {selectedFile ? selectedFile.name : 'Seleccionar archivo'}
                    </label>

                    {selectedFile && (
                        <Button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="bg-accent-primary hover:bg-accent-primary-hover text-on-color"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin mr-2" />
                                    Importando...
                                </>
                            ) : (
                                <>
                                    <Upload size={14} className="mr-2" />
                                    Cargar e importar
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* History section */}
            <div>
                <h2 className="text-base font-semibold text-primary mb-4">
                    Historial de importaciones
                </h2>

                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-12 w-full bg-layer-1 rounded-lg" />
                        ))}
                    </div>
                ) : history.length === 0 ? (
                    <div className="rounded-lg border border-subtle bg-surface-1 p-8 text-center">
                        <p className="text-sm text-placeholder italic">
                            No hay importaciones registradas aún.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-lg border border-subtle overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-subtle hover:bg-transparent">
                                    <TableHead className="text-xs text-placeholder font-medium">
                                        Archivo
                                    </TableHead>
                                    <TableHead className="text-xs text-placeholder font-medium text-center">
                                        Total
                                    </TableHead>
                                    <TableHead className="text-xs text-placeholder font-medium text-center">
                                        Exitosos
                                    </TableHead>
                                    <TableHead className="text-xs text-placeholder font-medium text-center">
                                        Errores
                                    </TableHead>
                                    <TableHead className="text-xs text-placeholder font-medium">
                                        Estado
                                    </TableHead>
                                    <TableHead className="text-xs text-placeholder font-medium">
                                        Fecha
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.map((item: ImporterHistory) => (
                                    <>
                                        <TableRow
                                            key={item.id}
                                            className="border-subtle hover:bg-layer-1/30"
                                        >
                                            <TableCell className="text-sm text-primary font-medium max-w-[200px] truncate">
                                                {item.fileName}
                                            </TableCell>
                                            <TableCell className="text-sm text-secondary text-center">
                                                {item.totalRows}
                                            </TableCell>
                                            <TableCell className="text-sm text-green-400 text-center">
                                                {item.successRows}
                                            </TableCell>
                                            <TableCell className="text-sm text-center">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        'text-xs',
                                                        item.errorRows > 0
                                                            ? 'text-red-400 border-red-500/20 bg-red-500/10'
                                                            : 'text-placeholder border-subtle',
                                                    )}
                                                >
                                                    {item.errorRows}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={item.status} />
                                            </TableCell>
                                            <TableCell className="text-xs text-placeholder">
                                                {new Date(item.createdAt).toLocaleDateString(
                                                    'es-ES',
                                                    {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    },
                                                )}
                                            </TableCell>
                                        </TableRow>

                                        {/* Error accordion inline row */}
                                        {item.errorLog && item.errorLog.length > 0 && (
                                            <TableRow
                                                key={`${item.id}-errors`}
                                                className="border-subtle"
                                            >
                                                <TableCell
                                                    colSpan={6}
                                                    className="p-0 bg-red-500/5"
                                                >
                                                    <Accordion type="single" collapsible>
                                                        <AccordionItem
                                                            value={`errors-${item.id}`}
                                                            className="border-0"
                                                        >
                                                            <AccordionTrigger className="px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:no-underline">
                                                                Ver errores (
                                                                {Math.min(
                                                                    item.errorLog.length,
                                                                    10,
                                                                )}{' '}
                                                                de {item.errorLog.length})
                                                            </AccordionTrigger>
                                                            <AccordionContent className="px-4 pb-3">
                                                                <ul className="space-y-1">
                                                                    {item.errorLog
                                                                        .slice(0, 10)
                                                                        .map((err, idx) => (
                                                                            <li
                                                                                // biome-ignore lint/suspicious/noArrayIndexKey: error list is static
                                                                                key={idx}
                                                                                className="flex items-start gap-2 text-xs text-red-300"
                                                                            >
                                                                                <AlertCircle
                                                                                    size={11}
                                                                                    className="shrink-0 mt-0.5"
                                                                                />
                                                                                {err}
                                                                            </li>
                                                                        ))}
                                                                </ul>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </div>
    );
};
