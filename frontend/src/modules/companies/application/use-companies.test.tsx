import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { server } from '@/test/mocks/server'
import { useCompanies } from './use-companies'

const BASE_URL = 'http://localhost:5209'

function makeWrapper() {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    )
}

describe('useCompanies', () => {
    it('returns the list of companies for a workspace', async () => {
        const { result } = renderHook(() => useCompanies('test-ws'), { wrapper: makeWrapper() })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data?.items).toHaveLength(1)
        expect(result.current.data?.items[0]?.identifier).toBe('TEST')
    })

    it('handles empty workspaces', async () => {
        server.use(
            http.get(`${BASE_URL}/api/workspaces/:slug/companies`, () =>
                HttpResponse.json({ items: [], totalCount: 0, page: 1, pageSize: 20 }),
            ),
        )
        const { result } = renderHook(() => useCompanies('test-ws'), { wrapper: makeWrapper() })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data?.items).toHaveLength(0)
    })

    it('propagates 5xx errors', async () => {
        server.use(
            http.get(`${BASE_URL}/api/workspaces/:slug/companies`, () =>
                new HttpResponse(null, { status: 500 }),
            ),
        )
        const { result } = renderHook(() => useCompanies('test-ws'), { wrapper: makeWrapper() })
        await waitFor(() => expect(result.current.isError).toBe(true))
    })
})
