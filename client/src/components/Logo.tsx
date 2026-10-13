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
  variant = 'gold',
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-11 h-11'
  };

  const textSizes = {
    sm: 'text-xs tracking-[0.28em]',
    md: 'text-sm sm:text-base tracking-[0.32em]',
    lg: 'text-lg sm:text-xl tracking-[0.38em]'
  };

  const isGold = variant === 'gold';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 3-Leaf LifeITUp Emblem */}
      <svg
        className={`${iconSizes[size]} ${
          isGold 
            ? 'text-[#e6ca85] drop-shadow-[0_0_14px_rgba(212,175,55,0.4)]' 
            : 'text-lime-300 drop-shadow-[0_0_12px_rgba(163,230,53,0.35)]'
        } mb-1.5 transition-colors duration-300`}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Center Leaf */}
        <path
          d="M20 4C20 4 25 12 25 18C25 21 22.8 23 20 23C17.2 23 15 21 15 18C15 12 20 4 20 4Z"
          fill="currentColor"
        />
        {/* Left Leaf */}
        <path
          d="M17 19C17 19 8.5 17 6.5 22.5C5 26.5 8 28.5 11 28.5C14.5 28.5 17.5 25.5 17.5 22C17.5 21 17.2 20 17 19Z"
          fill="currentColor"
          fillOpacity="0.88"
        />
        {/* Right Leaf */}
        <path
          d="M23 19C23 19 31.5 17 33.5 22.5C35 26.5 32 28.5 29 28.5C25.5 28.5 22.5 25.5 22.5 22C22.5 21 22.8 20 23 19Z"
          fill="currentColor"
          fillOpacity="0.88"
        />
        {/* Subtle Base Stem */}
        <path
          d="M20 23V27"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Brand Name with sleek dashes */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <span className={`w-3 sm:w-5 h-[1px] ${isGold ? 'bg-[#d4af37]/50' : 'bg-emerald-400/40'}`}></span>
        <span className={`font-semibold font-display uppercase ${
          isGold ? 'text-[#fbf6e2]' : 'text-emerald-100'
        } ${textSizes[size]}`}>
          LIFEITUP
        </span>
        <span className={`w-3 sm:w-5 h-[1px] ${isGold ? 'bg-[#d4af37]/50' : 'bg-emerald-400/40'}`}></span>
      </div>

      {/* Tagline */}
      {showTagline && (
        <span className={`text-[10px] sm:text-xs font-normal tracking-wider mt-1 ${
          isGold ? 'text-[#dfc282]/85' : 'text-emerald-300/80'
        }`}>
          Empowering Your Holistic Success
        </span>
      )}
    </div>
  );
};
