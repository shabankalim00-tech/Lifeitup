import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  variant?: 'gold' | 'emerald';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  className = ''
}) => {
  const imageSizes = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-12 h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 sm:w-20 sm:h-20'
  };

  const textSizes = {
    sm: 'text-xs tracking-[0.24em]',
    md: 'text-sm sm:text-base tracking-[0.28em]',
    lg: 'text-lg sm:text-xl tracking-[0.32em]'
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Official LifeITUp Circular Tree-of-Life Human Wellness Emblem */}
      <img
        src="/logo-emblem.png"
        alt="LifeITUp Official Emblem"
        className={`${imageSizes[size]} object-contain mb-1.5 drop-shadow-[0_2px_8px_rgba(4,120,87,0.18)] transition-transform duration-300 hover:scale-105`}
      />

      {/* Brand Name with sleek emerald dashes */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <span className="w-3 sm:w-5 h-[1.5px] bg-[#059669]"></span>
        <span className={`font-extrabold font-display uppercase text-[#0A2618] ${textSizes[size]}`}>
          LIFEITUP
        </span>
        <span className="w-3 sm:w-5 h-[1.5px] bg-[#059669]"></span>
      </div>

      {/* Tagline */}
      {showTagline && (
        <span className="text-[10px] sm:text-xs font-semibold tracking-wider mt-1 text-[#065F46]">
          Empowering Your Holistic Success
        </span>
      )}
    </div>
  );
};
