import React from 'react';
import { Logo } from './Logo';
import { PillarIcon } from './PillarIcon';
import { ArrowRight, CheckCircle2, Clock, Sparkles, ShieldCheck } from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
  isRoyal?: boolean;
}

const SIX_DIMENSIONS = [
  { id: 'soul', name: 'Soul', label: 'PURPOSE' },
  { id: 'mind', name: 'Mind', label: 'INNER CALM' },
  { id: 'body', name: 'Body', label: 'ENERGY' },
  { id: 'career', name: 'Career', label: 'GROWTH' },
  { id: 'environment', name: 'Environment', label: 'CONNECTION' },
  { id: 'contribution', name: 'Contribution', label: 'IMPACT' }
];

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, isRoyal = true }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between px-4 py-8 sm:py-12 overflow-hidden">
      {/* Top Header Branding */}
      <header className="relative z-10 w-full max-w-4xl flex justify-center mb-6">
        <Logo size="md" showTagline={true} variant={isRoyal ? 'gold' : 'emerald'} />
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center animate-fade-in">
        {/* Prestige Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider mb-6 shadow-sm ${
          isRoyal 
            ? 'bg-[#061e14]/85 border border-[#d4af37]/40 text-[#fde68a]' 
            : 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300'
        }`}>
          <Clock className={`w-3.5 h-3.5 ${isRoyal ? 'text-[#e6ca85]' : 'text-lime-400'}`} />
          <span>2-MINUTE FULL WELLBEING CHECK</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-medium text-emerald-50 tracking-tight leading-[1.15] mb-6">
          Holistic Wellness <br className="hidden sm:inline" />
          <span className={`italic font-normal ${isRoyal ? 'text-[#f5de9c]' : 'text-emerald-200'}`}>
            Assessment
          </span>
        </h1>

        {/* Opening Message from prompt */}
        <div className="text-lg sm:text-xl text-emerald-100/90 font-light leading-relaxed mb-6 max-w-xl">
          <p className="font-medium text-emerald-200">You take care of work.</p>
          <p className="font-medium text-emerald-200">You take care of family.</p>
          <p className={`font-semibold mt-2 text-xl sm:text-2xl ${isRoyal ? 'text-[#fde68a]' : 'text-lime-300'}`}>
            But how well are YOU really doing?
          </p>
        </div>

        {/* Supporting Text */}
        <div className="text-sm sm:text-base text-emerald-300/80 mb-8 max-w-lg">
          <p className="font-normal">
            Discover your Wellbeing Score across 6 dimensions of life.
          </p>
          <p className={`text-xs sm:text-sm font-medium mt-1 ${isRoyal ? 'text-[#dfc282]' : 'text-emerald-400/90'}`}>
            12 questions · 2 minutes · Personalised Report
          </p>
        </div>

        {/* Six Dimensions Display */}
        <div className="w-full max-w-2xl grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 mb-10">
          {SIX_DIMENSIONS.map((dim) => (
            <div
              key={dim.id}
              className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-200 group ${
                isRoyal 
                  ? 'bg-[#061e14]/65 border border-[#d4af37]/25 hover:border-[#e6ca85] hover:bg-[#0b2b1d]/80' 
                  : 'bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-500/40 hover:bg-emerald-900/40'
              }`}
            >
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center transition-all duration-200 ${
                isRoyal 
                  ? 'border-[#d4af37]/40 text-[#f5de9c] bg-[#082217]/50 group-hover:border-[#e6ca85] group-hover:scale-105' 
                  : 'border-emerald-500/40 text-lime-300 bg-emerald-900/30 group-hover:scale-105 group-hover:border-lime-400'
              }`}>
                <PillarIcon pillarId={dim.id} className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-emerald-100 mt-2">
                {dim.name}
              </span>
              <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                isRoyal ? 'text-[#dfc282]/80' : 'text-emerald-400/70'
              }`}>
                {dim.label}
              </span>
            </div>
          ))}
        </div>

        {/* "Before you begin…" Card */}
        <div className={`w-full max-w-xl rounded-2xl p-5 sm:p-6 mb-8 text-left ${
          isRoyal ? 'royal-glass-card' : 'luxury-glass-card'
        }`}>
          <div className={`flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 ${
            isRoyal ? 'text-[#f5de9c]' : 'text-lime-300'
          }`}>
            <Sparkles className="w-4 h-4" />
            <span>Before you begin…</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isRoyal ? 'text-[#e6ca85]' : 'text-emerald-400'}`} />
              <span>Think about your life over the past 30 days—not your ideal self.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isRoyal ? 'text-[#e6ca85]' : 'text-emerald-400'}`} />
              <span>There are no right or wrong answers.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isRoyal ? 'text-[#e6ca85]' : 'text-emerald-400'}`} />
              <span>Choose the response that most honestly reflects your experience.</span>
            </li>
          </ul>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={onStart}
          className={`group relative inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full font-bold text-base sm:text-lg cursor-pointer ${
            isRoyal 
              ? 'btn-royal-gold' 
              : 'bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 text-emerald-950 shadow-[0_10px_30px_rgba(163,230,53,0.35)] hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <span>I'M READY</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>

        <div className={`flex items-center gap-1.5 text-xs mt-4 ${
          isRoyal ? 'text-[#dfc282]/75' : 'text-emerald-400/60'
        }`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Private, confidential & takes only 2 minutes</span>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full max-w-4xl text-center text-xs text-emerald-500/60 pt-8 pb-2">
        <p>© LifeITUp. Empowering Your Holistic Success.</p>
      </footer>
    </div>
  );
};
