'use client';

import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { BRAND_ASSETS } from '@/lib/brand-config';

export const PushTest: React.FC = () => {
    const { sendTestPush, hasPushSubscription, permission, requestPermission } = useNotifications();
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleTest = async () => {
        setIsLoading(true);
        try {
            await sendTestPush();
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) return null;

    if (process.env.NODE_ENV === 'production' && !window.location.search.includes('debug=true')) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 p-4 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <img src={BRAND_ASSETS.logo} alt="" className="w-5 h-5 object-contain" />
                <span>Push Test Tool</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full border border-yellow-500/20 uppercase tracking-wider">Debug</span>
            </h3>

            <div className="space-y-3">
                <div className="flex justify-between text-xs">
                    <span className="text-white/60">Permission:</span>
                    <span className={`font-mono ${permission === 'granted' ? 'text-green-400' : 'text-red-400'}`}>
                        {permission}
                    </span>
                </div>

                <div className="flex justify-between text-xs">
                    <span className="text-white/60">Subscribed:</span>
                    <span className={`font-mono ${hasPushSubscription ? 'text-green-400' : 'text-red-400'}`}>
                        {hasPushSubscription ? 'Yes' : 'No'}
                    </span>
                </div>

                <div className="flex justify-between text-xs">
                    <span className="text-white/60">VAPID Key:</span>
                    <span className={`font-mono ${process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'text-green-400' : 'text-red-400'}`}>
                        {process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? 'Detected' : 'Missing'}
                    </span>
                </div>

                {!hasPushSubscription ? (
                    <button
                        onClick={() => requestPermission()}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-all active:scale-95 font-medium shadow-lg shadow-blue-900/20"
                    >
                        Enable Notifications
                    </button>
                ) : (
                    <button
                        disabled={isLoading}
                        onClick={handleTest}
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg transition-all active:scale-95 font-medium shadow-lg shadow-indigo-900/20"
                    >
                        {isLoading ? 'Sending...' : 'Send Test Push'}
                    </button>
                )}

                <p className="text-[10px] text-white/40 italic">
                    <strong>Testing background push:</strong><br />
                    1. Click "Send Test Push"<br />
                    2. Immediately close the browser/tab<br />
                    3. Wait on your device's home screen
                </p>
            </div>
        </div>
    );
};
