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
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2.5 rounded-xl transition-all duration-300 border ${isOpen
                        ? 'bg-[var(--primary)] border-[var(--primary)] text-black shadow-[0_0_20px_#00ff8866]'
                        : unreadCount > 0
                            ? 'bg-[var(--primary)]/10 border-[var(--primary)]/30 text-[var(--primary)]'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
            >
                <BellIcon className={`w-5 h-5 ${unreadCount > 0 && !isOpen ? 'animate-bounce' : ''}`} />

                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg ${isOpen ? 'bg-white text-black' : 'bg-red-500 text-white'
                                }`}
                        >
                            {unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </div>
    );
};
