'use client';

import React, { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { NotificationPanel } from './NotificationPanel';

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={isOpen}
        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors active:scale-95 ${
          isOpen
            ? 'border-brand bg-brand text-on-brand'
            : unreadCount > 0
              ? 'border-brand/40 bg-brand/10 text-brand-ink'
              : 'border-line bg-surface-2 text-fg-2 hover:text-fg'
        }`}
      >
        <BellIcon className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            aria-hidden="true"
            className={`pointer-events-none absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-bold ring-2 ring-canvas ${
              isOpen ? 'bg-fg text-canvas' : 'bg-brand text-on-brand'
            }`}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>

      <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};
