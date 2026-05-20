import type React from 'react';
import { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCheck, RefreshCw, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useNotificationHub } from '@/shared/hooks/useNotificationHub';
import {
    useNotifications,
    useMarkAsRead,
    useMarkAllAsRead,
} from '../../application/use-notifications';
import type { Notification } from '../../domain/types';

const formatRelativeDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return 'Justo ahora';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: diffDays > 365 ? 'numeric' : undefined,
    });
};

type FilterTab = 'all' | 'mentions' | 'assigned' | 'unread';

const TABS: { id: FilterTab; label: string }[] = [
    { id: 'all', label: 'Todo' },
    { id: 'mentions', label: 'Menciones' },
    { id: 'assigned', label: 'Asignadas' },
    { id: 'unread', label: 'No leídas' },
];

interface NotificationListItemProps {
    notification: Notification;
    isSelected: boolean;
    onSelect: () => void;
    onMarkAsRead: (id: string) => void;
}

function NotificationListItem({
    notification,
    isSelected,
    onSelect,
    onMarkAsRead,
}: NotificationListItemProps): React.ReactElement {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-subtle/50 hover:bg-layer-transparent-hover',
                isSelected && 'bg-accent-subtle/50',
                !notification.isRead && 'bg-layer-1/40',
            )}
        >
            {/* Unread dot */}
            <div className="mt-1.5 shrink-0">
                {!notification.isRead ? (
                    <span className="block w-2 h-2 rounded-full bg-blue-500" />
                ) : (
                    <span className="block w-2 h-2 rounded-full bg-transparent" />
                )}
            </div>

            {/* Avatar placeholder */}
            <div className="w-7 h-7 rounded-full bg-layer-2 border border-subtle shrink-0 flex items-center justify-center text-[10px] font-semibold text-secondary">
                {notification.title?.[0]?.toUpperCase() ?? '?'}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p
                    className={cn(
                        'text-[13px] leading-snug line-clamp-2',
                        notification.isRead ? 'text-tertiary' : 'text-primary font-medium',
                    )}
                >
                    {notification.message}
                </p>
                <p className="text-[11px] text-placeholder mt-1">
                    {formatRelativeDate(notification.createdAt)}
                </p>
            </div>

            {/* Mark read button */}
            {!notification.isRead && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                    }}
                    className="shrink-0 p-1 text-placeholder hover:text-blue-400 transition-colors rounded"
                    aria-label="Marcar como leída"
                >
                    <CheckCheck size={12} />
                </button>
            )}
        </button>
    );
}

function ListLoadingSkeleton(): React.ReactElement {
    return (
        <div className="space-y-0">
            {(['sk-0', 'sk-1', 'sk-2', 'sk-3', 'sk-4'] as const).map((k) => (
                <div key={k} className="flex items-start gap-3 px-4 py-3 border-b border-subtle/50">
                    <Skeleton className="w-2 h-2 rounded-full bg-layer-1 mt-1.5 shrink-0" />
                    <Skeleton className="w-7 h-7 rounded-full bg-layer-1 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-full bg-layer-1" />
                        <Skeleton className="h-3 w-2/3 bg-layer-1" />
                        <Skeleton className="h-2.5 w-16 bg-layer-1" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyListState(): React.ReactElement {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <BellOff size={36} className="text-placeholder mb-3" />
            <p className="text-sm font-medium text-secondary mb-1">Sin notificaciones</p>
            <p className="text-xs text-placeholder max-w-[200px]">
                Las actualizaciones de tus elementos de trabajo suscritos aparecerán aquí
            </p>
        </div>
    );
}

function DetailEmptyState(): React.ReactElement {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <FileText size={40} className="text-placeholder mb-4" />
            <p className="text-sm font-medium text-secondary mb-1">Selecciona una notificación</p>
            <p className="text-xs text-placeholder">
                Haz clic en una notificación para ver los detalles
            </p>
        </div>
    );
}

interface DetailPanelProps {
    notification: Notification;
}

function DetailPanel({ notification }: DetailPanelProps): React.ReactElement {
    return (
        <div className="h-full overflow-y-auto">
            <div className="p-6 space-y-4">
                <div>
                    <p className="text-[11px] font-semibold text-placeholder uppercase tracking-wider mb-2">
                        Notificación
                    </p>
                    <h3 className="text-base font-semibold text-primary">{notification.title}</h3>
                </div>
                <p className="text-sm text-secondary leading-relaxed">{notification.message}</p>
                {notification.notificationType && (
                    <div>
                        <span className="text-[11px] font-medium uppercase tracking-wide text-placeholder bg-layer-2 px-2 py-1 rounded">
                            {notification.notificationType.replace(/_/g, ' ')}
                        </span>
                    </div>
                )}
                <p className="text-xs text-placeholder pt-2">
                    {formatRelativeDate(notification.createdAt)}
                </p>
            </div>
        </div>
    );
}

export const NotificationsPage = (): React.ReactElement => {
    useNotificationHub();

    const { data: notifications, isLoading, refetch } = useNotifications();
    const { mutate: markAsRead } = useMarkAsRead();
    const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const items = notifications ?? [];
    const unreadCount = items.filter((n) => !n.isRead).length;

    const filteredItems = items.filter((n) => {
        if (activeTab === 'unread') return !n.isRead;
        if (activeTab === 'mentions') return n.notificationType === 'MENTION';
        if (activeTab === 'assigned') return n.notificationType === 'ISSUE_ASSIGNED';
        return true;
    });

    const selectedNotification = filteredItems.find((n) => n.id === selectedId) ?? null;

    // Auto-select first on load
    useEffect(() => {
        if (!selectedId && filteredItems.length > 0) {
            setSelectedId(filteredItems[0].id);
        }
    }, [filteredItems, selectedId]);

    return (
        <div className="flex h-full overflow-hidden">
            {/* Left panel — list */}
            <div className="w-[360px] shrink-0 flex flex-col border-r border-subtle">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-subtle shrink-0">
                    <div className="flex items-center gap-2">
                        <Bell size={15} className="text-tertiary" />
                        <h1 className="text-[13px] font-semibold text-primary">Bandeja de entrada</h1>
                        {unreadCount > 0 && (
                            <span className="text-[10px] bg-accent-primary text-on-color px-1.5 py-0.5 rounded-full font-medium">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={() => markAllAsRead()}
                                disabled={isMarkingAll}
                                className="p-1.5 text-placeholder hover:text-primary transition-colors rounded"
                                aria-label="Marcar todo como leído"
                            >
                                <CheckCheck size={14} />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="p-1.5 text-placeholder hover:text-primary transition-colors rounded"
                            aria-label="Actualizar"
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-subtle shrink-0">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                                setActiveTab(tab.id);
                                setSelectedId(null);
                            }}
                            className={cn(
                                'flex-1 py-2 text-[12px] font-medium transition-colors relative',
                                activeTab === tab.id
                                    ? 'text-accent-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-accent-primary'
                                    : 'text-secondary hover:text-primary',
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto vertical-scrollbar">
                    {isLoading ? (
                        <ListLoadingSkeleton />
                    ) : filteredItems.length === 0 ? (
                        <EmptyListState />
                    ) : (
                        filteredItems.map((notification) => (
                            <NotificationListItem
                                key={notification.id}
                                notification={notification}
                                isSelected={selectedId === notification.id}
                                onSelect={() => {
                                    setSelectedId(notification.id);
                                    if (!notification.isRead) markAsRead(notification.id);
                                }}
                                onMarkAsRead={markAsRead}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Right panel — detail */}
            <div className="flex-1 overflow-hidden">
                {selectedNotification ? (
                    <DetailPanel notification={selectedNotification} />
                ) : (
                    <DetailEmptyState />
                )}
            </div>
        </div>
    );
};
