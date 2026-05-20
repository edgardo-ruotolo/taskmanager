import { describe, it, expect } from 'vitest'
import { axe } from 'vitest-axe'
import { render } from '@/test/utils'
import { LoginPage } from '@/modules/auth/presentation/pages/LoginPage'

// Lightweight smoke test for accessibility. Page-level audits run against
// pages we can mount safely without deep route/data dependencies.
// Heavier pages (workspace dashboard, issues board) need a logged-in session
// and live data — those are covered by Lighthouse / Playwright instead.

describe('a11y smoke', () => {
    it('LoginPage has no critical axe violations', async () => {
        const { container } = render(<LoginPage />)
        const results = await axe(container)
        // Use `expect.soft` semantics: log violations but do not fail the suite
        // until contrast/landmark fixes from Fase 2 are fully measured.
        if (results.violations.length > 0) {
            console.warn('a11y violations on LoginPage:', JSON.stringify(results.violations, null, 2))
        }
        // Fail only on critical-impact violations.
        const critical = results.violations.filter((v) => v.impact === 'critical')
        expect(critical).toHaveLength(0)
    })
})
