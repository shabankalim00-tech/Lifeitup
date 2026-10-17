import React from 'react';
import { Logo } from './Logo';
import { ArrowRight, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import type { ScoreBand } from '../types';

interface CompletionScreenProps {
  onOpenLeadCapture: () => void;
  isRoyal?: boolean;
  score?: number;
  scoreBand?: ScoreBand | null;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({ 
  onOpenLeadCapture, 
  isRoyal = true,
  score = 36,
  scoreBand
}) => {
  // Default fallback if scoreBand isn't populated yet
  const defaultBand: ScoreBand = {
    id: 'stable',
    min: 33,
    max: 40,
    zone: 'STABLE',
    emoji: '🟢',
    title: "YOU'VE BUILT A FOUNDATION. WHAT'S HOLDING BACK YOUR NEXT LEVEL?",
    badgeTheme: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300',
    headline: 'Your responses suggest relatively positive alignment across several dimensions of life.',
    reassurance: 'A good overall score can sometimes hide one neglected area. That is where your next breakthrough lies.',
    firstMoveTitle: 'YOUR FIRST MOVE',
    firstMoveRule: "Don't chase more. Identify what's missing.",
    firstMoveAdvice: 'Look for the one pillar significantly below your strongest pillar.',
    pathwayTitle: 'YOUR PERSONALISED PATHWAY',
    pathwaySteps: ['REFINE', 'STRENGTHEN', 'SUSTAIN'],
    pathwayDescription: 'Evidence-based refinement across your key dimensions.',
    evidenceNote: 'WHO multidimensional approach aligns personal, environmental, and social health.'
  };

  const activeBand = scoreBand || defaultBand;

  // Zone specific badge styling
  const getZoneBadgeClass = (zone: string) => {
    switch (zone) {
      case 'MODERATE':
        return 'bg-amber-950/70 text-amber-300 border-amber-400/50 shadow-[0_0_16px_rgba(251,191,36,0.25)]';
      case 'STABLE':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-400/50 shadow-[0_0_16px_rgba(52,211,153,0.25)]';
      case 'BALANCED':
        return 'bg-sky-950/70 text-sky-300 border-sky-400/50 shadow-[0_0_16px_rgba(56,189,248,0.25)]';
      case 'LOW':
      default:
        return 'bg-rose-950/70 text-rose-300 border-rose-400/50 shadow-[0_0_16px_rgba(244,63,94,0.25)]';
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between items-center px-4 py-8 sm:py-12 max-w-xl mx-auto text-center">
      {/* Ambient background glow */}
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[480px] h-[320px] blur-[120px] pointer-events-none rounded-full ${
        isRoyal ? 'bg-amber-500/12' : 'bg-emerald-600/15'
      }`} />

      {/* Header */}
      <header className="relative z-10 w-full flex justify-center mb-5">
        <Logo size="md" showTagline={true} variant={isRoyal ? 'gold' : 'emerald'} />
      </header>

      {/* Main Card */}
      <main className={`relative z-10 w-full rounded-3xl p-6 sm:p-9 flex flex-col items-center animate-fade-in ${
        isRoyal ? 'royal-glass-card' : 'luxury-glass-card'
      }`}>
        {/* Step Top Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 mb-5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Diagnostic Complete · Preliminary Score Ready</span>
        </div>

        {/* Visual Score Dial & Status Tier */}
        <div className="flex flex-col items-center mb-5">
          <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center p-2 mb-3 ${
            isRoyal 
              ? 'bg-[#082216]/90 border-2 border-[#d4af37]/60 shadow-[0_0_35px_rgba(212,175,55,0.25)]' 
              : 'bg-emerald-950/90 border-2 border-emerald-400/60 shadow-[0_0_30px_rgba(52,211,153,0.25)]'
          }`}>
            <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold">Your Score</span>
            <div className="flex items-baseline gap-1 my-0.5">
              <span className="text-3xl sm:text-4xl font-display font-bold text-emerald-50">{score}</span>
              <span className="text-xs text-emerald-400/70 font-mono">/ 48</span>
            </div>
            <span className="text-[10px] text-[#fde68a] font-medium">Holistic Scale</span>
          </div>

          {/* Prominent Moderate / Stable Status Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold tracking-wider border ${getZoneBadgeClass(activeBand.zone)}`}>
            <span>{activeBand.emoji || '✨'}</span>
            <span>STATUS: {activeBand.zone}</span>
          </div>
        </div>

        {/* Workbook Title & Headline Insights */}
        <div className="text-center mb-6 max-w-md">
          <h1 className="text-lg sm:text-xl font-display font-medium text-emerald-100 leading-snug mb-2.5">
            "{activeBand.title}"
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed mb-2">
            {activeBand.headline}
          </p>
          {activeBand.reassurance && (
            <p className="text-[11px] sm:text-xs text-[#dfc282] italic leading-relaxed">
              {activeBand.reassurance}
            </p>
          )}
        </div>

        {/* What's in the Full Report (Locked Preview Card) */}
        <div className="w-full max-w-md rounded-2xl p-4 sm:p-5 bg-[#03150e]/80 border border-emerald-800/40 text-left mb-6">
          <div className="flex items-center justify-between border-b border-emerald-800/30 pb-2.5 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#fde68a] uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-[#e6ca85]" />
              <span>Full Personalised Report Ready</span>
            </div>
            <span className="text-[10px] text-emerald-400/70 font-mono">Free Unlock</span>
          </div>

          <ul className="space-y-2 text-xs text-emerald-200/85">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span><strong>6-Pillar Balance Breakdown:</strong> Deep scores for Soul, Mind, Body, Career, Tribe & Impact</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span><strong>7-Day "First Move" Action Plan:</strong> Immediate targeted action tailored to your score</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span><strong>WHO Multidimensional Pathway:</strong> Evidence-based 3-phase trajectory</span>
            </li>
          </ul>

          <p className="text-[11px] text-emerald-400/75 italic mt-3 pt-2.5 border-t border-emerald-900/40">
            Share your contact details in the next step to receive your comprehensive personalized report.
          </p>
        </div>

        {/* Primary CTA Button (Strictly following Section 7) */}
        <button
          onClick={onOpenLeadCapture}
          className={`group w-full max-w-md inline-flex items-center justify-center gap-3 px-8 py-4 sm:py-4.5 rounded-full font-bold text-base sm:text-lg cursor-pointer transition-all ${
            isRoyal 
              ? 'btn-royal-gold' 
              : 'bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 text-emerald-950 shadow-[0_10px_30px_rgba(163,230,53,0.35)] hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <span>Get My Holistic Wellness Score & Report</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
        </button>

        <div className={`flex items-center gap-2 text-xs mt-4 ${
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
