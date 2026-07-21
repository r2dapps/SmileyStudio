import React, { useEffect, useState } from 'react';
import { Download, CheckCircle, Smartphone } from 'lucide-react';

interface PWAInstallerProps {
  inline?: boolean; // When true: render as a settings card section, no dismiss
}

export const PWAInstaller: React.FC<PWAInstallerProps> = ({ inline = false }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  // Inline mode (used in Settings page): always visible, no dismiss
  if (inline) {
    if (isInstalled) {
      return (
        <div className="flex items-center space-x-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <h3 className="text-xs font-bold text-white">Smiley Studio is Installed</h3>
            <p className="text-[10px] text-slate-400">Running as full-screen offline PWA on your home screen</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-2xl border border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white">Install to Home Screen</h3>
            <p className="text-[10px] text-slate-400">Add Smiley Studio to phone for full offline studio access</p>
          </div>
        </div>

        {deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 active:scale-95 transition shadow-lg shadow-pink-600/30 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        ) : (
          <span className="text-[10px] text-slate-500 italic shrink-0">Open in mobile browser to install</span>
        )}
      </div>
    );
  }

  // Floating banner mode (not used anymore - kept for compat)
  if (isInstalled || isDismissed) return null;

  return (
    <div className="mb-4 p-3 glassmorphism rounded-2xl border border-pink-500/40 flex items-center justify-between shadow-xl animate-fade-in">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-white">Install Smiley Studio App</h3>
          <p className="text-[10px] text-slate-400">Add to Phone Home Screen for Full Offline Studio</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {deferredPrompt ? (
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1 active:scale-95 transition shadow-lg shadow-pink-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        ) : (
          <button
            onClick={() => setIsDismissed(true)}
            className="text-[11px] text-slate-400 hover:text-white px-2 py-1"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};
