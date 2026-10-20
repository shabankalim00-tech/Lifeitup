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
    lg: 'text-lg sm:text-xl tracking-[0.36em]'
  };

  const isGold = variant === 'gold';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* 3-Leaf LifeITUp Emblem */}
      <svg
        className={`${iconSizes[size]} text-[#047857] drop-shadow-[0_2px_10px_rgba(4,120,87,0.22)] mb-1.5 transition-transform duration-300 hover:scale-105`}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Center Leaf */}
        <path
          d="M20 4C20 4 25 12 25 18C25 21 22.8 23 20 23C17.2 23 15 21 15 18C15 12 20 4 20 4Z"
          fill="#047857"
        />
        {/* Left Leaf */}
        <path
          d="M17 19C17 19 8.5 17 6.5 22.5C5 26.5 8 28.5 11 28.5C14.5 28.5 17.5 25.5 17.5 22C17.5 21 17.2 20 17 19Z"
          fill="#059669"
          fillOpacity="0.92"
        />
        {/* Right Leaf */}
        <path
          d="M23 19C23 19 31.5 17 33.5 22.5C35 26.5 32 28.5 29 28.5C25.5 28.5 22.5 25.5 22.5 22C22.5 21 22.8 20 23 19Z"
          fill="#10b981"
          fillOpacity="0.92"
        />
        {/* Subtle Base Stem */}
        <path
          d="M20 23V27"
          stroke="#065f46"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Brand Name with sleek gold/emerald dashes */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <span className={`w-3 sm:w-5 h-[1.5px] ${isGold ? 'bg-[#c59b27]' : 'bg-[#059669]'}`}></span>
        <span className={`font-bold font-display uppercase text-[#0c2a1c] ${textSizes[size]}`}>
          LIFEITUP
        </span>
        <span className={`w-3 sm:w-5 h-[1.5px] ${isGold ? 'bg-[#c59b27]' : 'bg-[#059669]'}`}></span>
      </div>

      {/* Tagline */}
      {showTagline && (
        <span className={`text-[10px] sm:text-xs font-semibold tracking-wider mt-1 text-[#065f46]`}>
          Empowering Your Holistic Success
        </span>
      )}
    </div>
  );
};
