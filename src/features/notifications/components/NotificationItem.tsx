'use client';

import React from 'react';
import { AppNotification, NotificationType } from '../types';
import { motion } from 'framer-motion';
import {
    BellAlertIcon,
    SparklesIcon,
    TrophyIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

interface NotificationItemProps {
    notification: AppNotification;
    onRead: (id: string) => void;
    onRemove: (id: string) => void;
    showRemove?: boolean;
}

const icons: Record<NotificationType, React.ReactNode> = {
    goal_reminder: <BellAlertIcon className="w-5 h-5 text-orange-400" />,
    coach_advice: <SparklesIcon className="w-5 h-5 text-[var(--primary)]" />,
    milestone: <TrophyIcon className="w-5 h-5 text-yellow-400" />,
    system: <InformationCircleIcon className="w-5 h-5 text-blue-400" />,
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onRead,
    onRemove,
    showRemove = true
}) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`group relative p-4 rounded-2xl border transition-all duration-300 ${notification.isRead
                ? 'bg-white/5 border-white/5 opacity-70'
                : 'bg-white/10 border-white/20 shadow-lg'
                }`}
            onClick={() => !notification.isRead && onRead(notification.id)}
        >
            <div className="flex gap-4">
                <div className="shrink-0 pt-1">
                    {icons[notification.type]}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <h4 className={`text-sm font-bold truncate ${notification.isRead ? 'text-gray-400' : 'text-white'}`}>
                            {notification.title}
                        </h4>
                        {showRemove && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(notification.id);
                                }}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                        {notification.message}
                    </p>
                    {notification.suggestion && (
                        <div className="mt-2 py-1.5 px-3 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-medium border border-[var(--primary)]/20">
                            💡 {notification.suggestion}
                        </div>
                    )}
                    <p className="text-[10px] text-gray-500 mt-2">
                        {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            {!notification.isRead && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--primary)] rounded-r-full shadow-[0_0_10px_#00ff88]" />
            )}
        </motion.div>
    );
};
