import React from 'react';
import { Crown, Sparkles, Leaf } from 'lucide-react';

export type ThemeType = 'royal' | 'soothing' | 'botanical';

interface ThemeSwitcherProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="inline-flex items-center p-1 rounded-full bg-[#051810]/80 border border-[#d4af37]/35 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
      {/* 1. Royal Obsidian & Gold */}
      <button
        onClick={() => onThemeChange('royal')}
        title="Royal Obsidian & Champagne Gold (Ultra-Luxury & Prestigious)"
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          currentTheme === 'royal'
            ? 'bg-gradient-to-r from-[#d4af37]/30 to-[#f3e5ab]/20 text-[#fde68a] shadow-sm border border-[#d4af37]/60'
            : 'text-emerald-300/70 hover:text-amber-200'
        }`}
      >
        <Crown className="w-3.5 h-3.5 text-[#e6ca85]" />
        <span>Royal Gold (Premium)</span>
      </button>

      {/* 2. Soothing Minimal */}
      <button
        onClick={() => onThemeChange('soothing')}
        title="Soothing Minimal (Clean, calm & peaceful)"
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          currentTheme === 'soothing'
            ? 'bg-emerald-500/25 text-lime-300 shadow-sm border border-emerald-400/50'
            : 'text-emerald-300/70 hover:text-emerald-100'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Soothing Minimal</span>
      </button>

      {/* 3. Botanical Zen */}
      <button
        onClick={() => onThemeChange('botanical')}
        title="Botanical Zen (With garden leaves and zen stones)"
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          currentTheme === 'botanical'
            ? 'bg-lime-500/20 text-lime-300 shadow-sm border border-lime-400/50'
            : 'text-emerald-300/70 hover:text-emerald-100'
        }`}
      >
        <Leaf className="w-3.5 h-3.5" />
        <span>Botanical Zen</span>
      </button>
    </div>
  );
};
