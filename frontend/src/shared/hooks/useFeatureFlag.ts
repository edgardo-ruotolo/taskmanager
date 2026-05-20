import { useFeatureFlags } from '@/modules/admin/application/use-feature-flags';

/**
 * Returns a stable evaluator function for the current set of feature flags.
 * Usage:
 *   const isEnabled = useFeatureFlag();
 *   if (isEnabled('NewAnalyticsPage')) { ... }
 *
 * The query is cached for 60s so common evaluation paths don't refetch.
 */
export function useFeatureFlag(): (key: string) => boolean {
    const { data = [] } = useFeatureFlags();
    return (key: string): boolean =>
        data.find((f) => f.key === key)?.enabled === true;
}

/**
 * Convenience hook to check a single flag key.
 */
export function useIsFeatureEnabled(key: string): boolean {
    const evaluate = useFeatureFlag();
    return evaluate(key);
}
