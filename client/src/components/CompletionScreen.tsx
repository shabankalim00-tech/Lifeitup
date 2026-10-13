import React from 'react';
import { Logo } from './Logo';
import { ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';

interface CompletionScreenProps {
  onOpenLeadCapture: () => void;
  isRoyal?: boolean;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({ onOpenLeadCapture, isRoyal = true }) => {
  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center px-4 py-8 sm:py-12 max-w-xl mx-auto text-center">
      {/* Ambient background glow */}
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[320px] blur-[120px] pointer-events-none rounded-full ${
        isRoyal ? 'bg-amber-500/12' : 'bg-emerald-600/15'
      }`} />

      {/* Header */}
      <header className="relative z-10 w-full flex justify-center mb-6">
        <Logo size="md" showTagline={true} variant={isRoyal ? 'gold' : 'emerald'} />
      </header>

      {/* Main Card */}
      <main className={`relative z-10 w-full rounded-3xl p-6 sm:p-10 flex flex-col items-center animate-fade-in ${
        isRoyal ? 'royal-glass-card' : 'luxury-glass-card'
      }`}>
        {/* Animated Completion Icon */}
        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-6 ${
          isRoyal 
            ? 'bg-[#082317]/80 border-2 border-[#e6ca85] text-[#fde68a] shadow-[0_0_35px_rgba(212,175,55,0.35)]' 
            : 'bg-emerald-900/60 border-2 border-lime-400/80 text-lime-300 shadow-[0_0_30px_rgba(163,230,53,0.3)]'
        }`}>
          <CheckCircle className="w-9 h-9 sm:w-11 sm:h-11 stroke-[2.2]" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-display font-medium text-emerald-50 mb-4 leading-tight">
          Assessment Completed
        </h1>

        {/* Narrative */}
        <p className="text-emerald-200/90 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
          Your responses across all 6 dimensions of life have been compiled and your holistic score has been calculated.
        </p>

        {/* Primary CTA Button (Strictly following Section 7) */}
        <button
          onClick={onOpenLeadCapture}
          className={`group w-full max-w-md inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-4.5 rounded-full font-bold text-base sm:text-lg cursor-pointer ${
            isRoyal 
              ? 'btn-royal-gold' 
              : 'bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 text-emerald-950 shadow-[0_10px_30px_rgba(163,230,53,0.35)] hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <span>Get My Holistic Wellness Score & Report</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className={`flex items-center gap-2 text-xs mt-6 ${
          isRoyal ? 'text-[#dfc282]/80' : 'text-emerald-400/70'
        }`}>
          <ShieldCheck className={`w-4 h-4 ${isRoyal ? 'text-[#e6ca85]' : 'text-lime-400'}`} />
          <span>Includes personal score breakdown & evidence-based pathway</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center text-xs text-emerald-500/60 pt-6">
        <p>© LifeITUp. Empowering Your Holistic Success.</p>
      </footer>
    </div>
  );
};
