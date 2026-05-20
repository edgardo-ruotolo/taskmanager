import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import axios from 'axios'
import { server } from '@/test/mocks/server'
import { useServerMutation } from './useServerMutation'

const BASE_URL = 'http://localhost:5209'

function makeWrapper(qc: QueryClient) {
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    )
}

describe('useServerMutation — error mapping', () => {
    it('routes a 422 validation error to the bound RHF setError', async () => {
        server.use(
            http.post(`${BASE_URL}/api/test-422`, () =>
                HttpResponse.json(
                    { errors: { Title: ['Required'], Slug: ['Already exists'] } },
                    { status: 422 },
                ),
            ),
        )

        const setError = vi.fn()
        const qc = new QueryClient({
            defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
        })

        const { result } = renderHook(
            () =>
                useServerMutation<unknown, Record<string, unknown>>({
                    mutationFn: () => axios.post(`${BASE_URL}/api/test-422`),
                    setError,
                    fallbackMessage: 'Error',
                }),
            { wrapper: makeWrapper(qc) },
        )

        await act(async () => {
            result.current.mutate({})
        })

        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(setError).toHaveBeenCalledWith('title', { type: 'server', message: 'Required' })
        expect(setError).toHaveBeenCalledWith('slug', {
            type: 'server',
            message: 'Already exists',
        })
    })

    it('falls back to a toast (does not call setError) on a generic 500', async () => {
        server.use(
            http.post(`${BASE_URL}/api/test-500`, () =>
                HttpResponse.json({ message: 'boom' }, { status: 500 }),
            ),
        )

        const setError = vi.fn()
        const qc = new QueryClient({
            defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
        })

        const { result } = renderHook(
            () =>
                useServerMutation<unknown, Record<string, unknown>>({
                    mutationFn: () => axios.post(`${BASE_URL}/api/test-500`),
                    setError,
                    fallbackMessage: 'Error',
                }),
            { wrapper: makeWrapper(qc) },
        )

        await act(async () => {
            result.current.mutate({})
        })

        await waitFor(() => expect(result.current.isError).toBe(true))
        expect(setError).not.toHaveBeenCalled()
    })
})
