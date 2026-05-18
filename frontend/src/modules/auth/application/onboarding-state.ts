import type { OnboardingState } from '../domain/types';

const ONBOARDING_KEY = 'onboarding_state';

export function getOnboardingState(): OnboardingState {
    const defaultState: OnboardingState = {
        hasCompletedOnboarding: false,
        completedSteps: [],
        currentStep: null,
    };
    try {
        const storage = typeof window !== 'undefined' ? window.localStorage : null;
        const raw = storage?.getItem(ONBOARDING_KEY);
        if (!raw) return defaultState;
        return JSON.parse(raw) as OnboardingState;
    } catch {
        return defaultState;
    }
}

export function saveOnboardingState(state: OnboardingState): void {
    try {
        const storage = typeof window !== 'undefined' ? window.localStorage : null;
        storage?.setItem(ONBOARDING_KEY, JSON.stringify(state));
    } catch {
        // localStorage not available (e.g. during SSR or test)
    }
}
