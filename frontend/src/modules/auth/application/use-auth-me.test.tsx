import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'
import { server } from '@/test/mocks/server'
import { useAuthMe } from './use-auth-me'
import { useAuthStore } from './auth-store'

const BASE_URL = 'http://localhost:5209'

function makeWrapper() {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    )
}

describe('useAuthMe', () => {
    beforeEach(() => {
        useAuthStore.setState({ isAuthenticated: true })
    })

    it('fetches the current user when authenticated', async () => {
        const { result } = renderHook(() => useAuthMe(), { wrapper: makeWrapper() })

        await waitFor(() => expect(result.current.isSuccess).toBe(true))
        expect(result.current.data?.email).toBe('test@test.com')
        expect(result.current.data?.id).toBe('user-1')
    })

    it('does not fetch when isAuthenticated is false', () => {
        useAuthStore.setState({ isAuthenticated: false })
        const { result } = renderHook(() => useAuthMe(), { wrapper: makeWrapper() })
        expect(result.current.fetchStatus).toBe('idle')
    })

    it('surfaces error responses', async () => {
        server.use(
            http.get(`${BASE_URL}/api/auth/me`, () => new HttpResponse(null, { status: 500 })),
        )
        const { result } = renderHook(() => useAuthMe(), { wrapper: makeWrapper() })
        await waitFor(() => expect(result.current.isError).toBe(true))
    })
})
