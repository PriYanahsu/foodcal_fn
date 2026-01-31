'use client';

import React from 'react';
import { XMarkIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface PermissionDeniedHelpProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PermissionDeniedHelp: React.FC<PermissionDeniedHelpProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = typeof window !== 'undefined' && /Android/.test(navigator.userAgent);

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 z-[110]"
                onClick={onClose}
            />
            
            {/* Help Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[111] max-h-[80vh] overflow-y-auto"
            >
                <div className="glass-card border border-red-500/30 p-5 rounded-2xl shadow-2xl bg-black/95 backdrop-blur-xl">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                <DevicePhoneMobileIcon className="w-6 h-6 text-red-400" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-base text-white">
                                    Enable Notifications
                                </h4>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                            
                            {isIOS ? (
                                <div className="space-y-3 text-sm text-gray-300">
                                    <p className="font-semibold text-white">For iOS Safari:</p>
                                    <ol className="list-decimal list-inside space-y-2 ml-2">
                                        <li>Tap the <strong>Share</strong> button (square with arrow up)</li>
                                        <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                                        <li>Open the app from your home screen</li>
                                        <li>Then tap "Enable Push" again</li>
                                    </ol>
                                    <p className="text-xs text-gray-400 mt-4">
                                        Or go to: <strong>Settings → Safari → Website Settings → Notifications</strong>
                                    </p>
                                </div>
                            ) : isAndroid ? (
                                <div className="space-y-3 text-sm text-gray-300">
                                    <p className="font-semibold text-white">For Android Chrome:</p>
                                    <ol className="list-decimal list-inside space-y-2 ml-2">
                                        <li>Tap the <strong>menu</strong> (3 dots) in the top right</li>
                                        <li>Go to <strong>Settings → Site Settings</strong></li>
                                        <li>Find this website in the list</li>
                                        <li>Tap <strong>Notifications</strong> and set to <strong>Allow</strong></li>
                                        <li>Refresh the page and try again</li>
                                    </ol>
                                </div>
                            ) : (
                                <div className="space-y-3 text-sm text-gray-300">
                                    <p className="font-semibold text-white">For Desktop:</p>
                                    <ol className="list-decimal list-inside space-y-2 ml-2">
                                        <li>Click the <strong>lock icon</strong> in the address bar</li>
                                        <li>Find <strong>Notifications</strong> in the list</li>
                                        <li>Change it to <strong>"Allow"</strong></li>
                                        <li>Refresh the page and try again</li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </>
    );
};
