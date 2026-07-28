import React, { useState, useEffect, useRef } from 'react';
import { StatusStory } from '../../types';
import { X, Eye, MessageCircle, ChevronLeft, ChevronRight, Heart, Download, Share2, Pause, Play } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface StatusStoryViewerProps {
  stories: StatusStory[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  onStorySeen?: (id: string) => void;
}

export const StatusStoryViewer: React.FC<StatusStoryViewerProps> = ({
  stories,
  initialIndex = 0,
  isOpen,
  onClose,
  onStorySeen
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setProgress(0);
    setLiked(false);
  }, [initialIndex, isOpen]);

  const currentStory = stories[currentIndex];

  // 1. Keyboard ESC & Browser Back button listeners
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          setCurrentIndex((c) => c - 1);
          setProgress(0);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex((c) => c + 1);
          setProgress(0);
        } else {
          onClose();
        }
      }
    };

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, currentIndex, stories.length, onClose]);

  // 2. Story Progress Timer
  useEffect(() => {
    if (!isOpen || !currentStory || isPaused) return;

    if (onStorySeen) {
      onStorySeen(currentStory.id);
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex((c) => c + 1);
            setLiked(false);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentIndex, isOpen, stories.length, currentStory?.id, isPaused, onClose, onStorySeen]);

  if (!isOpen || !currentStory) return null;

  // Touch Swipe Down to Close logic
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartY.current !== null) {
      const touchEndY = e.changedTouches[0].clientY;
      const swipeDistance = touchEndY - touchStartY.current;
      if (swipeDistance > 80) {
        onClose();
      }
    }
    touchStartY.current = null;
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
      setLiked(false);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
      setLiked(false);
    } else {
      onClose();
    }
  };

  const handleWhatsAppReply = () => {
    const text = `Hi MANIKANDAN LATHE (Chellamuthu K)! I saw your workshop status story: "${currentStory.title}". I would like more details!`;
    window.open(`https://wa.me/919659286268?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Download Status Media Feature
  const handleDownloadStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = currentStory.mediaUrl;
    link.download = `MANIKANDAN_LATHE_Status_${currentStory.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none animate-fade-in">
      
      {/* Story Window Frame */}
      <div 
        className="relative w-full max-w-md h-[90vh] max-h-[840px] bg-[#111111] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-gray-800"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Background Media */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentStory.mediaUrl}
            alt={currentStory.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90" />
        </div>

        {/* Top Progress & Info Header */}
        <div className="relative z-40 p-4 space-y-3">
          
          {/* Progress Bar Segmented */}
          <div className="flex gap-1.5 w-full">
            {stories.map((s, idx) => (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F97316] transition-all duration-100 ease-linear"
                  style={{
                    width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <BrandLogo size="mobile" variant="light" />
              <div>
                <span className="inline-block bg-[#F97316] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {currentStory.tag}
                </span>
                <p className="text-white/70 text-[10px] font-mono mt-0.5">
                  {isPaused ? '⏸ Paused' : '24h Live Workshop Status'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* DOWNLOAD STATUS BUTTON */}
              <button
                onClick={handleDownloadStatus}
                title="Download Status Media"
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-90"
              >
                <Download size={18} />
              </button>

              {/* CRITICAL ACCESSIBLE CLOSE (X) BUTTON (48x48px Minimum Touch Area) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                title="Close Story Viewer"
                className="w-12 h-12 rounded-full bg-black/60 hover:bg-[#F97316] text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer z-50 border border-white/20 active:scale-90"
              >
                <X size={22} />
              </button>
            </div>
          </div>

        </div>

        {/* Tap Navigation Touch Zones */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-20" onClick={handlePrev} />
        <div className="absolute inset-y-0 right-0 w-1/3 z-20" onClick={handleNext} />

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 text-white/80 hover:text-white bg-black/50 p-2.5 rounded-full backdrop-blur-md transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {currentIndex < stories.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 text-white/80 hover:text-white bg-black/50 p-2.5 rounded-full backdrop-blur-md transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Bottom Title & WhatsApp Reaction Action Row */}
        <div className="relative z-30 p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-white font-heading font-black text-xl leading-tight">
              {currentStory.title}
            </h3>
            {currentStory.subtitle && (
              <p className="text-gray-200 text-xs">
                {currentStory.subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/20">
            <div className="flex items-center gap-3 text-white">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLiked(!liked);
                }}
                className={`p-2 rounded-full transition-transform active:scale-125 ${
                  liked ? 'text-red-500 bg-white/20' : 'text-white/80 hover:text-white'
                }`}
              >
                <Heart size={20} className={liked ? 'fill-red-500' : ''} />
              </button>
              <span className="text-xs font-mono text-gray-300">{currentStory.seenCount + (liked ? 1 : 0)} views</span>
            </div>

            <button
              onClick={handleWhatsAppReply}
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-heading font-black px-4 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <MessageCircle size={16} /> Reply to Chellamuthu K
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
