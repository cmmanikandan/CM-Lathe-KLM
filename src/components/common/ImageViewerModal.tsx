import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Maximize2
} from 'lucide-react';

interface ImageViewerModalProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  title
  const isPushedRef = React.useRef(false);

  React.useEffect(() => {
    if (!isOpen) {
      isPushedRef.current = false;
      return;
    }

    if (!isPushedRef.current) {
      window.history.pushState({ modalType: 'imageViewer' }, '');
      isPushedRef.current = true;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    const handlePopState = () => {
      isPushedRef.current = false;
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  const handleDismiss = () => {
    if (isPushedRef.current) {
      isPushedRef.current = false;
      window.history.back();
    } else {
      onClose();
    }
  };

  if (!isOpen || images.length === 0) return null;

  const handleNext = () => {
    setZoomScale(1);
    setRotation(0);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setZoomScale(1);
    setRotation(0);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.5, 3.5));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.5, 0.8));
  };

  const handleDoubleTap = () => {
    if (zoomScale > 1) {
      setZoomScale(1);
    } else {
      setZoomScale(2);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoomScale(1);
    setRotation(0);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/95 text-white flex flex-col justify-between overflow-hidden select-none backdrop-blur-md">
        
        {/* Top Control Bar */}
        <div className="p-4 flex items-center justify-between border-b border-white/10 bg-black/50 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={handleDismiss}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white"
              title="Close Viewer"
            >
              <X size={20} />
            </button>

            <div>
              {title && <h4 className="font-heading font-black text-sm text-white line-clamp-1">{title}</h4>}
              <span className="text-xs font-mono font-bold text-[#F97316]">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>

            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>

            <button
              onClick={handleRotate}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
              title="Rotate Image"
            >
              <RotateCw size={18} />
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
              title="Reset View"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>

        {/* Main Image Stage */}
        <div 
          className="flex-1 relative flex items-center justify-center p-4 cursor-grab active:cursor-grabbing overflow-hidden"
          onDoubleClick={handleDoubleTap}
        >
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt="Expanded View"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: zoomScale, rotate: rotation }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            draggable={false}
          />

          {/* Left Arrow Button */}
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#F97316] text-white border border-white/20 transition-all z-20 shadow-lg"
              aria-label="Previous Image"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Right Arrow Button */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-[#F97316] text-white border border-white/20 transition-all z-20 shadow-lg"
              aria-label="Next Image"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {/* Thumbnail Bar */}
        {images.length > 1 && (
          <div className="p-3 bg-black/60 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar z-20">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setZoomScale(1);
                  setRotation(0);
                  setCurrentIndex(idx);
                }}
                className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                  currentIndex === idx ? 'border-[#F97316] scale-105' : 'border-white/20 opacity-60'
                }`}
              >
                <img src={img} alt="Thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

      </div>
    </AnimatePresence>
  );
};
