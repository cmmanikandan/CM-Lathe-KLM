import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Loader2, ShieldCheck } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDisplayTime = 1000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.3, ease: 'easeOut' } }}
          className="fixed inset-0 w-screen h-screen z-[999999] bg-[#111111] text-white flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-[#F97316]/15 rounded-full blur-[100px] pointer-events-none" />

          {/* Center Brand Container */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-5 max-w-sm my-auto">
            
            {/* Location & Certification Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.3 }}
              className="inline-flex items-center gap-2 bg-white/10 text-white font-mono text-[11px] font-extrabold px-4 py-1.5 rounded-full border border-white/15 backdrop-blur-md shadow-md"
            >
              <MapPin size={14} className="text-[#F97316]" />
              <span className="text-[#F97316] uppercase tracking-wider">Kallimandhayam</span>
              <span className="text-gray-400">• Dindigul</span>
            </motion.div>

            {/* High Definition Logo Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative py-2"
            >
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white/5 border border-white/20 p-4 flex items-center justify-center backdrop-blur-xl shadow-2xl relative group">
                <img
                  src="/assets/dark_logo.png"
                  alt="MANIKANDAN LATHE Logo"
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/dark_logo.png';
                  }}
                />
              </div>
            </motion.div>

            {/* Typography Header */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="space-y-1.5"
            >
              <h1 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight leading-none">
                MANIKANDAN <span className="text-[#F97316]">LATHE</span>
              </h1>
              <p className="text-[10px] sm:text-xs font-heading font-bold text-[#F97316] uppercase tracking-widest pt-0.5">
                STRENGTH IN STEEL. TRUST FOR LIFE.
              </p>
            </motion.div>

            {/* Minimalist Spinner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="pt-4 flex items-center justify-center gap-2 text-xs font-mono text-gray-400"
            >
              <Loader2 size={18} className="animate-spin text-[#F97316]" />
              <span>Loading Workshop Portal...</span>
            </motion.div>

          </div>

          {/* Footer Copyright */}
          <div className="absolute bottom-6 left-0 right-0 text-center text-[10px] text-gray-500 font-mono">
            © MANIKANDAN LATHE WORKS • KALLIMANDHAYAM
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
