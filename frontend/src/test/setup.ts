import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './mocks/server'

// Vitest 4 + happy-dom does not expose a working `localStorage` by default.
// Polyfill an in-memory implementation so persisted Zustand stores work.
if (typeof globalThis.localStorage === 'undefined') {
    const store = new Map<string, string>()
    const storage: Storage = {
        get length(): number {
            return store.size
        },
        clear(): void {
            store.clear()
        },
        getItem(key: string): string | null {
            return store.get(key) ?? null
        },
        key(index: number): string | null {
            return Array.from(store.keys())[index] ?? null
        },
        removeItem(key: string): void {
            store.delete(key)
        },
        setItem(key: string, value: string): void {
            store.set(key, String(value))
        },
    }
    Object.defineProperty(globalThis, 'localStorage', {
        value: storage,
        configurable: true,
    })
}

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
    cleanup()
    server.resetHandlers()
    if (typeof globalThis.localStorage !== 'undefined') {
        globalThis.localStorage.clear()
    }
})
afterAll(() => server.close())
