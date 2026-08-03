import React, { useState, useEffect, useRef } from 'react';
import { StatusStory } from '../../types';
import { X, Eye, MessageCircle, ChevronLeft, ChevronRight, Heart, Share2, Pause, Play } from 'lucide-react';
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

  const isPushedRef = useRef(false);

  // 1. Keyboard ESC & Browser Back button listeners (Mobile Hardware Back support)
  useEffect(() => {
    if (!isOpen) {
      isPushedRef.current = false;
      return;
    }

    if (!isPushedRef.current) {
      window.history.pushState({ modalType: 'storyViewer' }, '');
      isPushedRef.current = true;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
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
          handleDismiss();
        }
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
  }, [isOpen, currentIndex, stories.length, onClose]);

  const handleDismiss = () => {
    if (isPushedRef.current) {
      isPushedRef.current = false;
      window.history.back();
    } else {
      onClose();
    }
  };

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



  const getRemainingTimeText = (createdAt?: string) => {
    if (!createdAt) return '24h Live Story';
    const createdTime = new Date(createdAt).getTime();
    if (isNaN(createdTime)) return '24h Live Story';
    const expiryTime = createdTime + 24 * 60 * 60 * 1000;
    const remainingMs = expiryTime - Date.now();
    if (remainingMs <= 0) return 'Expiring soon';
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none animate-fade-in p-2 sm:p-4">
      
      {/* Story Window Frame */}
      <div 
        className="relative w-full max-w-md h-[92vh] max-h-[840px] bg-[#0A0A0A] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-gray-800"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Background Media Container (Properly Bounded & Centered) */}
        <div className="absolute inset-0 z-0 bg-[#050505] flex items-center justify-center p-4">
          <img
            src={currentStory.mediaUrl}
            alt={currentStory.title}
            className="max-w-full max-h-[65vh] object-contain rounded-2xl shadow-2xl transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />
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
                <p className="text-amber-400 text-[10px] font-mono font-bold mt-0.5 flex items-center gap-1">
                  ⏱️ {getRemainingTimeText(currentStory.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">

              {/* CLOSE BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDismiss();
                }}
                title="Close Story Viewer"
                className="w-10 h-10 rounded-full bg-black/60 hover:bg-[#F97316] text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer z-50 border border-white/20 active:scale-90"
              >
                <X size={20} />
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

        {/* Bottom Title & WhatsApp Action Row */}
        <div className="relative z-30 p-5 space-y-3">
          <div className="space-y-1">
            <h3 className="text-white font-heading font-black text-lg sm:text-xl leading-tight">
              {currentStory.title}
            </h3>
            {currentStory.subtitle && (
              <p className="text-gray-300 text-xs">
                {currentStory.subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/20">
            <div className="flex items-center gap-2 text-white">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLiked(!liked);
                }}
                className={`p-2 rounded-full transition-transform active:scale-125 ${
                  liked ? 'text-red-500 bg-white/20' : 'text-white/80 hover:text-white'
                }`}
              >
                <Heart size={18} className={liked ? 'fill-red-500' : ''} />
              </button>
              <span className="text-xs font-mono text-gray-300">👁️ {currentStory.seenCount + (liked ? 1 : 0)} views</span>
            </div>

            <button
              onClick={handleWhatsAppReply}
              className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-heading font-black px-3.5 py-2 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <MessageCircle size={15} /> Reply to Chellamuthu K
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
