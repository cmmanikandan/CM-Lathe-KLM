import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

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
          exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeInOut' } }}
          className="fixed inset-0 w-screen h-screen min-h-screen z-[999999] bg-white text-[#111111] flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans"
        >
          {/* Vibrant Warm Soft Glow Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-100/60 rounded-full blur-3xl pointer-events-none" />

          {/* Center Content Container */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm my-auto">
            
            {/* Top Location Badge */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              className="inline-flex items-center gap-2 bg-slate-900 text-white font-mono text-xs font-black px-5 py-2 rounded-full shadow-xl border border-orange-500/50"
            >
              <MapPin size={16} className="text-[#F97316] animate-bounce" />
              <span className="text-[#F97316] uppercase tracking-wider font-extrabold">Kallimandhayam</span>
              <span className="text-slate-300 font-normal">• Dindigul District</span>
            </motion.div>

            {/* Solid White Logo Card with Bold Orange Border */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              className="relative"
            >
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-white border-4 border-[#F97316] p-4 flex items-center justify-center shadow-2xl shadow-orange-500/30 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="MANIKANDAN LATHE Logo"
                  className="w-full h-full object-contain filter drop-shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/logo.png';
                  }}
                />
              </div>
            </motion.div>

            {/* Ultra High Contrast Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="space-y-2.5"
            >
              <h1 className="font-heading font-black text-3xl sm:text-5xl text-black tracking-tight leading-none">
                MANIKANDAN <span className="text-[#F97316]">LATHE</span>
              </h1>
              <p className="text-xs sm:text-sm font-mono font-extrabold uppercase tracking-widest bg-slate-900 text-white px-5 py-2 rounded-full shadow-lg border border-slate-800 inline-block">
                LATHE MACHINES & STEEL FABRICATION
              </p>
            </motion.div>

            {/* Ultra Bold Spinner Icon Only */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="pt-2"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white border-4 border-[#F97316] shadow-2xl shadow-orange-500/20">
                <Loader2 size={26} className="animate-spin text-[#F97316] stroke-[3]" />
              </div>
            </motion.div>

          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
