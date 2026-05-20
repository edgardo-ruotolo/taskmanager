import posthog from 'posthog-js';

/**
 * Initializes PostHog if a `VITE_POSTHOG_KEY` is provided.
 *
 * Sticks to safe defaults: no autocapture (we want intentional events),
 * pageviews enabled, no session replay by default. The host can be
 * overridden via `VITE_POSTHOG_HOST` for self-hosted deployments.
 */
export function initPostHog(): void {
    const apiKey = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
    if (!apiKey) return;

    const apiHost = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://app.posthog.com';

    posthog.init(apiKey, {
        api_host: apiHost,
        autocapture: false,
        capture_pageview: true,
        persistence: 'localStorage+cookie',
        loaded: (instance) => {
            if (import.meta.env.MODE === 'development') {
                instance.debug(false);
            }
        },
    });
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    if (!isPostHogReady()) return;
    posthog.capture(eventName, properties);
}

export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
    if (!isPostHogReady()) return;
    posthog.identify(userId, traits);
}

export function resetTelemetryUser(): void {
    if (!isPostHogReady()) return;
    posthog.reset();
}

function isPostHogReady(): boolean {
    return Boolean(import.meta.env.VITE_POSTHOG_KEY) && Boolean(posthog?.__loaded);
}
