import {
    HubConnectionBuilder,
    HubConnectionState,
    type HubConnection,
} from '@microsoft/signalr';
import { useState, useEffect, useRef } from 'react';

interface UseSignalRConnectionResult {
    connection: HubConnection | null;
    connectionState: HubConnectionState;
}

export const useSignalRConnection = (
    hubUrl: string,
    enabled = true,
): UseSignalRConnectionResult => {
    const [connectionState, setConnectionState] = useState<HubConnectionState>(
        HubConnectionState.Disconnected,
    );
    const connectionRef = useRef<HubConnection | null>(null);

    useEffect(() => {
        if (!enabled) return;

        let cancelled = false;

        // Resolve relative hub paths against the API origin so SignalR
        // negotiates against the backend, not the Vite dev server.
        // When VITE_API_URL is empty (same-origin nginx proxy), fall back to
        // window.location.origin so SignalR receives an absolute URL.
        const envBase = (import.meta.env.VITE_API_URL as string | undefined) ?? '';
        const apiBase = envBase !== '' ? envBase : window.location.origin;
        const resolvedUrl = /^https?:\/\//.test(hubUrl) ? hubUrl : `${apiBase}${hubUrl}`;

        const connection = new HubConnectionBuilder()
            .withUrl(resolvedUrl, { withCredentials: true })
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        const updateState = (): void => {
            if (!cancelled) setConnectionState(connection.state);
        };

        // Lifecycle handlers are bound to this connection instance. When the
        // effect re-runs we discard the whole HubConnection, so handlers are
        // garbage-collected with it — no manual .off() needed.
        connection.onreconnecting(updateState);
        connection.onreconnected(updateState);
        connection.onclose(updateState);

        connection
            .start()
            .then(updateState)
            .catch(() => { if (!cancelled) setConnectionState(HubConnectionState.Disconnected); });

        return () => {
            cancelled = true;
            connectionRef.current = null;
            void connection.stop();
        };
    }, [hubUrl, enabled]);

    return { connection: connectionRef.current, connectionState };
};
