import React from 'react';
import { Leaf, Sparkles, Flower2 } from 'lucide-react';

export type ThemeType = 'botanical' | 'royal' | 'soothing';

interface ThemeSwitcherProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="inline-flex items-center p-1 rounded-full bg-white/90 border border-slate-200/90 backdrop-blur-md shadow-md">
      {/* 1. Botanical Zen (Default White with Corner Botanical Foliage) */}
      <button
        onClick={() => onThemeChange('botanical')}
        title="Botanical White (Default clean aesthetic with corner botanical leaves)"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          currentTheme === 'botanical'
            ? 'bg-emerald-50 text-[#047857] shadow-xs border border-emerald-300'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Leaf className="w-3.5 h-3.5 text-[#059669]" />
        <span>Botanical Zen</span>
      </button>

      {/* 2. Eucalyptus & Gold */}
      <button
        onClick={() => onThemeChange('royal')}
        title="Eucalyptus & Gold (Luxury dark obsidian)"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          currentTheme === 'royal'
            ? 'bg-[#0a2318] text-[#fde68a] shadow-xs border border-[#d4af37]/60'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Eucalyptus Gold</span>
      </button>

      {/* 3. Lotus Sanctuary */}
      <button
        onClick={() => onThemeChange('soothing')}
        title="Lotus Sanctuary"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
          currentTheme === 'soothing'
            ? 'bg-emerald-900 text-emerald-200 shadow-xs border border-emerald-700'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        <Flower2 className="w-3.5 h-3.5 text-pink-500" />
        <span>Lotus Petals</span>
      </button>
    </div>
  );
};
