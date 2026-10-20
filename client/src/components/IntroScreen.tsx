import React from 'react';
import { Logo } from './Logo';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
  isRoyal?: boolean;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart, isRoyal = true }) => {
  return (
    <div className="relative min-h-screen md:h-screen md:max-h-screen flex flex-col justify-between items-center px-4 py-3 sm:py-5 overflow-hidden">
      {/* 1. Header Branding */}
      <header className="relative z-10 w-full max-w-4xl flex justify-center pt-1 sm:pt-2">
        <Logo size="lg" showTagline={true} variant={isRoyal ? 'gold' : 'emerald'} />
      </header>

      {/* 2. Main Hero Container (Compact Single-View Layout) */}
      <main className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center my-auto animate-fade-in py-2">
        {/* Prestige Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider mb-3 bg-[#EBF5EE] border border-[#C2E3CD] text-[#065F46] shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-[#047857]" />
          <span>2-MINUTE FULL WELLBEING CHECK</span>
        </div>

        {/* Main Heading (Authoritative, Clean & Professional) */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[#0A2618] tracking-tight leading-[1.12] mb-2 sm:mb-2.5">
          Holistic Wellness <br className="hidden sm:inline" />
          <span className="text-[#047857]">
            Assessment
          </span>
        </h1>

        {/* Supporting Subhead */}
        <div className="text-xs sm:text-sm text-[#2E4337] mb-4 sm:mb-5 max-w-lg">
          <p className="font-medium leading-relaxed">
            Discover your Wellbeing Score across 6 dimensions of life.
          </p>
          <div className="inline-flex items-center gap-2 sm:gap-3 mt-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#E5DFD3] text-[11px] sm:text-xs text-[#2E4337] font-medium shadow-2xs">
            <span>12 questions</span>
            <span>•</span>
            <span>2 minutes</span>
            <span>•</span>
            <span className="text-[#047857] font-bold">Personalised Report</span>
          </div>
        </div>

        {/* 3. "Before you begin…" Card (Compact & Professional) */}
        <div className="w-full max-w-lg rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6 text-left royal-glass-card shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#065F46] mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Before you begin…</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-[13px] text-[#1A2E24] leading-snug">
            <li className="flex items-start gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669] mt-0.5" />
              <span>Think about your life over the past 30 days—not your ideal self.</span>
            </li>
            <li className="flex items-start gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669] mt-0.5" />
              <span>There are no right or wrong answers.</span>
            </li>
            <li className="flex items-start gap-2.5 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#059669] mt-0.5" />
              <span>Choose the response that most honestly reflects your experience.</span>
            </li>
          </ul>
        </div>

        {/* 4. Primary CTA Button: I'M READY */}
        <div className="flex flex-col items-center">
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-3.5 sm:px-12 sm:py-4 rounded-full font-bold text-base sm:text-lg cursor-pointer transition-all duration-200 btn-royal-gold"
          >
            <span>I'M READY</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
          </button>

          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-[#4A6354] font-medium mt-2.5">
            <ShieldCheck className="w-4 h-4 text-[#059669]" />
            <span>Private & confidential · Results generated instantly</span>
          </div>
        </div>
      </main>

      {/* 5. Footer Branding */}
      <footer className="relative z-10 w-full max-w-4xl text-center text-[11px] sm:text-xs text-[#6B8074] pb-2">
        <p>© LifeITUp. Empowering Your Holistic Success.</p>
      </footer>
    </div>
  );
};
