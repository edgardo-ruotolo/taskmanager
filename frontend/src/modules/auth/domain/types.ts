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
    onboarding?: OnboardingState;
}

