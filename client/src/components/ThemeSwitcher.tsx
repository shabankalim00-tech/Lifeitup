import React from 'react';
import { Leaf, Sparkles, Flower2 } from 'lucide-react';

export type ThemeType = 'botanical' | 'royal' | 'soothing';

interface ThemeSwitcherProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="inline-flex items-center p-1 rounded-full bg-[#03150e]/85 border border-emerald-700/40 backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.6)]">
      {/* 1. Botanical Zen (Default & Official Asset) */}
      <button
        onClick={() => onThemeChange('botanical')}
        title="Botanical Zen (With natural leaves & stacked meditation river stones)"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          currentTheme === 'botanical'
            ? 'bg-gradient-to-r from-emerald-600/40 to-lime-500/30 text-lime-300 shadow-sm border border-emerald-400/60'
            : 'text-emerald-300/70 hover:text-emerald-100'
        }`}
      >
        <Leaf className="w-3.5 h-3.5 text-lime-400" />
        <span>Botanical Zen</span>
      </button>

      {/* 2. Eucalyptus & Gold */}
      <button
        onClick={() => onThemeChange('royal')}
        title="Eucalyptus & Gold (Executive luxury with dewy eucalyptus & golden sunbeams)"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          currentTheme === 'royal'
            ? 'bg-gradient-to-r from-[#d4af37]/35 to-[#f3e5ab]/20 text-[#fde68a] shadow-sm border border-[#d4af37]/60'
            : 'text-emerald-300/70 hover:text-amber-200'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-[#e6ca85]" />
        <span>Eucalyptus Gold</span>
      </button>

      {/* 3. Lotus Sanctuary */}
      <button
        onClick={() => onThemeChange('soothing')}
        title="Lotus Sanctuary (White lotus flowers, soft petals & palm fronds)"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          currentTheme === 'soothing'
            ? 'bg-emerald-500/25 text-emerald-200 shadow-sm border border-emerald-300/50'
            : 'text-emerald-300/70 hover:text-emerald-100'
        }`}
      >
        <Flower2 className="w-3.5 h-3.5 text-pink-300" />
        <span>Lotus Petals</span>
      </button>
    </div>
  );
};

