export interface ImporterHistory {
    id: string;
    fileName: string;
    totalRows: number;
    successRows: number;
    errorRows: number;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    errorLog?: string[];
    createdAt: string;
}
