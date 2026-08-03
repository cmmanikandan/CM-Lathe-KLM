import React from 'react';

export type BrandLogoSize = 
  | 'navbar' 
  | 'mobile' 
  | 'sidebar' 
  | 'splash' 
  | 'login' 
  | 'footer' 
  | 'invoice' 
  | 'watermark'
  | 'loading'
  | 'custom';

interface BrandLogoProps {
  size?: BrandLogoSize;
  customLogoWidth?: number;
  customLogoHeight?: number;
  variant?: 'dark' | 'light' | 'dark-theme' | 'light-theme';
  theme?: 'dark' | 'light';
  showTagline?: boolean;
  hideText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'navbar',
  customLogoWidth,
  customLogoHeight,
  variant,
  theme,
  showTagline = false,
  hideText = false,
  className = '',
  onClick
}) => {
  // Determine if dark theme is active
  const isDark = theme 
    ? theme === 'dark' 
    : (variant === 'light' || variant === 'dark-theme');

  const logoSrc = isDark ? '/assets/dark_logo.png' : '/assets/light_logo.png';
  const fallbackSrc = isDark ? '/dark_logo.png' : '/light_logo.png';

  // Config mapping based on official spec
  if (size === 'splash') {
    return (
      <div 
        className={`flex flex-col items-center justify-center gap-2 sm:gap-3 select-none text-center ${className}`}
        onClick={onClick}
      >
        <img
          src={logoSrc}
          alt="MANIKANDAN LATHE Logo"
          className="w-24 h-24 sm:w-36 sm:h-36 object-contain drop-shadow-xl shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackSrc;
          }}
        />
        {!hideText && (
          <div className="flex flex-col items-center">
            <div className="brand-title tracking-tight flex items-center leading-none text-xl sm:text-3xl font-[800]" style={{ letterSpacing: '-0.03em' }}>
              <span className={isDark ? 'text-white' : 'text-[#111111]'}>MANIKANDAN</span>
              <span className="text-[#F97316] ml-1.5 sm:ml-2">LATHE</span>
            </div>
            {showTagline && (
              <span className="font-heading font-bold text-[9px] sm:text-xs tracking-widest text-[#F97316] mt-1 sm:mt-1.5 uppercase">
                STRENGTH IN STEEL. TRUST FOR LIFE.
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  if (size === 'login') {
    return (
      <div 
        className={`flex flex-col items-center justify-center gap-2 sm:gap-3 select-none text-center ${className}`}
        onClick={onClick}
      >
        <img
          src={logoSrc}
          alt="MANIKANDAN LATHE Logo"
          className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-lg shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackSrc;
          }}
        />
        {!hideText && (
          <div className="brand-title tracking-tight flex items-center leading-none text-lg sm:text-2xl font-[800]" style={{ letterSpacing: '-0.03em' }}>
            <span className={isDark ? 'text-white' : 'text-[#111111]'}>MANIKANDAN</span>
            <span className="text-[#F97316] ml-1.5 sm:ml-2">LATHE</span>
          </div>
        )}
      </div>
    );
  }

  if (size === 'loading') {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 sm:gap-3 select-none ${className}`}>
        <img
          src={logoSrc}
          alt="MANIKANDAN LATHE Logo"
          className="w-12 h-12 sm:w-16 sm:h-16 object-contain animate-pulse shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackSrc;
          }}
        />
        {!hideText && (
          <div className="brand-title tracking-tight flex items-center leading-none text-base sm:text-lg font-[800]" style={{ letterSpacing: '-0.03em' }}>
            <span className={isDark ? 'text-white' : 'text-[#111111]'}>MANIKANDAN</span>
            <span className="text-[#F97316] ml-1 sm:ml-1.5">LATHE</span>
          </div>
        )}
      </div>
    );
  }

  if (size === 'watermark') {
    return (
      <div className={`flex flex-col items-center justify-center select-none opacity-10 pointer-events-none ${className}`}>
        <img
          src={logoSrc}
          alt="MANIKANDAN LATHE Watermark"
          style={{ width: '140px', height: '140px' }}
          className="object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackSrc;
          }}
        />
        {!hideText && (
          <div className="brand-title tracking-tight flex items-center leading-none text-2xl font-[800] mt-2" style={{ letterSpacing: '-0.03em' }}>
            <span className={isDark ? 'text-white' : 'text-[#111111]'}>MANIKANDAN</span>
            <span className="text-[#F97316] ml-2">LATHE</span>
          </div>
        )}
      </div>
    );
  }

  let logoDim = { w: 42, h: 42 };
  let gapClass = 'gap-[12px]';
  let textStyleClass = 'text-[20px] sm:text-[26px]';

  switch (size) {
    case 'mobile':
      logoDim = { w: 36, h: 36 };
      gapClass = 'gap-[10px]';
      textStyleClass = 'text-[20px]';
      break;
    case 'sidebar':
      logoDim = { w: 40, h: 40 };
      gapClass = 'gap-[8px]';
      textStyleClass = 'text-[15px] sm:text-[17px]';
      break;
    case 'footer':
      logoDim = { w: 34, h: 34 };
      gapClass = 'gap-[10px]';
      textStyleClass = 'text-[18px]';
      break;
    case 'invoice':
      logoDim = { w: 42, h: 42 };
      gapClass = 'gap-[12px]';
      textStyleClass = 'text-[22px]';
      break;
    case 'custom':
      if (customLogoWidth && customLogoHeight) {
        logoDim = { w: customLogoWidth, h: customLogoHeight };
      }
      break;
    case 'navbar':
    default:
      logoDim = { w: 42, h: 42 };
      gapClass = 'gap-[10px] sm:gap-[12px]';
      textStyleClass = 'text-[18px] sm:text-[24px] lg:text-[26px]';
      break;
  }

  return (
    <div 
      className={`inline-flex items-center ${gapClass} cursor-pointer group select-none shrink-0 min-w-0 ${className}`}
      onClick={onClick}
    >
      <img
        src={logoSrc}
        alt="MANIKANDAN LATHE Logo"
        style={{ width: `${logoDim.w}px`, height: `${logoDim.h}px` }}
        className="object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md shrink-0"
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallbackSrc;
        }}
      />
      
      {!hideText && (
        <div className="flex flex-col justify-center min-w-0 overflow-hidden">
          <div 
            className={`brand-title leading-none flex items-center font-[800] uppercase truncate ${textStyleClass}`}
            style={{ letterSpacing: '-0.03em', fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span className={`truncate ${isDark ? 'text-white' : 'text-[#111111]'}`}>
              MANIKANDAN
            </span>
            <span className="text-[#F97316] ml-1 font-black shrink-0">
              LATHE
            </span>
          </div>

          {showTagline && (
            <span className="font-heading font-extrabold tracking-wider text-[#F97316] text-[8px] sm:text-[8.5px] mt-0.5 uppercase truncate">
              STRENGTH IN STEEL. TRUST FOR LIFE.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
