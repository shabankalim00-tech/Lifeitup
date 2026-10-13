import React from 'react';
import { Logo } from './Logo';
import { ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';

interface CompletionScreenProps {
  onOpenLeadCapture: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({ onOpenLeadCapture }) => {
  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center px-4 py-8 sm:py-12 max-w-xl mx-auto text-center">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[320px] bg-emerald-600/15 blur-[120px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="relative z-10 w-full flex justify-center mb-6">
        <Logo size="md" showTagline={true} />
      </header>

      {/* Main Card */}
      <main className="relative z-10 w-full luxury-glass-card rounded-3xl p-6 sm:p-10 flex flex-col items-center animate-fade-in border border-emerald-600/30">
        {/* Animated Completion Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-900/60 border-2 border-lime-400/80 flex items-center justify-center text-lime-300 shadow-[0_0_30px_rgba(163,230,53,0.3)] mb-6">
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
          className="group w-full max-w-md inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-4.5 rounded-full bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 text-emerald-950 font-bold text-base sm:text-lg shadow-[0_10px_30px_rgba(163,230,53,0.35)] hover:shadow-[0_12px_35px_rgba(163,230,53,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Get My Holistic Wellness Score & Report</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center gap-2 text-xs text-emerald-400/70 mt-6">
          <ShieldCheck className="w-4 h-4 text-lime-400" />
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
