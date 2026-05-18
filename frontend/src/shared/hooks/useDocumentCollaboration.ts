import { useState, useEffect, useRef, useCallback } from 'react';
import {
    HubConnectionBuilder,
    HubConnectionState,
    type HubConnection,
} from '@microsoft/signalr';
import { useAuthStore } from '@/modules/auth/application/auth-store';

export interface Participant {
    userId: string;
    userName: string;
}

interface UseDocumentCollaborationResult {
    content: string | null;
    updateContent: (content: string) => void;
    participants: Participant[];
    isConnected: boolean;
}

const DEBOUNCE_MS = 500;

export const useDocumentCollaboration = (
    documentId: string,
): UseDocumentCollaborationResult => {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [content, setContent] = useState<string | null>(null);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    const connectionRef = useRef<HubConnection | null>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const documentIdRef = useRef(documentId);
    documentIdRef.current = documentId;

    useEffect(() => {
        if (!isAuthenticated || !documentId) return;

        const hubUrl = `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000'}/hubs/document`;

        const connection = new HubConnectionBuilder()
            .withUrl(hubUrl, { withCredentials: true })
            .withAutomaticReconnect()
            .build();

        connectionRef.current = connection;

        const handleDocumentLoaded = (loadedContent: string): void => {
            setContent(loadedContent);
        };

        const handleDocumentUpdated = (updatedContent: string, _userId: string): void => {
            setContent(updatedContent);
        };

        const handleParticipantsUpdated = (updatedParticipants: Participant[]): void => {
            setParticipants(updatedParticipants);
        };

        connection.on('DocumentLoaded', handleDocumentLoaded);
        connection.on('DocumentUpdated', handleDocumentUpdated);
        connection.on('ParticipantsUpdated', handleParticipantsUpdated);

        const updateState = (): void => {
            setIsConnected(connection.state === HubConnectionState.Connected);
        };

        connection.onreconnecting(updateState);
        connection.onreconnected(() => {
            updateState();
            void connection.invoke('JoinDocument', documentIdRef.current);
        });
        connection.onclose(updateState);

        connection
            .start()
            .then(async () => {
                updateState();
                await connection.invoke('JoinDocument', documentId);
            })
            .catch(() => {
                setIsConnected(false);
            });

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            connection.off('DocumentLoaded', handleDocumentLoaded);
            connection.off('DocumentUpdated', handleDocumentUpdated);
            connection.off('ParticipantsUpdated', handleParticipantsUpdated);
            void connection
                .invoke('LeaveDocument', documentId)
                .catch(() => undefined)
                .finally(() => void connection.stop());
        };
    }, [documentId, isAuthenticated]);

    const updateContent = useCallback((newContent: string): void => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            const conn = connectionRef.current;
            if (conn?.state === HubConnectionState.Connected) {
                void conn.invoke('UpdateDocument', documentIdRef.current, newContent);
            }
        }, DEBOUNCE_MS);
    }, []);

    return { content, updateContent, participants, isConnected };
};
