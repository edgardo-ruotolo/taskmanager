import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { server } from '@/test/mocks/server'
import { useIssues, useDeleteIssue, issuesKey } from './use-issues'

const BASE_URL = 'http://localhost:5209'

function makeWrapper(qc: QueryClient) {
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    )
}

describe('useIssues', () => {
    it('returns the issues page for a company', async () => {
        const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 60_000 } } })
        const { result } = renderHook(() => useIssues('test-ws', 'company-1'), {
            wrapper: makeWrapper(qc),
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data?.items).toHaveLength(1)
    })
})

describe('useDeleteIssue (optimistic)', () => {
    it('removes the issue from the cached list immediately', async () => {
        const qc = new QueryClient({
            defaultOptions: { queries: { retry: false, gcTime: 60_000 }, mutations: { retry: false } },
        })

        qc.setQueryData(issuesKey('test-ws', 'company-1'), [
            { id: 'issue-1', title: 'A' },
            { id: 'issue-2', title: 'B' },
        ])

        server.use(
            http.delete(
                `${BASE_URL}/api/workspaces/:slug/companies/:companyId/issues/:id`,
                async () => {
                    await new Promise((r) => setTimeout(r, 50))
                    return new HttpResponse(null, { status: 204 })
                },
            ),
        )

        const { result } = renderHook(() => useDeleteIssue('test-ws', 'company-1'), {
            wrapper: makeWrapper(qc),
        })

        await act(async () => {
            result.current.mutate('issue-1')
        })

        const optimisticList = qc.getQueryData(issuesKey('test-ws', 'company-1')) as Array<{
            id: string
        }>
        expect(optimisticList.map((i) => i.id)).toEqual(['issue-2'])
    })

    it('rolls back when the server rejects the delete', async () => {
        const qc = new QueryClient({
            defaultOptions: { queries: { retry: false, gcTime: 60_000 }, mutations: { retry: false } },
        })

        const original = [
            { id: 'issue-1', title: 'A' },
            { id: 'issue-2', title: 'B' },
        ]
        qc.setQueryData(issuesKey('test-ws', 'company-1'), original)

        server.use(
            http.delete(
                `${BASE_URL}/api/workspaces/:slug/companies/:companyId/issues/:id`,
                () => new HttpResponse(null, { status: 500 }),
            ),
        )

        const { result } = renderHook(() => useDeleteIssue('test-ws', 'company-1'), {
            wrapper: makeWrapper(qc),
        })

        await act(async () => {
            result.current.mutate('issue-1')
        })

        await waitFor(() => expect(result.current.isError).toBe(true))
        const finalList = qc.getQueryData(issuesKey('test-ws', 'company-1')) as Array<{
            id: string
        }>
        expect(finalList.map((i) => i.id)).toEqual(['issue-1', 'issue-2'])
    })
})
