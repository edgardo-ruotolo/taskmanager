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

interface IssuePdfExportProps {
    issue: PdfIssueData;
    identifier?: string;
}

export function IssuePdfExport({ issue, identifier }: IssuePdfExportProps): React.ReactElement {
    const handleExport = async (): Promise<void> => {
        try {
            const { default: jsPDF } = await import('jspdf');
            const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

            const margin = 20;
            let y = margin;

            // Title header
            doc.setFontSize(10);
            doc.setTextColor(120, 120, 120);
            doc.text(identifier ?? `ISSUE-${issue.sequenceId}`, margin, y);
            y += 8;

            // Issue title
            doc.setFontSize(18);
            doc.setTextColor(30, 30, 30);
            const titleLines = doc.splitTextToSize(issue.title, 170) as string[];
            doc.text(titleLines, margin, y);
            y += titleLines.length * 8 + 6;

            // Metadata row
            doc.setFontSize(10);
            doc.setTextColor(80, 80, 80);
            doc.text(`Estado: ${issue.stateName}`, margin, y);
            doc.text(`Prioridad: ${PRIORITY_NAMES[issue.priority] ?? 'Desconocida'}`, 90, y);
            doc.text(
                `Creado: ${new Date(issue.createdAt).toLocaleDateString('es-ES')}`,
                150,
                y,
            );
            y += 8;

            if (issue.dueDate) {
                doc.text(
                    `Fecha límite: ${new Date(issue.dueDate).toLocaleDateString('es-ES')}`,
                    margin,
                    y,
                );
                y += 8;
            }

            // Separator
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, y, 210 - margin, y);
            y += 8;

            // Description
            if (issue.description) {
                doc.setFontSize(11);
                doc.setTextColor(30, 30, 30);
                doc.text('Descripción', margin, y);
                y += 6;

                doc.setFontSize(10);
                doc.setTextColor(60, 60, 60);
                // Strip basic HTML tags
                const plainText = issue.description
                    .replace(/<[^>]*>/g, ' ')
                    .replace(/\s+/g, ' ')
                    .trim()
                    .slice(0, 500);
                const descLines = doc.splitTextToSize(plainText, 170) as string[];
                doc.text(descLines, margin, y);
            }

            const fileName = `issue-${identifier ?? issue.sequenceId}.pdf`;
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
