'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

const DISMISS_KEY = 'novaxmax_install_dismissed_until';
const DISMISS_DAYS = 7;
const SHOW_DELAY_MS = 1500;

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showButton, setShowButton] = useState(false);
  const reduceMotion = useReducedMotion();

  const isDismissedForNow = () => {
    if (typeof window === 'undefined') return false;
    const until = localStorage.getItem(DISMISS_KEY);
    return until ? Date.now() < Number(until) : false;
  };

  const isAlreadyInstalled = () =>
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true);

  useEffect(() => {
    const handler = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      event.preventDefault();

      if (isAlreadyInstalled() || isDismissedForNow()) return;

      setDeferredPrompt(event);
      // small delay so the banner arrives after the first impression,
      // not on top of it
      const t = setTimeout(() => setShowButton(true), SHOW_DELAY_MS);
      return () => clearTimeout(t);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      // don't ask again — it's installed
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000 * 100));
    }

    setDeferredPrompt(null);
    setShowButton(false);
  };

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000));
    setShowButton(false);
  }, []);

  return (
    <AnimatePresence>
      {showButton && (
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: 96, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-[70] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-0 sm:px-4 sm:pb-4"
          role="dialog"
          aria-label="Install NovaXmax app"
        >
          <div className="mx-auto max-w-3xl">
            <div className="relative flex items-center gap-3 overflow-hidden rounded-2xl
              bg-gradient-to-r from-neutral-900 to-neutral-800 py-2.5 pl-3 pr-2 shadow-2xl
              ring-1 ring-white/10 sm:py-3 sm:pl-4 sm:pr-3">

              {/* ambient accent glow — gives it the "commercial banner" polish */}
              <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-orange-500/30 blur-2xl" />

              {/* app mark */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl
                bg-gradient-to-br from-orange-500 to-amber-400 shadow-inner sm:h-12 sm:w-12">
                <span className="text-lg font-black text-white">N</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-white sm:text-sm">
                  Get the NovaXmax App
                </p>
                <p className="truncate text-[11px] text-white/60 sm:text-xs">
                  Faster checkout &amp; app-only deals
                </p>
              </div>

              <button
                onClick={installApp}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-orange-500 px-3.5 py-2
                  text-xs font-bold text-white shadow-md transition hover:bg-orange-600
                  active:scale-95 sm:px-4 sm:text-sm"
              >
                <Download className="h-3.5 w-3.5" />
                Install
              </button>

              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="shrink-0 rounded-full p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}