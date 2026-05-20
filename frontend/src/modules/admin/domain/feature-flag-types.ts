export interface FeatureFlag {
    key: string;
    enabled: boolean;
    description: string | null;
    updatedAt: string;
}

export interface UpdateFeatureFlagData {
    enabled: boolean;
    description?: string;
}
