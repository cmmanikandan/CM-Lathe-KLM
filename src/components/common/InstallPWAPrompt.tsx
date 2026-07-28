import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const InstallPWAPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      alert("To install MANIKANDAN LATHE PWA on iOS/Chrome: Tap 'Share' or browser menu and select 'Add to Home Screen'.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 bg-[#111111] text-white p-4 rounded-2xl shadow-2xl border border-[#F97316]/40 flex items-center justify-between gap-4 animate-bounce-short">
      <div className="flex items-center gap-3">
        <img
          src="/assets/logo.png"
          alt="MANIKANDAN LATHE App Icon"
          className="w-12 h-12 object-contain bg-white p-1 rounded-xl"
        />
        <div>
          <h4 className="font-heading font-extrabold text-sm flex items-center gap-1.5 text-white">
            Install App <Sparkles size={14} className="text-[#F97316]" />
          </h4>
          <p className="text-gray-300 text-xs mt-0.5">
            Add MANIKANDAN LATHE to your home screen for quick offline access.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-all active:scale-95"
        >
          <Download size={14} /> Install
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white p-1 rounded-lg"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
