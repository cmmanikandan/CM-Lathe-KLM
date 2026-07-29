import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Share } from 'lucide-react';

export const InstallPWAPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

  useEffect(() => {
    if (isInStandalone) return; // Already installed — don't show

    // Android / Chrome: capture native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // iOS: show manual guide after 5 seconds
    if (isIOS && !isInStandalone) {
      const timer = setTimeout(() => setIsVisible(true), 5000);
      return () => { clearTimeout(timer); window.removeEventListener('beforeinstallprompt', handler); };
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android/Chrome — native browser install prompt
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    } else if (isIOS) {
      // iOS — show step-by-step guide (no settings navigation needed)
      setShowIOSGuide(true);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-in slide-in-from-bottom duration-300">
      
      {/* iOS Step-by-Step Guide */}
      {showIOSGuide ? (
        <div className="bg-[#111111] text-white p-4 rounded-2xl shadow-2xl border border-[#F97316]/40 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-extrabold text-sm flex items-center gap-1.5">
              📱 Install on iPhone/iPad <Sparkles size={14} className="text-[#F97316]" />
            </h4>
            <button onClick={() => setIsVisible(false)} className="text-gray-400 hover:text-white p-1">
              <X size={16} />
            </button>
          </div>
          <ol className="space-y-2 text-xs text-gray-300">
            <li className="flex items-start gap-2">
              <span className="bg-[#F97316] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>Tap the <strong className="text-white">Share</strong> button <Share size={12} className="inline text-[#F97316]" /> at the bottom of Safari</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-[#F97316] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-[#F97316] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>Tap <strong className="text-white">"Add"</strong> — the app will appear on your home screen!</span>
            </li>
          </ol>
          <button
            onClick={() => setIsVisible(false)}
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-xs py-2 rounded-xl transition-all"
          >
            Got it! ✓
          </button>
        </div>
      ) : (
        /* Default Banner — Android/Chrome */
        <div className="bg-[#111111] text-white p-4 rounded-2xl shadow-2xl border border-[#F97316]/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/assets/logo.png"
              alt="MANIKANDAN LATHE App"
              className="w-11 h-11 object-contain bg-white p-1 rounded-xl shrink-0"
            />
            <div>
              <h4 className="font-heading font-extrabold text-xs flex items-center gap-1 text-white">
                Install App <Sparkles size={12} className="text-[#F97316]" />
              </h4>
              <p className="text-gray-300 text-[11px] mt-0.5 leading-tight">
                Add to home screen for quick access.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstall}
              className="bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-xs px-3 py-2 rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95"
            >
              <Download size={13} /> Install
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
