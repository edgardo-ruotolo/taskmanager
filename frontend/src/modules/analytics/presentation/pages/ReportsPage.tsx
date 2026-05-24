import type React from 'react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileText, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Input } from '@/components/ui/input';
import { Label as UiLabel } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { analyticsRepository } from '../../infrastructure/analytics-repository';
import { useAnalyticsFiltersStore } from '../../application/filters-store';
import { useCreateReport, useDeleteExport, useExports } from '../../application/use-analytics';
import type { ExporterHistory } from '../../domain/types';

type ReportFormat = 'pdf' | 'xlsx' | 'csv';

const SECTIONS: { id: string; label: string }[] = [
    { id: 'kpis', label: 'KPIs y distribuciones' },
    { id: 'gantt', label: 'Gantt' },
    { id: 'burndown', label: 'Burndown' },
    { id: 'drilldown', label: 'Detalle de tareas' },
    { id: 'ranking', label: 'Ranking de usuarios' },
    { id: 'clients', label: 'Comparativa por cliente' },
];

const STATUS_LABEL: Record<string, string> = {
    Pending: 'Pendiente',
    Processing: 'En proceso',
    Completed: 'Completado',
    Failed: 'Falló',
};

const FORMAT_LABEL: Record<string, string> = {
    Pdf: 'PDF',
    Xlsx: 'Excel',
    Csv: 'CSV',
    Json: 'JSON',
};

export const ReportsPage = (): React.ReactElement => {
    const { workspaceSlug = '' } = useParams<{ workspaceSlug: string }>();
    const filters = useAnalyticsFiltersStore(workspaceSlug);
    const [open, setOpen] = useState(false);

    const hasPending = useHasPendingExports(workspaceSlug);
    const { data: history, isLoading } = useExports(workspaceSlug, hasPending ? 5000 : false);

    return (
        <div className="mx-auto max-w-[1100px] px-10 py-8 space-y-5">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-[20px] font-medium tracking-[-0.02em] text-[var(--neutral-1200)]">
                        Reportes
                    </h2>
                    <p className="text-[12.5px] text-[var(--neutral-600)] mt-0.5">
                        Generá un PDF profesional para enviar al cliente, o exportá XLSX/CSV para
                        análisis posterior.
                    </p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nuevo reporte
                        </Button>
                    </DialogTrigger>
                    <ReportDialog
                        workspaceSlug={workspaceSlug}
                        activeFiltersCount={filters.countActiveFilters()}
                        onClose={() => setOpen(false)}
                    />
                </Dialog>
            </div>

            <div className="bg-white border border-[var(--neutral-400)] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[12.5px]">
                        <thead className="bg-[var(--neutral-100)] border-b border-[var(--neutral-300)]">
                            <tr>
                                <Th>Archivo</Th>
                                <Th>Formato</Th>
                                <Th>Estado</Th>
                                <Th>Creado</Th>
                                <Th>Completado</Th>
                                <Th />
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-3 py-8 text-center text-[var(--neutral-600)]"
                                    >
                                        Cargando…
                                    </td>
                                </tr>
                            )}
                            {!isLoading && (history ?? []).length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-3 py-12 text-center text-[var(--neutral-600)]"
                                    >
                                        Sin reportes generados todavía.
                                    </td>
                                </tr>
                            )}
                            {(history ?? []).map((h) => (
                                <ReportRow key={h.id} workspaceSlug={workspaceSlug} report={h} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// ── Subcomponents ────────────────────────────────────────────────────────

const Th = ({ children }: { children?: React.ReactNode }): React.ReactElement => (
    <th className="px-3 py-2 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--neutral-600)]">
        {children}
    </th>
);

interface ReportRowProps {
    workspaceSlug: string;
    report: ExporterHistory;
}

const ReportRow = ({ workspaceSlug, report }: ReportRowProps): React.ReactElement => {
    const status = report.status;
    const isCompleted = status === 'Completed';
    const downloadUrl = analyticsRepository.getExportDownloadUrl(workspaceSlug, report.id);
    const deleteMutation = useDeleteExport(workspaceSlug);

    const handleDelete = (): void => {
        const confirmed = window.confirm(
            '¿Eliminar este reporte? Esta acción no se puede deshacer.',
        );
        if (!confirmed) return;
        deleteMutation.mutate(report.id);
    };

    return (
        <tr className="border-b border-[var(--neutral-100)] hover:bg-[var(--neutral-50)]">
            <td className="px-3 py-2 max-w-[260px]">
                <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--neutral-500)]" />
                    <span
                        className="text-[12.5px] text-[var(--neutral-1200)] truncate"
                        title={report.fileName ?? undefined}
                    >
                        {report.fileName ?? '—'}
                    </span>
                </div>
            </td>
            <td className="px-3 py-2">
                <Badge variant="secondary" className="text-[10px]">
                    {FORMAT_LABEL[report.format] ?? report.format}
                </Badge>
            </td>
            <td className="px-3 py-2">
                <StatusBadge status={status} />
                {status === 'Failed' && report.errorMessage && (
                    <div className="text-[10px] text-[#c54a3a] mt-1 max-w-xs truncate">
                        {report.errorMessage}
                    </div>
                )}
            </td>
            <td className="px-3 py-2 text-[12px] text-[var(--neutral-600)] tabular-nums">
                {formatDate(report.createdAt)}
            </td>
            <td className="px-3 py-2 text-[12px] text-[var(--neutral-600)] tabular-nums">
                {report.completedAt ? formatDate(report.completedAt) : '—'}
            </td>
            <td className="px-3 py-2 text-right">
                <div className="flex items-center justify-end gap-1.5">
                    {isCompleted && (
                        <Button asChild size="sm" variant="outline" className="gap-1.5 h-7">
                            <a href={downloadUrl} download>
                                <Download className="h-3 w-3" />
                                Descargar
                            </a>
                        </Button>
                    )}
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        aria-label="Eliminar reporte"
                        className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                        disabled={deleteMutation.isPending}
                        onClick={handleDelete}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </td>
        </tr>
    );
};

const StatusBadge = ({ status }: { status: string }): React.ReactElement => {
    const styles: Record<string, string> = {
        Pending: 'bg-amber-100 text-amber-800 border-amber-200',
        Processing: 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse',
        Completed: 'bg-green-100 text-green-800 border-green-200',
        Failed: 'bg-red-100 text-red-800 border-red-200',
    };
    return (
        <span
            className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-medium border',
                styles[status] ?? 'bg-[var(--neutral-100)] text-[var(--neutral-700)] border-[var(--neutral-300)]',
            )}
        >
            {STATUS_LABEL[status] ?? status}
        </span>
    );
};

interface ReportDialogProps {
    workspaceSlug: string;
    activeFiltersCount: number;
    onClose: () => void;
}

const ReportDialog = ({
    workspaceSlug,
    activeFiltersCount,
    onClose,
}: ReportDialogProps): React.ReactElement => {
    const filters = useAnalyticsFiltersStore(workspaceSlug);
    const createReport = useCreateReport(workspaceSlug);

    const [reportName, setReportName] = useState('');
    const [format, setFormat] = useState<ReportFormat>('pdf');
    const [sections, setSections] = useState<string[]>(SECTIONS.map((s) => s.id));

    const allSelected = sections.length === SECTIONS.length;
    const anySelected = sections.length > 0;

    const handleSubmit = (): void => {
        const name = reportName.trim() || `Reporte ${new Date().toLocaleDateString('es')}`;
        const filterSnapshot = {
            userIds: filters.userIds,
            labelIds: filters.labelIds,
            projectIds: filters.projectIds,
            stateIds: filters.stateIds,
            stateCategories: filters.stateCategories,
            priorities: filters.priorities,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            dateField: filters.dateField,
            cycleId: filters.cycleId,
            includeArchived: filters.includeArchived,
        };
        createReport.mutate(
            {
                format,
                payload: {
                    reportName: name,
                    filters: filterSnapshot,
                    sections: format === 'pdf' ? sections : [],
                },
            },
            { onSuccess: () => onClose() },
        );
    };

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Nuevo reporte</DialogTitle>
                <DialogDescription>
                    El reporte aplicará los filtros activos del panel ({activeFiltersCount}{' '}
                    seleccionados).
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <UiLabel htmlFor="report-name">Nombre del reporte</UiLabel>
                    <Input
                        id="report-name"
                        placeholder="Ej. Estado mensual cliente X"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <UiLabel>Formato</UiLabel>
                    <RadioGroup value={format} onValueChange={(v) => setFormat(v as ReportFormat)}>
                        <div className="grid grid-cols-3 gap-2">
                            {(['pdf', 'xlsx', 'csv'] as ReportFormat[]).map((f) => (
                                <label
                                    key={f}
                                    htmlFor={`fmt-${f}`}
                                    className={cn(
                                        'flex items-center gap-2 border rounded-md px-3 py-2 cursor-pointer',
                                        format === f
                                            ? 'border-[var(--brand-700)] bg-[var(--brand-700)]/5'
                                            : 'border-[var(--neutral-300)]',
                                    )}
                                >
                                    <RadioGroupItem value={f} id={`fmt-${f}`} />
                                    <span className="text-[13px] font-medium uppercase">{f}</span>
                                </label>
                            ))}
                        </div>
                    </RadioGroup>
                </div>

                {format === 'pdf' && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <UiLabel>Secciones del PDF</UiLabel>
                            <button
                                type="button"
                                className="text-[11px] text-[var(--brand-700)] hover:underline"
                                onClick={() =>
                                    setSections(allSelected ? [] : SECTIONS.map((s) => s.id))
                                }
                            >
                                {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                            {SECTIONS.map((s) => {
                                const checked = sections.includes(s.id);
                                const inputId = `section-${s.id}`;
                                return (
                                    <label
                                        key={s.id}
                                        htmlFor={inputId}
                                        className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded hover:bg-[var(--neutral-50)]"
                                    >
                                        <Checkbox
                                            id={inputId}
                                            checked={checked}
                                            onCheckedChange={(c) => {
                                                if (c) setSections([...sections, s.id]);
                                                else setSections(sections.filter((x) => x !== s.id));
                                            }}
                                        />
                                        <span className="text-[13px]">{s.label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="bg-[var(--neutral-100)] border border-[var(--neutral-300)] rounded-md px-3 py-2">
                    <Eyebrow>Filtros aplicados</Eyebrow>
                    <p className="mt-1 text-[12px] text-[var(--neutral-700)]">
                        {activeFiltersCount > 0
                            ? `Se aplicarán ${activeFiltersCount} grupo(s) de filtros activos.`
                            : 'Sin filtros. Se incluirán todos los datos del workspace.'}
                    </p>
                </div>
            </div>

            <DialogFooter>
                <Button variant="outline" onClick={onClose} disabled={createReport.isPending}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={
                        createReport.isPending || (format === 'pdf' && !anySelected)
                    }
                >
                    {createReport.isPending ? 'Generando…' : 'Generar reporte'}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

// ── Helpers ──────────────────────────────────────────────────────────────

function useHasPendingExports(workspaceSlug: string): boolean {
    const { data } = useExports(workspaceSlug, false);
    return useMemo(
        () =>
            (data ?? []).some(
                (h) => h.status === 'Pending' || h.status === 'Processing',
            ),
        [data],
    );
}

function formatDate(s: string): string {
    return new Date(s).toLocaleString('es', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}
