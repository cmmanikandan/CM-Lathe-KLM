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
  variant?: 'dark' | 'light';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'navbar',
  customLogoWidth,
  customLogoHeight,
  variant = 'dark',
  showTagline = false,
  className = '',
  onClick
}) => {
  const isLightVariant = variant === 'light';

  // Config mapping based on official spec
  if (size === 'splash') {
    return (
      <div 
        className={`flex flex-col items-center justify-center gap-3 select-none text-center ${className}`}
        onClick={onClick}
      >
        <img
          src="/assets/logo.png"
          alt="MANIKANDAN LATHE Logo"
          style={{ width: '140px', height: '140px' }}
          className="object-contain drop-shadow-xl"
        />
        <div className="flex flex-col items-center">
          <div className="brand-title tracking-tight flex items-center leading-none text-2xl sm:text-3xl font-[800]" style={{ letterSpacing: '-0.03em' }}>
            <span className={isLightVariant ? 'text-white' : 'text-[#111111]'}>MANIKANDAN</span>
            <span className="text-[#F97316] ml-2">LATHE</span>
          </div>
          {showTagline && (
            <span className="font-heading font-bold text-xs tracking-widest text-[#F97316] mt-1.5 uppercase">
              STRENGTH IN STEEL. TRUST FOR LIFE.
            </span>
          )}
        </div>
      </div>
    );
  }

  if (size === 'login') {
    return (
      <div 
        className={`flex flex-col items-center justify-center gap-3 select-none text-center ${className}`}
        onClick={onClick}
      >
        <img
          src="/assets/logo.png"
          alt="MANIKANDAN LATHE Logo"
          style={{ width: '80px', height: '80px' }}
          className="object-contain drop-shadow-lg"
        />
        <div className="brand-title tracking-tight flex items-center leading-none text-xl sm:text-2xl font-[800]" style={{ letterSpacing: '-0.03em' }}>
          <span className={isLightVariant ? 'text-white' : 'text-[#111111]'}>MANIKANDAN</span>
          <span className="text-[#F97316] ml-2">LATHE</span>
        </div>
      </div>
    );
  }

  if (size === 'loading') {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 select-none ${className}`}>
        <img
          src="/assets/logo.png"
          alt="MANIKANDAN LATHE Logo"
          style={{ width: '64px', height: '64px' }}
          className="object-contain animate-pulse"
        />
        <div className="brand-title tracking-tight flex items-center leading-none text-lg font-[800]" style={{ letterSpacing: '-0.03em' }}>
          <span className={isLightVariant ? 'text-white' : 'text-[#111111]'}>MANIKANDAN</span>
          <span className="text-[#F97316] ml-1.5">LATHE</span>
        </div>
      </div>
    );
  }

  if (size === 'watermark') {
    return (
      <div className={`flex flex-col items-center justify-center select-none opacity-10 pointer-events-none ${className}`}>
        <img
          src="/assets/logo.png"
          alt="MANIKANDAN LATHE Watermark"
          style={{ width: '140px', height: '140px' }}
          className="object-contain"
        />
        <div className="brand-title tracking-tight flex items-center leading-none text-2xl font-[800] mt-2" style={{ letterSpacing: '-0.03em' }}>
          <span className="text-[#111111]">MANIKANDAN</span>
          <span className="text-[#F97316] ml-2">LATHE</span>
        </div>
      </div>
    );
  }

  // Exact Dimension Specs per spec rules:
  // Desktop Navbar: Logo 42x42px, Gap 12px, Text 26px
  // Mobile Navbar: Logo 36x36px, Gap 10px, Text 20px
  // Sidebar: Logo 34x34px, Gap 10px, Text 18px
  // Footer: Logo 34x34px, Gap 10px, Text 18px
  // Invoice: Logo 42x42px, Gap 12px, Text 22px
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
      className={`inline-flex items-center ${gapClass} cursor-pointer group select-none shrink-0 ${className}`}
      onClick={onClick}
    >
      <img
        src="/assets/logo.png"
        alt="MANIKANDAN LATHE Logo"
        style={{ width: `${logoDim.w}px`, height: `${logoDim.h}px` }}
        className="object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md shrink-0"
      />
      
      <div className="flex flex-col justify-center">
        <div 
          className={`brand-title leading-none flex items-center font-[800] uppercase ${textStyleClass}`}
          style={{ letterSpacing: '-0.03em', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span className={isLightVariant ? 'text-white' : 'text-[#111111]'}>
            MANIKANDAN
          </span>
          <span className="text-[#F97316] ml-1.5 font-black">
            LATHE
          </span>
        </div>

        {showTagline && (
          <span className="font-heading font-extrabold tracking-wider text-[#F97316] text-[9px] sm:text-[10px] mt-0.5 uppercase">
            STRENGTH IN STEEL. TRUST FOR LIFE.
          </span>
        )}
      </div>
    </div>
  );
};
