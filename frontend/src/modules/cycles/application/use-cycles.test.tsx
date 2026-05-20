import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { server } from '@/test/mocks/server'
import { useCycles, useAddCycleIssue, cycleIssuesKey } from './use-cycles'

const BASE_URL = 'http://localhost:5209'

function makeWrapper(qc: QueryClient) {
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    )
}

describe('useCycles', () => {
    it('returns cycles for a company', async () => {
        const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 60_000 } } })
        const { result } = renderHook(() => useCycles('test-ws', 'company-1'), {
            wrapper: makeWrapper(qc),
        })
        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data).toHaveLength(1)
        expect(result.current.data?.[0]?.name).toBe('Sprint 1')
    })
})

describe('useAddCycleIssue (optimistic)', () => {
    it('applies the optimistic update before the server responds', async () => {
        const qc = new QueryClient({
            defaultOptions: { queries: { retry: false, gcTime: 60_000 }, mutations: { retry: false } },
        })
        qc.setQueryData(cycleIssuesKey('test-ws', 'company-1', 'cycle-1'), [])

        // Seed issues cache so the optimistic synthesizer finds the issue.
        qc.setQueryData(['issues', 'test-ws', 'company-1'], [
            {
                id: 'issue-1',
                sequenceId: 1,
                title: 'Test',
                priority: 0,
                stateName: 'Todo',
                stateColor: '#000',
            },
        ])

        // Server takes time to respond — ensures the optimistic state is observable.
        server.use(
            http.post(
                `${BASE_URL}/api/workspaces/:slug/companies/:companyId/cycles/:cycleId/issues`,
                async () => {
                    await new Promise((r) => setTimeout(r, 50))
                    return new HttpResponse(null, { status: 204 })
                },
            ),
        )

        const { result } = renderHook(
            () => useAddCycleIssue('test-ws', 'company-1', 'cycle-1'),
            { wrapper: makeWrapper(qc) },
        )

        await act(async () => {
            result.current.mutate('issue-1')
        })

        const optimisticList = qc.getQueryData(
            cycleIssuesKey('test-ws', 'company-1', 'cycle-1'),
        ) as Array<{ issueId: string }>
        expect(optimisticList.some((i) => i.issueId === 'issue-1')).toBe(true)
    })

    it('rolls back the optimistic update on error', async () => {
        const qc = new QueryClient({
            defaultOptions: { queries: { retry: false, gcTime: 60_000 }, mutations: { retry: false } },
        })
        qc.setQueryData(cycleIssuesKey('test-ws', 'company-1', 'cycle-1'), [])
        qc.setQueryData(['issues', 'test-ws', 'company-1'], [
            {
                id: 'issue-1',
                sequenceId: 1,
                title: 'Test',
                priority: 0,
                stateName: 'Todo',
                stateColor: '#000',
            },
        ])

        server.use(
            http.post(
                `${BASE_URL}/api/workspaces/:slug/companies/:companyId/cycles/:cycleId/issues`,
                () => new HttpResponse(null, { status: 500 }),
            ),
        )

        const { result } = renderHook(
            () => useAddCycleIssue('test-ws', 'company-1', 'cycle-1'),
            { wrapper: makeWrapper(qc) },
        )

        await act(async () => {
            result.current.mutate('issue-1')
        })

        await waitFor(() => expect(result.current.isError).toBe(true))
        const finalList = qc.getQueryData(
            cycleIssuesKey('test-ws', 'company-1', 'cycle-1'),
        ) as unknown[]
        expect(finalList).toEqual([])
    })
})
