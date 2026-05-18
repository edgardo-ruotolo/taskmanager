import type React from 'react';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { PdfIssueData } from '../../domain/types';

const PRIORITY_NAMES: Record<number, string> = {
    0: 'Sin prioridad',
    1: 'Urgente',
    2: 'Alta',
    3: 'Media',
    4: 'Baja',
};

interface IssueListPdfExportProps {
    issues: PdfIssueData[];
    companyIdentifier?: string;
}

export function IssueListPdfExport({ issues, companyIdentifier }: IssueListPdfExportProps): React.ReactElement {
    const handleExport = async (): Promise<void> => {
        if (issues.length === 0) {
            toast.warning('No hay tareas para exportar');
            return;
        }

        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');

            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

            doc.setFontSize(16);
            doc.setTextColor(30, 30, 30);
            doc.text('Lista de Tareas', 14, 15);

            doc.setFontSize(9);
            doc.setTextColor(120, 120, 120);
            doc.text(
                `Exportado el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`,
                14,
                22,
            );

            autoTable(doc, {
                startY: 28,
                head: [['ID', 'Título', 'Estado', 'Prioridad', 'Fecha de creación']],
                body: issues.map((issue) => [
                    `${companyIdentifier ?? 'ISS'}-${issue.sequenceId}`,
                    issue.title.length > 80 ? `${issue.title.slice(0, 77)}...` : issue.title,
                    issue.stateName,
                    PRIORITY_NAMES[issue.priority] ?? 'Desconocida',
                    new Date(issue.createdAt).toLocaleDateString('es-ES'),
                ]),
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    textColor: [40, 40, 40],
                },
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252],
                },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 'auto' },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 30 },
                    4: { cellWidth: 35 },
                },
            });

            const fileName = `issues-${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            toast.success(`PDF exportado: ${fileName}`);
        } catch {
            toast.error('Error al exportar PDF');
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => void handleExport()}
            className="gap-1.5 text-xs border-subtle text-secondary hover:text-primary"
        >
            <FileDown size={13} />
            Exportar PDF
        </Button>
    );
}
