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

        const connection = new HubConnectionBuilder()
            .withUrl(hubUrl)
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        const updateState = (): void => setConnectionState(connection.state);

        connection.onreconnecting(updateState);
        connection.onreconnected(updateState);
        connection.onclose(updateState);

        connection
            .start()
            .then(updateState)
            .catch(() => setConnectionState(HubConnectionState.Disconnected));

        return () => {
            void connection.stop();
        };
    }, [hubUrl, enabled]);

    return { connection: connectionRef.current, connectionState };
};
