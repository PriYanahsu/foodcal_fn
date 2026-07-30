'use client';

import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { BellIcon } from '@heroicons/react/24/outline';
import { NotificationPanel } from './NotificationPanel';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative isolate overflow-hidden p-2 rounded-xl transition-all duration-300 border ${
          isOpen
            ? 'bg-[var(--primary)] border-[var(--primary)] text-black shadow-[0_0_20px_#76b90066]'
            : unreadCount > 0
              ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]'
              : 'bg-[var(--surface)] border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-strong)]'
        }`}
      >
        <BellIcon className={`w-5 h-5 ${unreadCount > 0 && !isOpen ? 'animate-bounce' : ''}`} />
      </button>

      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className={`absolute -top-1 -right-1 z-10 min-w-[1.1rem] h-[1.1rem] px-0.5 rounded-full flex items-center justify-center text-[9px] font-bold shadow-lg pointer-events-none ${
              isOpen ? 'bg-white text-black' : 'bg-red-500 text-white'
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
