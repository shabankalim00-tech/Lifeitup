import React from 'react';
import { Logo } from './Logo';
import { PillarIcon } from './PillarIcon';
import { ArrowRight, CheckCircle2, Clock, Sparkles, ShieldCheck } from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
}

const SIX_DIMENSIONS = [
  { id: 'soul', name: 'Soul', label: 'PURPOSE' },
  { id: 'mind', name: 'Mind', label: 'INNER CALM' },
  { id: 'body', name: 'Body', label: 'ENERGY' },
  { id: 'career', name: 'Career', label: 'GROWTH' },
  { id: 'environment', name: 'Environment', label: 'CONNECTION' },
  { id: 'contribution', name: 'Contribution', label: 'IMPACT' }
];

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between px-4 py-8 sm:py-12 overflow-hidden">

      {/* Top Header Branding */}
      <header className="relative z-10 w-full max-w-4xl flex justify-center mb-6">
        <Logo size="md" showTagline={true} />
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center animate-fade-in">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium tracking-wide mb-6 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-lime-400" />
          <span>2-MINUTE FULL WELLBEING CHECK</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-medium text-emerald-50 tracking-tight leading-[1.15] mb-6">
          Holistic Wellness <br className="hidden sm:inline" />
          <span className="italic font-normal text-emerald-200">Assessment</span>
        </h1>

        {/* Opening Message from prompt */}
        <div className="text-lg sm:text-xl text-emerald-100/90 font-light leading-relaxed mb-6 max-w-xl">
          <p className="font-medium text-emerald-200">You take care of work.</p>
          <p className="font-medium text-emerald-200">You take care of family.</p>
          <p className="text-lime-300 font-semibold mt-2 text-xl sm:text-2xl">
            But how well are YOU really doing?
          </p>
        </div>

        {/* Supporting Text */}
        <div className="text-sm sm:text-base text-emerald-300/80 mb-8 max-w-lg">
          <p className="font-normal">
            Discover your Wellbeing Score across 6 dimensions of life.
          </p>
          <p className="text-xs sm:text-sm text-emerald-400/90 font-medium mt-1">
            12 questions · 2 minutes · Personalised Report
          </p>
        </div>

        {/* Six Dimensions Display matching the user hero image */}
        <div className="w-full max-w-2xl grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 mb-10">
          {SIX_DIMENSIONS.map((dim) => (
            <div
              key={dim.id}
              className="flex flex-col items-center p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-500/40 hover:bg-emerald-900/40 transition-all duration-200 group"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-emerald-500/40 flex items-center justify-center text-lime-300 group-hover:scale-105 group-hover:border-lime-400 transition-all duration-200 bg-emerald-900/30">
                <PillarIcon pillarId={dim.id} className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-emerald-100 mt-2">
                {dim.name}
              </span>
              <span className="text-[10px] text-emerald-400/70 uppercase tracking-wider font-semibold">
                {dim.label}
              </span>
            </div>
          ))}
        </div>

        {/* "Before you begin…" Card */}
        <div className="w-full max-w-xl luxury-glass-card rounded-2xl p-5 sm:p-6 mb-8 text-left border border-emerald-600/20">
          <div className="flex items-center gap-2 text-lime-300 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Before you begin…</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Think about your life over the past 30 days—not your ideal self.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>There are no right or wrong answers.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Choose the response that most honestly reflects your experience.</span>
            </li>
          </ul>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 text-emerald-950 font-bold text-base sm:text-lg shadow-[0_10px_30px_rgba(163,230,53,0.35)] hover:shadow-[0_12px_35px_rgba(163,230,53,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <span>I'M READY</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400/60 mt-4">
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
