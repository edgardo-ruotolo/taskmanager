import { QueryClient } from '@tanstack/react-query';

// 5 minutes — safe default for most product data. Specific hooks override
// with `staleTime: 0` for real-time-critical queries (notifications,
// collaborative editing, activity feeds, intake counts).
const FIVE_MINUTES_MS = 5 * 60 * 1000;

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: FIVE_MINUTES_MS,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        },
    },
});
