import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { server } from '@/test/mocks/server'
import { useNotifications } from './use-notifications'

const BASE_URL = 'http://localhost:5209'

function makeWrapper(qc: QueryClient) {
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    )
}

describe('useNotifications', () => {
    it('returns notifications list', async () => {
        const sample = [
            {
                id: 'notif-1',
                title: 'Test',
                message: 'A new event',
                isRead: false,
                createdAt: new Date().toISOString(),
            },
        ]
        server.use(http.get(`${BASE_URL}/api/notifications`, () => HttpResponse.json(sample)))

        const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
        const { result } = renderHook(() => useNotifications(), { wrapper: makeWrapper(qc) })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toHaveLength(1)
        expect(result.current.data?.[0]?.id).toBe('notif-1')
    })

    it('treats notifications as real-time critical (staleTime 0)', async () => {
        const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
        const { result } = renderHook(() => useNotifications(), { wrapper: makeWrapper(qc) })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        // The query should be considered stale right away (staleTime: 0).
        expect(result.current.isStale).toBe(true)
    })
})
