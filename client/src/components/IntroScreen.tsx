import React from 'react';
import { Logo } from './Logo';
import { PillarIcon } from './PillarIcon';
import { ArrowRight, CheckCircle2, Clock, Sparkles, ShieldCheck, Star } from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
  isRoyal?: boolean;
}

const SIX_DIMENSIONS = [
  { id: 'soul', name: 'Soul', label: 'PURPOSE', desc: 'Meaning beyond routine' },
  { id: 'mind', name: 'Mind', label: 'INNER CALM', desc: 'Clarity under pressure' },
  { id: 'body', name: 'Body', label: 'ENERGY', desc: 'Vitality & recovery' },
  { id: 'career', name: 'Career', label: 'GROWTH', desc: 'Confidence & progress' },
  { id: 'environment', name: 'Environment', label: 'CONNECTION', desc: 'Calm space & support' },
  { id: 'contribution', name: 'Contribution', label: 'IMPACT', desc: 'Uplifting others' }
];

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, isRoyal = true }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between px-4 py-6 sm:py-10 overflow-hidden">
      {/* Top Floating Trust Bar for Instant Client Credibility */}
      <div className="w-full max-w-4xl flex items-center justify-between text-[11px] sm:text-xs py-2 px-4 rounded-full bg-[#03140c]/80 border border-emerald-800/30 backdrop-blur-md mb-6 text-emerald-300/80">
        <div className="flex items-center gap-1.5 text-[#fde68a]">
          <Star className="w-3.5 h-3.5 fill-current text-amber-400" />
          <span className="font-semibold text-emerald-100">4.9 / 5</span>
          <span className="hidden sm:inline text-emerald-400/70">· 20,000+ Assessments Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-emerald-200">WHO Multidimensional Framework</span>
        </div>
      </div>

      {/* Header Branding */}
      <header className="relative z-10 w-full max-w-4xl flex justify-center mb-6">
        <Logo size="lg" showTagline={true} variant={isRoyal ? 'gold' : 'emerald'} />
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center animate-fade-in">
        {/* Prestige Pill Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wider mb-6 shadow-md ${
          isRoyal 
            ? 'bg-[#061e14]/90 border border-[#d4af37]/40 text-[#fde68a]' 
            : 'bg-emerald-950/80 border border-emerald-500/30 text-emerald-300'
        }`}>
          <Clock className={`w-3.5 h-3.5 ${isRoyal ? 'text-[#e6ca85]' : 'text-lime-400'}`} />
          <span>2-MINUTE FULL WELLBEING CHECK</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-medium text-emerald-50 tracking-tight leading-[1.12] mb-6">
          Holistic Wellness <br className="hidden sm:inline" />
          <span className={`italic font-normal ${isRoyal ? 'text-[#f5de9c]' : 'text-emerald-200'}`}>
            Assessment
          </span>
        </h1>

        {/* Opening Message with Emotional Resonance */}
        <div className="text-lg sm:text-xl md:text-2xl text-emerald-100/90 font-light leading-relaxed mb-6 max-w-2xl">
          <p className="font-medium text-emerald-200">You take care of work.</p>
          <p className="font-medium text-emerald-200">You take care of family.</p>
          <p className={`font-semibold mt-2.5 text-2xl sm:text-3xl ${isRoyal ? 'text-[#fde68a]' : 'text-lime-300'}`}>
            But how well are YOU really doing?
          </p>
        </div>

        {/* Supporting Text */}
        <div className="text-sm sm:text-base text-emerald-300/80 mb-10 max-w-xl">
          <p className="font-normal">
            Discover your Wellbeing Score across 6 dimensions of life.
          </p>
          <div className="inline-flex items-center gap-3 mt-2 px-4 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-xs sm:text-sm text-emerald-300 font-medium">
            <span>12 questions</span>
            <span>•</span>
            <span>2 minutes</span>
            <span>•</span>
            <span className={isRoyal ? 'text-[#fde68a] font-semibold' : 'text-lime-300 font-semibold'}>Personalised Report</span>
          </div>
        </div>

        {/* Six Dimensions Bento Grid — Client-Ready Polish */}
        <div className="w-full max-w-3xl mb-10">
          <div className="text-xs uppercase tracking-widest text-[#dfc282] font-semibold mb-4 text-center">
            THE 6 PILLARS OF HOLISTIC SUCCESS
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {SIX_DIMENSIONS.map((dim) => (
              <div
                key={dim.id}
                className={`flex flex-col items-center p-3.5 rounded-2xl transition-all duration-300 group cursor-default ${
                  isRoyal 
                    ? 'bg-[#061e14]/70 border border-[#d4af37]/25 hover:border-[#e6ca85] hover:bg-[#0b2b1d]/90 shadow-md hover:-translate-y-1' 
                    : 'bg-emerald-950/50 border border-emerald-800/40 hover:border-emerald-500/40 hover:bg-emerald-900/40'
                }`}
              >
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 mb-2.5 ${
                  isRoyal 
                    ? 'border-[#d4af37]/40 text-[#f5de9c] bg-[#082217]/60 group-hover:border-[#e6ca85] group-hover:scale-110 shadow-sm' 
                    : 'border-emerald-500/40 text-lime-300 bg-emerald-900/30 group-hover:scale-110'
                }`}>
                  <PillarIcon pillarId={dim.id} className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-emerald-100">
                  {dim.name}
                </span>
                <span className={`text-[10px] uppercase tracking-wider font-bold mt-0.5 ${
                  isRoyal ? 'text-[#dfc282]' : 'text-emerald-400/80'
                }`}>
                  {dim.label}
                </span>
                <span className="text-[10px] text-emerald-400/60 mt-1 leading-tight text-center hidden sm:block">
                  {dim.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* "Before you begin…" Card with Luxury Styling */}
        <div className={`w-full max-w-xl rounded-2xl p-6 sm:p-7 mb-8 text-left ${
          isRoyal ? 'royal-glass-card' : 'luxury-glass-card'
        }`}>
          <div className={`flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3.5 ${
            isRoyal ? 'text-[#f5de9c]' : 'text-lime-300'
          }`}>
            <Sparkles className="w-4 h-4" />
            <span>Before you begin…</span>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            <li className="flex items-start gap-3">
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isRoyal ? 'text-[#e6ca85]' : 'text-emerald-400'}`} />
              <span>Think about your life over the past 30 days—not your ideal self.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isRoyal ? 'text-[#e6ca85]' : 'text-emerald-400'}`} />
              <span>There are no right or wrong answers.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isRoyal ? 'text-[#e6ca85]' : 'text-emerald-400'}`} />
              <span>Choose the response that most honestly reflects your experience.</span>
            </li>
          </ul>
        </div>

        {/* Primary CTA Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={onStart}
            className={`group relative inline-flex items-center justify-center gap-3 px-12 py-4.5 rounded-full font-bold text-base sm:text-lg cursor-pointer transition-all duration-200 ${
              isRoyal 
                ? 'btn-royal-gold' 
                : 'bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 text-emerald-950 shadow-[0_10px_30px_rgba(163,230,53,0.35)] hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <span>I'M READY</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
          </button>

          <div className={`flex items-center gap-2 text-xs mt-4 ${
            isRoyal ? 'text-[#dfc282]/80' : 'text-emerald-400/70'
          }`}>
            <ShieldCheck className="w-4 h-4" />
            <span>Private & confidential · Results generated instantly</span>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full max-w-4xl text-center text-xs text-emerald-500/60 pt-10 pb-2">
        <p>© LifeITUp. Empowering Your Holistic Success.</p>
      </footer>
    </div>
  );
};
