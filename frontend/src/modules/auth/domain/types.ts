export interface OnboardingState {
    hasCompletedOnboarding: boolean;
    completedSteps: string[];
    currentStep: string | null;
}

export interface User {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatarUrl?: string;
    roles?: string[];
    isSuperAdmin?: boolean;
    onboarding?: OnboardingState;
    /** ISO date set by the backend when the first workspace is created. Null means onboarding not yet completed. */
    onboardingCompletedAt: string | null;
    /** Steps tracked by the backend (optional, may not be present in all responses). */
    onboardingCompletedSteps?: string[];
}

