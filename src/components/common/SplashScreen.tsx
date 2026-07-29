import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, ShieldCheck, Cpu } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDisplayTime = 1400
}) => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  // Trigger splash screen on route change to /login or /admin/login or initial load
  useEffect(() => {
    if (location.pathname === '/login' || location.pathname === '/admin/login' || location.pathname === '/') {
      setIsVisible(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, minDisplayTime);

    return () => {
      clearTimeout(timer);
    };
  }, [isVisible, minDisplayTime, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[9999] bg-[#111111] text-white flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden font-sans"
        >
          {/* Ambient Background Gradients */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#F97316]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F97316]/15 rounded-full blur-3xl pointer-events-none" />
          
          {/* Top Location Badge — Prominently displaying Kallimandhayam */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex items-center gap-1.5 bg-white/10 border border-[#F97316]/40 text-white font-mono text-xs font-bold px-4 py-1.5 rounded-full shadow-lg mt-2 backdrop-blur-md"
          >
            <MapPin size={14} className="text-[#F97316] animate-bounce" />
            <span className="text-[#F97316] uppercase tracking-wider">Kallimandhayam</span>
            <span className="text-gray-400 font-normal">• Dindigul District</span>
          </motion.div>

          {/* Center Brand Logo & Info */}
          <div className="flex flex-col items-center text-center space-y-5 max-w-sm my-auto">
            {/* Logo Image */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative group"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-tr from-[#1A1A1A] via-[#222222] to-[#111111] border-2 border-[#F97316]/50 p-3 flex items-center justify-center shadow-[0_0_60px_rgba(249,115,22,0.35)] overflow-hidden">
                <img
                  src="/logo.png"
                  alt="MANIKANDAN LATHE Logo"
                  className="w-full h-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    // Fallback to text logo if image load fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Decorative Corner Badge */}
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#F97316] text-white text-[10px] font-black flex items-center justify-center shadow-md">
                ★
              </span>
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="space-y-1"
            >
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight leading-none">
                MANIKANDAN <span className="text-[#F97316]">LATHE</span>
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-400">
                Heavy Machining & Gate Fabrication Workshop
              </p>
            </motion.div>

            {/* Feature Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 flex-wrap pt-1"
            >
              <span className="bg-white/5 border border-white/10 text-gray-300 text-[10px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1">
                <Cpu size={12} className="text-[#F97316]" /> PWA App
              </span>
              <span className="bg-white/5 border border-white/10 text-gray-300 text-[10px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck size={12} className="text-green-500" /> Realtime Orders
              </span>
            </motion.div>
          </div>

          {/* Bottom Clean Loading Text (Progress bar removed) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="pb-4 text-center space-y-1.5"
          >
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#F97316]">
              <Loader2 size={16} className="animate-spin text-[#F97316]" />
              <span className="tracking-widest uppercase animate-pulse">Loading...</span>
            </div>
            <p className="text-[10px] text-gray-500 font-mono">
              Chellamuthu K • 25+ Yrs Industry Experience
            </p>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
