export type EstimateType = 'Points' | 'Categories' | 'Time';

export interface EstimatePoint {
    id: string;
    estimateId: string;
    key: string;
    value: string;
    description: string | null;
    sortOrder: number;
}

export interface Estimate {
    id: string;
    name: string;
    description: string | null;
    type: EstimateType;
    companyId: string;
    createdAt: string;
    updatedAt: string;
    points: EstimatePoint[];
}

export interface CreateEstimateData {
    name: string;
    description?: string;
    type: EstimateType;
}

export interface CreateEstimatePointData {
    key: string;
    value: string;
    description?: string;
    sortOrder?: number;
}
