import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils';
import { OnboardingPage } from './OnboardingPage';

// Mock authRepository and workspaceRepository to avoid network calls
vi.mock('../../infrastructure/auth-repository', () => ({
    authRepository: {
        me: vi.fn(),
        updateProfile: vi.fn().mockResolvedValue({
            id: '1',
            email: 'test@test.com',
            username: 'testuser',
            displayName: 'Test User',
        }),
    },
}));

vi.mock('@/modules/workspaces/infrastructure/workspace-repository', () => ({
    workspaceRepository: {
        create: vi.fn().mockResolvedValue({ id: '1', name: 'Test WS', slug: 'test-ws' }),
    },
}));

// Mock auth-store and use-auth-me — user lives in Query cache, store only tracks the flag.
vi.mock('../../application/auth-store', () => ({
    useAuthStore: Object.assign(
        () => ({
            isAuthenticated: true,
            setAuthenticated: vi.fn(),
            clearAuth: vi.fn(),
        }),
        {
            getState: () => ({
                isAuthenticated: true,
                setAuthenticated: vi.fn(),
                clearAuth: vi.fn(),
            }),
        },
    ),
}));

vi.mock('../../application/use-auth-me', () => ({
    useAuthMe: () => ({ data: null, isLoading: false, isError: false }),
    setAuthSession: vi.fn(),
    getCurrentUser: () => null,
    authMeKey: ['auth', 'me'],
}));

beforeEach(() => {
    // Reset onboarding state before each test
    const storage = typeof window !== 'undefined' ? window.localStorage : null;
    storage?.removeItem('onboarding_state');
});

describe('OnboardingPage', () => {
    it('renders the welcome step first', () => {
        render(<OnboardingPage />);
        expect(screen.getByText('Bienvenido a TaskManager')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /comenzar/i })).toBeInTheDocument();
    });

    it('advances to the profile step when clicking Comenzar', async () => {
        const user = userEvent.setup();
        render(<OnboardingPage />);

        await user.click(screen.getByRole('button', { name: /comenzar/i }));

        expect(screen.getByText('Personaliza tu perfil')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Juan Pérez')).toBeInTheDocument();
    });
});
