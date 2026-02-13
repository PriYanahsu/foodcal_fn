'use client';

import React, { useEffect, useState, useRef } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAND_ASSETS } from '@/lib/brand-config';

// If you have a direct APK file, put the URL here.
// Example: '/app-release.apk' or 'https://example.com/app.apk'
// If empty, it will try to use the PWA install prompt.
const APK_DOWNLOAD_URL = '';

export function InstallAppPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Check if already installed (standalone mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone;
    if (isStandalone) return;

    // 2. Check if mobile (UA)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android/.test(userAgent);

    if (!isMobile) return;

    // 3. Handle PWA Prompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if we haven't decided to show it via iOS check yet (or just force show)
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Handle iOS (no event, just show instructions)
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIOSDevice) {
      setIsIOS(true);
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // Priority 1: Direct APK Download if configured AND on Android
    if (APK_DOWNLOAD_URL && !isIOS) {
      window.location.href = APK_DOWNLOAD_URL;
      return;
    }

    // Priority 2: PWA Prompt
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS instructions are visible in the UI, no action needed on click other than maybe highlighting instructions
    } else {
      // Fallback if no prompt available (rare on Android usage unless blocked)
      alert('To install, tap the browser menu and select "Install App" or "Add to Home Screen".');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none p-4 pb-6 sm:p-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="absolute inset-0 bg-black/60 pointer-events-auto backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.95 }}
            className="bg-[#1a1a1a] border border-white/10 w-full max-w-sm rounded-3xl p-6 pointer-events-auto shadow-2xl relative overflow-hidden"
          >
            {/* Background Splashes */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/10 blur-[50px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />

            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4 pt-2">
              {/* Logo */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-blue-500/20 flex items-center justify-center mb-1 shadow-lg border border-white/5">
                {BRAND_ASSETS.logo ? (
                  <img src={BRAND_ASSETS.logo} alt="Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <span className="text-2xl">📱</span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">Install {BRAND_ASSETS.name}</h3>
                <p className="text-[var(--text-muted)] text-sm mt-1 leading-relaxed">
                  {isIOS
                    ? "Install our app for the best experience. Tap the share button below and select 'Add to Home Screen'."
                    : 'Get the full experience. Install our app for faster access and better performance.'}
                </p>
              </div>

              {isIOS ? (
                <div className="bg-white/5 rounded-xl p-4 w-full flex items-center justify-between gap-3 border border-white/5 mt-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <ShareIcon className="w-5 h-5 text-blue-400" />
                    <span>Tap Share</span>
                  </div>
                  <span className="opacity-30">→</span>
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <div className="w-6 h-6 bg-gray-200 text-black rounded flex items-center justify-center text-lg font-bold leading-none pb-1">
                      +
                    </div>
                    <span>Add to Home Screen</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-[var(--primary)]/20"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>{APK_DOWNLOAD_URL ? 'Download APK' : 'Install App'}</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
