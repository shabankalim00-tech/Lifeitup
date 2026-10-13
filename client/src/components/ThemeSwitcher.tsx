import React from 'react';
import { Sparkles, Moon, Leaf } from 'lucide-react';

export type ThemeType = 'soothing' | 'midnight' | 'botanical';

interface ThemeSwitcherProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="inline-flex items-center p-1 rounded-full bg-emerald-950/70 border border-emerald-700/40 backdrop-blur-md shadow-lg">
      <button
        onClick={() => onThemeChange('soothing')}
        title="Soothing Minimal (Clean, calm & peaceful)"
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
          currentTheme === 'soothing'
            ? 'bg-emerald-500/30 text-lime-300 shadow-sm border border-emerald-400/50'
            : 'text-emerald-400/70 hover:text-emerald-200'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>Soothing Minimal</span>
      </button>

      <button
        onClick={() => onThemeChange('midnight')}
        title="Midnight Gold (Deep executive teal with warm morning sun)"
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
          currentTheme === 'midnight'
            ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-400/50'
            : 'text-emerald-400/70 hover:text-emerald-200'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Midnight Gold</span>
      </button>

      <button
        onClick={() => onThemeChange('botanical')}
        title="Botanical Zen (With garden leaves and zen stones)"
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
          currentTheme === 'botanical'
            ? 'bg-lime-500/20 text-lime-300 shadow-sm border border-lime-400/50'
            : 'text-emerald-400/70 hover:text-emerald-200'
        }`}
      >
        <Leaf className="w-3.5 h-3.5" />
        <span>Botanical Zen</span>
      </button>
    </div>
  );
};
