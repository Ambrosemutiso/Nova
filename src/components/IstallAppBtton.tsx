'use client';

import { useEffect, useState } from 'react';

/* Type for the PWA install prompt */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export default function InstallAppButton() {

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [showButton, setShowButton] = useState(false);

  useEffect(() => {

    const handler = (e: Event) => {

      const event = e as BeforeInstallPromptEvent;

      event.preventDefault();

      setDeferredPrompt(event);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () =>
      window.removeEventListener('beforeinstallprompt', handler);

  }, []);

  const installApp = async () => {

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User installed the app');
    }

    setDeferredPrompt(null);
    setShowButton(false);
  };

  if (!showButton) return null;

  return (

    <button
      onClick={installApp}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '12px 18px',
        background: '#0f172a',
        color: '#fff',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      Install NovaXmax
    </button>

  );
}