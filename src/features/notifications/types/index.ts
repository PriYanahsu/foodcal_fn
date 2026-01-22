export type NotificationType = 'goal_reminder' | 'milestone' | 'coach_advice' | 'system';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: string;
    isRead: boolean;
    suggestion?: string;
}

export interface NotificationContextType {
    notifications: AppNotification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    removeNotification: (id: string) => void;
    addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
    permission: NotificationPermission;
    requestPermission: () => Promise<void>;
}
